import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-stitch-signature",
};

const SHOPIFY_STORE_DOMAIN = "luna-hair-boutique-9dwzm.myshopify.com";
const SHOPIFY_API_VERSION = "2024-10";

// Stitch Express webhook payload types
interface StitchExpressWebhookPayload {
  id?: string;
  paymentLinkId?: string;
  externalReference?: string;
  status?: string;
  amount?: number;
  currency?: string;
  createdAt?: string;
  completedAt?: string;
  // Nested structure format
  data?: {
    id?: string;
    externalReference?: string;
    status?: string;
    payment?: {
      id?: string;
      status?: string;
      externalReference?: string;
    };
  };
}

async function createShopifyOrder(orderData: any, shopifyAccessToken: string): Promise<any> {
  // Build customer object if name is provided
  let customerData = undefined;
  if (orderData.customer_name) {
    const nameParts = orderData.customer_name.split(" ");
    customerData = {
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",
      email: orderData.customer_email,
    };
  }

  // Extract shipping address from configuration if present
  const shippingAddress = orderData.configuration?.shipping_address;
  const customerPhone = orderData.configuration?.phone;
  
  // Build Shopify shipping address
  let shopifyShippingAddress = undefined;
  if (shippingAddress) {
    const nameParts = (orderData.customer_name || "").split(" ");
    shopifyShippingAddress = {
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",
      address1: shippingAddress.street || "",
      city: shippingAddress.city || "",
      province: shippingAddress.province || "",
      zip: shippingAddress.postalCode || "",
      country: shippingAddress.country || "South Africa",
      phone: customerPhone || "",
    };
  }

  // Build line item properties, excluding internal fields
  const lineItemProperties = [
    { name: "Base Bundle", value: orderData.base_bundle },
    { name: "Base Price", value: `R${orderData.base_price}` },
    { name: "Add-ons", value: `R${orderData.addon_cost}` },
    { name: "SKU", value: orderData.custom_sku || "LUNA-CUSTOM" },
    { name: "Free Shipping", value: "Included" },
    ...Object.entries(orderData.configuration || {})
      .filter(([key]) => 
        key !== "Base Bundle" && 
        key !== "SKU" && 
        key !== "Free Shipping" && 
        key !== "phone" && 
        key !== "shipping_address"
      )
      .map(([key, value]) => ({ name: key, value: String(value) })),
  ];

  const orderPayload: {
    order: {
      email: string;
      financial_status: string;
      fulfillment_status: null;
      send_receipt: boolean;
      send_fulfillment_receipt: boolean;
      note: string;
      tags: string;
      line_items: any[];
      shipping_lines: any[];
      transactions: any[];
      customer?: any;
      shipping_address?: any;
      phone?: string;
    };
  } = {
    order: {
      email: orderData.customer_email,
      financial_status: "paid",
      fulfillment_status: null,
      send_receipt: true,
      send_fulfillment_receipt: true,
      note: `Custom Wig Order - ${orderData.order_reference}\nPayment Method: Stitch Express Pay By Bank\nConfiguration: ${JSON.stringify(orderData.configuration)}`,
      tags: "custom-wig,stitch-express-payment",
      line_items: [
        {
          title: `Custom Luna Luxury Wig - ${orderData.base_bundle}`,
          quantity: 1,
          price: orderData.total_price.toString(),
          requires_shipping: true,
          taxable: true,
          properties: lineItemProperties,
        },
      ],
      shipping_lines: [
        {
          title: "Free Shipping (Custom Wig)",
          price: "0.00",
          code: "FREE_SHIPPING",
        },
      ],
      transactions: [
        {
          kind: "sale",
          status: "success",
          amount: orderData.total_price.toString(),
          gateway: "Stitch Express Pay By Bank",
        },
      ],
    },
  };

  if (customerData) {
    orderPayload.order.customer = customerData;
  }

  if (shopifyShippingAddress) {
    orderPayload.order.shipping_address = shopifyShippingAddress;
  }

  if (customerPhone) {
    orderPayload.order.phone = customerPhone;
  }

  const customerId = await findOrCreateShopifyCustomer(
    orderData,
    shopifyAccessToken,
    shopifyShippingAddress,
    customerPhone
  );

  if (customerId) {
    orderPayload.order.customer = { id: customerId };
  }

  console.log("Creating Shopify order:", JSON.stringify(orderPayload, null, 2));

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyAccessToken,
      },
      body: JSON.stringify(orderPayload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Shopify order creation failed:", errorText);
    throw new Error(`Failed to create Shopify order: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Shopify order created:", data.order?.id, data.order?.name);
  return data.order;
}

async function findOrCreateShopifyCustomer(
  orderData: any,
  shopifyAccessToken: string,
  shopifyShippingAddress?: {
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    phone: string;
  },
  customerPhone?: string
): Promise<number | null> {
  const customerEmail = orderData.customer_email;
  if (!customerEmail) {
    return null;
  }

  const searchQuery = encodeURIComponent(`email:${customerEmail}`);
  const searchResponse = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/search.json?query=${searchQuery}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyAccessToken,
      },
    }
  );

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    console.error("Shopify customer search failed:", errorText);
    throw new Error(`Failed to search Shopify customer: ${searchResponse.status} - ${errorText}`);
  }

  const searchData = await searchResponse.json();
  const existingCustomer = searchData.customers?.[0];
  if (existingCustomer?.id) {
    return existingCustomer.id;
  }

  const nameParts = (orderData.customer_name || "").split(" ");
  const customerPayload = {
    customer: {
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",
      email: customerEmail,
      phone: customerPhone || "",
      addresses: shopifyShippingAddress ? [shopifyShippingAddress] : [],
    },
  };

  const createResponse = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyAccessToken,
      },
      body: JSON.stringify(customerPayload),
    }
  );

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error("Shopify customer creation failed:", errorText);
    throw new Error(`Failed to create Shopify customer: ${createResponse.status} - ${errorText}`);
  }

  const createData = await createResponse.json();
  return createData.customer?.id ?? null;
}

async function sendPaymentConfirmationEmail(orderData: any): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not configured, skipping confirmation email");
    return;
  }

  const emailHtml = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fafafa; padding: 40px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a1a1a; font-size: 28px; margin: 0;">Luna Lux Studio</h1>
        <p style="color: #666; font-size: 14px; margin-top: 5px;">Premium Hair Boutique</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <h2 style="color: #1a1a1a; font-size: 22px; margin-bottom: 20px;">Payment Confirmed! ✨</h2>
        
        <p style="color: #333; line-height: 1.6;">
          Dear ${orderData.customer_name || 'Valued Customer'},
        </p>
        
        <p style="color: #333; line-height: 1.6;">
          Thank you for your order! Your payment has been successfully processed and we're excited to start crafting your custom wig.
        </p>
        
        <div style="background: #f8f4f0; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 16px;">Order Details</h3>
          <p style="margin: 5px 0; color: #555;"><strong>Order Reference:</strong> ${orderData.order_reference}</p>
          <p style="margin: 5px 0; color: #555;"><strong>Base Bundle:</strong> ${orderData.base_bundle}</p>
          <p style="margin: 5px 0; color: #555;"><strong>Total:</strong> R${orderData.total_price.toFixed(2)}</p>
        </div>
        
        <p style="color: #333; line-height: 1.6;">
          Our production team will begin working on your custom piece shortly. You'll receive updates as your order progresses.
        </p>
        
        <p style="color: #333; line-height: 1.6;">
          If you have any questions, please don't hesitate to contact us at <a href="mailto:info@lunaluxhair.com" style="color: #d4a574;">info@lunaluxhair.com</a>
        </p>
        
        <p style="color: #333; line-height: 1.6; margin-top: 30px;">
          With love,<br/>
          <strong>The Luna Lux Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Luna Lux Studio. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Luna Lux Studio <info@lunaluxhair.com>",
        to: [orderData.customer_email],
        subject: `Payment Confirmed - Order ${orderData.order_reference}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send confirmation email:", errorText);
    } else {
      console.log("Confirmation email sent to:", orderData.customer_email);
    }
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");

    const payload: StitchExpressWebhookPayload = await req.json();
    console.log("Stitch Express webhook received:", JSON.stringify(payload, null, 2));

    // Extract external reference from various possible locations
    const externalReference = 
      payload.externalReference || 
      payload.data?.externalReference || 
      payload.data?.payment?.externalReference;

    // Extract status from various possible locations
    const status = 
      payload.status || 
      payload.data?.status || 
      payload.data?.payment?.status;

    if (!externalReference) {
      console.log("No external reference found in webhook, ignoring");
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("Processing payment for order:", externalReference, "Status:", status);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the order from database
    const { data: orderData, error: orderError } = await supabase
      .from("custom_wig_orders")
      .select("*")
      .eq("order_reference", externalReference)
      .single();

    if (orderError || !orderData) {
      console.error("Order not found:", externalReference, orderError);
      return new Response(JSON.stringify({ error: "Order not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Handle different payment statuses (Stitch Express uses lowercase statuses)
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === "complete" || normalizedStatus === "completed" || normalizedStatus === "success" || normalizedStatus === "paid") {
      console.log("Payment completed for order:", externalReference);

      // Update order status
      await supabase
        .from("custom_wig_orders")
        .update({
          payment_status: "paid",
          status: "processing",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("order_reference", externalReference);

      // Create Shopify order
      if (shopifyAccessToken) {
        try {
          const shopifyOrder = await createShopifyOrder(orderData, shopifyAccessToken);
          
          // Update with Shopify order ID
          await supabase
            .from("custom_wig_orders")
            .update({
              shopify_order_id: shopifyOrder.id.toString(),
              shopify_order_number: shopifyOrder.name,
              updated_at: new Date().toISOString(),
            })
            .eq("order_reference", externalReference);

          console.log("Shopify order created:", shopifyOrder.name);
        } catch (shopifyError) {
          console.error("Failed to create Shopify order:", shopifyError);
          // Don't fail the webhook - payment was successful
        }
      } else {
        console.warn("SHOPIFY_ACCESS_TOKEN not configured, skipping Shopify order creation");
      }

      // Send confirmation email
      await sendPaymentConfirmationEmail(orderData);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Payment processed successfully",
          orderReference: externalReference,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (normalizedStatus === "cancelled" || normalizedStatus === "canceled") {
      console.log("Payment cancelled for order:", externalReference);

      await supabase
        .from("custom_wig_orders")
        .update({
          payment_status: "cancelled",
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("order_reference", externalReference);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Payment cancellation recorded",
          orderReference: externalReference,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (normalizedStatus === "expired") {
      console.log("Payment expired for order:", externalReference);

      await supabase
        .from("custom_wig_orders")
        .update({
          payment_status: "expired",
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("order_reference", externalReference);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Payment expiration recorded",
          orderReference: externalReference,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (normalizedStatus === "failed") {
      console.log("Payment failed for order:", externalReference);

      await supabase
        .from("custom_wig_orders")
        .update({
          payment_status: "failed",
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("order_reference", externalReference);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Payment failure recorded",
          orderReference: externalReference,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // For pending or unknown states, just acknowledge
    console.log("Webhook acknowledged, status:", status);
    return new Response(
      JSON.stringify({ received: true, status: status }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Webhook processing failed";
    console.error("Stitch Express webhook error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
