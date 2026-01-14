import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STITCH_API_URL = "https://api.stitch.money/graphql";
const STITCH_TOKEN_URL = "https://secure.stitch.money/connect/token";

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

interface PaymentRequest {
  customWigItems: CustomWigItem[];
  regularItems: RegularItem[];
  customerEmail: string;
  customerName?: string;
  redirectUrl: string;
}

async function getStitchAccessToken(): Promise<string> {
  const clientId = Deno.env.get("STITCH_EXPRESS_CLIENT_ID");
  const clientSecret = Deno.env.get("STITCH_EXPRESS_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Stitch credentials not configured");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    scope: "client_paymentrequest",
    audience: "https://secure.stitch.money/connect/token",
    client_secret: clientSecret,
  });

  const response = await fetch(STITCH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Stitch token error:", errorText);
    throw new Error(`Failed to get Stitch access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
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
    const { customWigItems, regularItems, customerEmail, customerName, redirectUrl }: PaymentRequest = await req.json();

    console.log("Creating Stitch payment:", {
      customWigItemCount: customWigItems?.length || 0,
      regularItemCount: regularItems?.length || 0,
      customerEmail,
    });

    // Calculate total amount in cents (ZAR)
    let totalAmount = 0;
    
    if (customWigItems && customWigItems.length > 0) {
      for (const item of customWigItems) {
        totalAmount += item.totalPrice * item.quantity * 100; // Convert to cents
      }
    }

    if (regularItems && regularItems.length > 0) {
      for (const item of regularItems) {
        totalAmount += item.price * item.quantity * 100; // Convert to cents
      }
    }

    if (totalAmount <= 0) {
      throw new Error("No items provided for payment");
    }

    // Generate unique order reference
    const orderReference = generateOrderReference();
    
    // Payer reference must be 12 characters or less
    const payerReference = orderReference.substring(0, 12);
    // Beneficiary reference must be 20 characters or less
    const beneficiaryReference = orderReference;

    // Get Stitch access token
    const accessToken = await getStitchAccessToken();

    // Create payment initiation request using Stitch GraphQL API
    const mutation = `
      mutation CreatePaymentRequest(
        $amount: MoneyInput!,
        $payerReference: String!,
        $beneficiaryReference: String!,
        $externalReference: String
      ) {
        clientPaymentInitiationRequestCreate(input: {
          amount: $amount,
          payerReference: $payerReference,
          beneficiaryReference: $beneficiaryReference,
          externalReference: $externalReference
        }) {
          paymentInitiationRequest {
            id
            url
          }
        }
      }
    `;

    const variables = {
      amount: {
        quantity: totalAmount,
        currency: "ZAR",
      },
      payerReference,
      beneficiaryReference,
      externalReference: orderReference,
    };

    console.log("Stitch payment request:", JSON.stringify(variables, null, 2));

    const graphqlResponse = await fetch(STITCH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    if (!graphqlResponse.ok) {
      const errorText = await graphqlResponse.text();
      console.error("Stitch API error:", errorText);
      throw new Error(`Stitch API error: ${graphqlResponse.status}`);
    }

    const graphqlData = await graphqlResponse.json();
    
    if (graphqlData.errors) {
      console.error("Stitch GraphQL errors:", graphqlData.errors);
      throw new Error(`Stitch error: ${graphqlData.errors.map((e: any) => e.message).join(", ")}`);
    }

    const paymentRequest = graphqlData.data?.clientPaymentInitiationRequestCreate?.paymentInitiationRequest;
    
    if (!paymentRequest?.url) {
      console.error("No payment URL returned:", graphqlData);
      throw new Error("Failed to create payment request - no URL returned");
    }

    console.log("Stitch payment created:", {
      id: paymentRequest.id,
      url: paymentRequest.url,
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
        payment_link_id: paymentRequest.id,
        customer_email: customerEmail,
        customer_name: customerName || null,
        base_bundle: customWigItems?.[0]?.baseBundle || "N/A",
        base_price: customWigItems?.[0]?.basePrice || 0,
        addon_cost: customWigItems?.[0]?.addonCost || 0,
        total_price: totalAmount / 100, // Convert back to rands
        configuration: configuration,
        custom_sku: customWigItems?.[0]?.customSku || null,
        status: "pending",
        payment_status: "pending",
        payment_method: "stitch",
      };

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
        console.log("Order stored in database:", orderReference);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: paymentRequest.url,
        paymentId: paymentRequest.id,
        orderReference,
        totalAmount: totalAmount / 100,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create payment";
    console.error("Error creating Stitch payment:", error);
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
