import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STITCH_EXPRESS_URL = "https://express.stitch.money";
const SHIPPING_RATE_ZAR = 150; // R150 flat rate for South Africa via The Courier Guy

interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  variantId: string;
  variantTitle: string;
  isCustomWig?: boolean;
  customSku?: string;
}

interface CheckoutRequest {
  items: CartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  discountCode?: string;
  redirectUrl: string;
}

async function getStitchExpressToken(): Promise<string> {
  const clientId = Deno.env.get("STITCH_EXPRESS_CLIENT_ID");
  const clientSecret = Deno.env.get("STITCH_EXPRESS_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Stitch Express credentials not configured");
  }

  const response = await fetch(`${STITCH_EXPRESS_URL}/api/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId,
      clientSecret,
      scope: "client_paymentrequest",
    }),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Token error: ${response.status} - ${responseText}`);
  }

  const data = JSON.parse(responseText);
  const token = data.data?.accessToken || data.accessToken || data.access_token || data.token;
  if (!token) throw new Error("No access token in response");
  return token;
}

function generateOrderReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LL-${timestamp}-${random}`;
}

async function validateDiscount(supabase: any, code: string, subtotal: number): Promise<{ valid: boolean; discount_amount: number; discount_id?: string }> {
  if (!code) return { valid: false, discount_amount: 0 };

  const { data, error } = await supabase
    .from("cms_discounts")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !data) return { valid: false, discount_amount: 0 };

  // Check max uses
  if (data.max_uses && data.uses_count >= data.max_uses) return { valid: false, discount_amount: 0 };

  // Check min order amount
  if (data.min_order_amount && subtotal < data.min_order_amount) return { valid: false, discount_amount: 0 };

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) return { valid: false, discount_amount: 0 };

  // Calculate discount
  let discount_amount = 0;
  if (data.discount_type === "percentage") {
    discount_amount = Math.round(subtotal * (data.discount_value / 100) * 100) / 100;
  } else {
    discount_amount = Math.min(data.discount_value, subtotal);
  }

  return { valid: true, discount_amount, discount_id: data.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CheckoutRequest = await req.json();
    const { items, customerName, customerEmail, customerPhone, shippingAddress, discountCode, redirectUrl } = body;

    if (!items || items.length === 0) throw new Error("No items provided");
    if (!customerEmail) throw new Error("Customer email is required");
    if (!customerName) throw new Error("Customer name is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check for custom wig (free shipping)
    const hasCustomWig = items.some(item => item.isCustomWig);
    const shippingCost = hasCustomWig ? 0 : SHIPPING_RATE_ZAR;

    // Validate discount code
    let discountAmount = 0;
    let discountId: string | undefined;
    if (discountCode) {
      const discountResult = await validateDiscount(supabase, discountCode, subtotal);
      if (discountResult.valid) {
        discountAmount = discountResult.discount_amount;
        discountId = discountResult.discount_id;
      }
    }

    // Calculate total
    const total = Math.max(0, subtotal + shippingCost - discountAmount);
    const totalCents = Math.round(total * 100);

    const orderReference = generateOrderReference();

    console.log("Creating payment:", {
      orderReference,
      subtotal,
      shippingCost,
      discountAmount,
      total,
      itemCount: items.length,
    });

    // Get Stitch token
    const accessToken = await getStitchExpressToken();

    // Build description
    const description = items.map(i => `${i.title} ×${i.quantity}`).join(", ").substring(0, 100) || "Luna Lux Hair Order";

    // Create payment link
    const paymentPayload: Record<string, any> = {
      amount: totalCents,
      currency: "ZAR",
      payerName: customerName,
      merchantReference: orderReference,
      description,
    };

    if (redirectUrl) paymentPayload.redirectUrl = redirectUrl;
    if (customerEmail) paymentPayload.payerEmail = customerEmail;

    const paymentResponse = await fetch(`${STITCH_EXPRESS_URL}/api/v1/payment-links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      throw new Error(`Stitch API error: ${paymentResponse.status} - ${errorText}`);
    }

    const paymentData = await paymentResponse.json();
    const payment = paymentData.data?.payment || paymentData.payment || paymentData;
    const paymentUrl = payment.link || payment.url || paymentData.url || paymentData.link;
    const paymentId = payment.id || paymentData.id;

    if (!paymentUrl) throw new Error("No payment URL returned");

    // Create order in cms_orders
    const orderItems = items.map(item => ({
      productId: item.productId,
      title: item.title,
      variantId: item.variantId,
      variantTitle: item.variantTitle,
      price: item.price,
      quantity: item.quantity,
      isCustomWig: item.isCustomWig || false,
      customSku: item.customSku || null,
    }));

    const { error: orderError } = await supabase.from("cms_orders").insert({
      order_number: orderReference,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      items: orderItems,
      subtotal,
      discount_amount: discountAmount,
      discount_code: discountCode?.toUpperCase() || null,
      shipping_cost: shippingCost,
      total,
      status: "pending",
      payment_status: "unpaid",
      payment_method: "stitch_express",
      shipping_address: shippingAddress,
      notes: paymentId ? `Payment Link ID: ${paymentId}` : null,
    });

    if (orderError) {
      console.error("Failed to create order:", orderError);
    } else {
      console.log("Order created:", orderReference);
    }

    // Create/update customer in cms_customers
    const { data: existingCustomer } = await supabase
      .from("cms_customers")
      .select("id, total_orders, total_spent")
      .eq("email", customerEmail)
      .single();

    if (existingCustomer) {
      await supabase.from("cms_customers").update({
        name: customerName,
        phone: customerPhone,
        address: shippingAddress,
        total_orders: (existingCustomer.total_orders || 0) + 1,
        total_spent: (existingCustomer.total_spent || 0) + total,
      }).eq("id", existingCustomer.id);
    } else {
      await supabase.from("cms_customers").insert({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: shippingAddress,
        total_orders: 1,
        total_spent: total,
      });
    }

    // Increment discount usage if applicable
    if (discountId) {
      await supabase.rpc("increment_discount_usage", { discount_id: discountId }).catch(() => {
        // Fallback: update directly
        supabase.from("cms_discounts").update({ uses_count: (discountAmount > 0 ? 1 : 0) }).eq("id", discountId);
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl,
        paymentId,
        orderReference,
        totalAmount: total,
        subtotal,
        shippingCost,
        discountAmount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Payment creation failed";
    console.error("Payment error:", error);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
