// Stitch Express Payment Integration - v3 (server-side pricing)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { computeCustomWigUnitPrice } from "../_shared/wig-pricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Stitch Express API endpoints
const STITCH_EXPRESS_URL = "https://express.stitch.money";

const SHOPIFY_STORE_DOMAIN = "lunaluxstudio-yi8zs.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";

// Fetch the canonical price (ZAR) for a Shopify variant via the Storefront API.
async function fetchShopifyVariantPrice(variantGid: string): Promise<number> {
  const token = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN") ||
    Deno.env.get("VITE_SHOPIFY_STOREFRONT_TOKEN");
  if (!token) throw new Error("Shopify Storefront token not configured");

  const gid = variantGid.startsWith("gid://")
    ? variantGid
    : `gid://shopify/ProductVariant/${variantGid}`;

  const query = `query($id: ID!) { node(id: $id) { ... on ProductVariant { price { amount currencyCode } } } }`;

  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables: { id: gid } }),
    }
  );
  if (!res.ok) throw new Error(`Shopify variant lookup failed: ${res.status}`);
  const data = await res.json();
  const amount = data?.data?.node?.price?.amount;
  if (!amount) throw new Error(`Unknown Shopify variant: ${variantGid}`);
  return parseFloat(amount);
}


interface CustomWigItem {
  quantity: number;
  title: string;
  baseBundle: string;
  basePrice: number;
  addonCost: number;
  totalPrice: number;
  configuration: string;
  customSku: string;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface RegularItem {
  quantity: number;
  variantId: string;
  title: string;
  price: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface PaymentRequest {
  customWigItems: CustomWigItem[];
  regularItems: RegularItem[];
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: ShippingAddress | null;
  redirectUrl: string;
}

async function getStitchExpressToken(): Promise<string> {
  const clientId = Deno.env.get("STITCH_EXPRESS_CLIENT_ID");
  const clientSecret = Deno.env.get("STITCH_EXPRESS_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Stitch Express credentials not configured");
  }

  console.log("Getting Stitch Express token with client_id:", clientId?.substring(0, 8) + "...");

  // Try with scope parameter for payment link creation
  const tokenPayload = {
    clientId,
    clientSecret,
    scope: "client_paymentrequest",
  };

  const response = await fetch(`${STITCH_EXPRESS_URL}/api/v1/token`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tokenPayload),
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    console.error("Stitch Express token error:", responseText);
    throw new Error(`Failed to get Stitch Express access token: ${response.status} - ${responseText}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error("Failed to parse token response:", responseText);
    throw new Error("Invalid token response from Stitch Express");
  }
  
  console.log("Stitch Express token response keys:", Object.keys(data));
  
  // Token is nested in data.data.accessToken
  const token = data.data?.accessToken || data.accessToken || data.access_token || data.token;
  if (!token) {
    console.error("No token in response. Full response:", JSON.stringify(data).substring(0, 500));
    throw new Error("No access token in Stitch Express response");
  }
  
  console.log("Stitch Express token obtained successfully, length:", token.length);
  return token;
}

function generateOrderReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LUNA-${timestamp}-${random}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customWigItems, regularItems, customerEmail, customerName, customerPhone, shippingAddress, redirectUrl }: PaymentRequest = await req.json();

    console.log("Creating Stitch Express payment:", {
      customWigItemCount: customWigItems?.length || 0,
      regularItemCount: regularItems?.length || 0,
      customerEmail,
      customerName,
      hasShippingAddress: !!shippingAddress,
      redirectUrl,
    });

    // Calculate total amount in cents (ZAR) — SERVER-SIDE PRICING ONLY.
    // Client-supplied prices are NEVER trusted.
    let totalAmountCents = 0;

    if (customWigItems && customWigItems.length > 0) {
      for (const item of customWigItems) {
        const qty = Math.max(1, Math.min(50, Math.floor(Number(item.quantity) || 1)));
        let unitPrice: number;
        try {
          unitPrice = computeCustomWigUnitPrice(item.selectedOptions || []);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Invalid wig configuration";
          return new Response(
            JSON.stringify({ success: false, error: msg }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        // Overwrite client-supplied totalPrice with server value (used later when storing).
        item.totalPrice = unitPrice;
        item.quantity = qty;
        totalAmountCents += Math.round(unitPrice * qty * 100);
      }
    }

    if (regularItems && regularItems.length > 0) {
      for (const item of regularItems) {
        const qty = Math.max(1, Math.min(50, Math.floor(Number(item.quantity) || 1)));
        try {
          const unitPrice = await fetchShopifyVariantPrice(item.variantId);
          item.price = unitPrice;
          item.quantity = qty;
          totalAmountCents += Math.round(unitPrice * qty * 100);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Invalid product variant";
          return new Response(
            JSON.stringify({ success: false, error: msg }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
      }
    }

    if (totalAmountCents <= 0) {
      throw new Error("No items provided for payment");
    }


    // Generate unique order reference
    const orderReference = generateOrderReference();

    console.log("Payment details:", {
      orderReference,
      totalAmountCents,
      totalAmountRands: totalAmountCents / 100,
    });

    // Get Stitch Express access token
    const accessToken = await getStitchExpressToken();

    // Build description from items
    const itemDescriptions: string[] = [];
    if (customWigItems && customWigItems.length > 0) {
      for (const item of customWigItems) {
        itemDescriptions.push(`${item.title} (${item.baseBundle})`);
      }
    }
    if (regularItems && regularItems.length > 0) {
      for (const item of regularItems) {
        itemDescriptions.push(item.title);
      }
    }
    const description = itemDescriptions.join(", ").substring(0, 100) || "Luna Lux Hair Order";

    // Create payment link using Stitch Express REST API
    // Required fields: amount, payerName, merchantReference
    const paymentLinkPayload: Record<string, any> = {
      amount: totalAmountCents,
      currency: "ZAR",
      payerName: customerName || customerEmail?.split('@')[0] || "Customer",
      merchantReference: orderReference,
      description: description,
    };

    // Only add redirectUrl if provided - it may need to be registered first
    if (redirectUrl) {
      paymentLinkPayload.redirectUrl = redirectUrl;
    }
    
    // Add customer email if provided
    if (customerEmail) {
      paymentLinkPayload.payerEmail = customerEmail;
    }

    console.log("Creating Stitch Express payment link:", JSON.stringify(paymentLinkPayload, null, 2));

    const paymentResponse = await fetch(`${STITCH_EXPRESS_URL}/api/v1/payment-links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(paymentLinkPayload),
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error("Stitch Express API error:", errorText);
      throw new Error(`Stitch Express API error: ${paymentResponse.status} - ${errorText}`);
    }

    const paymentData = await paymentResponse.json();
    
    console.log("Stitch Express payment link created:", JSON.stringify(paymentData, null, 2));

    // The response is nested: { success: true, data: { payment: { id, link, ... } } }
    const payment = paymentData.data?.payment || paymentData.payment || paymentData;
    const paymentUrl = payment.link || payment.url || paymentData.url || paymentData.link;
    const paymentId = payment.id || paymentData.id;
    const merchantRef = payment.merchantReference || orderReference;

    if (!paymentUrl) {
      console.error("No payment URL in response:", paymentData);
      throw new Error("Failed to create payment link - no URL returned");
    }

    console.log("Payment link created successfully:", {
      id: paymentId,
      url: paymentUrl,
      orderReference,
    });

    // Store order details in database for webhook processing
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseKey) {
      // Build configuration object
      const configuration: Record<string, any> = {};
      
      if (customWigItems && customWigItems.length > 0) {
        const wigItem = customWigItems[0];
        wigItem.selectedOptions.forEach(opt => {
          configuration[opt.name] = opt.value;
        });
      }

      const orderData = {
        order_reference: orderReference,
        payment_link_id: paymentId,
        customer_email: customerEmail || "",
        customer_name: customerName || null,
        base_bundle: customWigItems?.[0]?.baseBundle || "N/A",
        base_price: customWigItems?.[0]?.basePrice || 0,
        addon_cost: customWigItems?.[0]?.addonCost || 0,
        total_price: totalAmountCents / 100, // Convert back to rands
        configuration: {
          ...configuration,
          phone: customerPhone || null,
          shipping_address: shippingAddress || null,
        },
        custom_sku: customWigItems?.[0]?.customSku || null,
        status: "pending",
        payment_status: "pending",
        payment_method: "stitch_express",
      };

      console.log("Storing order in database:", orderReference);

      const dbResponse = await fetch(`${supabaseUrl}/rest/v1/custom_wig_orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify(orderData),
      });

      if (!dbResponse.ok) {
        const dbError = await dbResponse.text();
        console.error("Failed to store order:", dbError);
        // Continue anyway - payment link is created
      } else {
        console.log("Order stored in database successfully:", orderReference);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: paymentUrl,
        paymentId: paymentId,
        orderReference,
        totalAmount: totalAmountCents / 100,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create payment";
    console.error("Error creating Stitch Express payment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
