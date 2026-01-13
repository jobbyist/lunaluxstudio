import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STITCH_EXPRESS_API_URL = "https://express.stitch.money";
const STITCH_EXPRESS_CLIENT_ID = Deno.env.get("STITCH_EXPRESS_CLIENT_ID");
const STITCH_EXPRESS_CLIENT_SECRET = Deno.env.get("STITCH_EXPRESS_CLIENT_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

interface CheckoutRequest {
  customWigItems: CustomWigItem[];
  regularItems: RegularItem[];
  customerEmail?: string;
}

// Get Stitch Express access token
async function getStitchAccessToken(): Promise<string> {
  const response = await fetch(`${STITCH_EXPRESS_API_URL}/api/v1/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: STITCH_EXPRESS_CLIENT_ID,
      client_secret: STITCH_EXPRESS_CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: "client_paymentrequest",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to get Stitch token:", errorText);
    throw new Error(`Failed to authenticate with Stitch Express: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Create a payment link via Stitch Express
async function createPaymentLink(
  accessToken: string,
  amountInCents: number,
  reference: string,
  description: string
): Promise<{ paymentLinkId: string; paymentUrl: string }> {
  const response = await fetch(`${STITCH_EXPRESS_API_URL}/api/v1/payment-links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      amount: amountInCents,
      currency: "ZAR",
      description: description,
      externalReference: reference,
      paymentMethods: ["card", "instant_eft", "manual_eft", "capitec_pay", "apple_pay", "samsung_pay"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to create payment link:", errorText);
    throw new Error(`Failed to create Stitch payment link: ${errorText}`);
  }

  const data = await response.json();
  return {
    paymentLinkId: data.id,
    paymentUrl: data.url,
  };
}

// Send notification email to admin
async function sendAdminNotification(
  customWigItems: CustomWigItem[],
  regularItems: RegularItem[],
  totalAmount: number,
  paymentLinkId: string
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping admin notification");
    return;
  }

  // Build custom wig details HTML
  const customWigDetailsHtml = customWigItems
    .map((item, index) => {
      const optionsHtml = item.selectedOptions
        .filter((opt) => opt.name !== "SKU" && opt.name !== "Free Shipping")
        .map((opt) => `<li><strong>${opt.name}:</strong> ${opt.value}</li>`)
        .join("");

      return `
        <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #D4AF37;">
          <h3 style="margin: 0 0 15px; color: #333;">Custom Wig #${index + 1}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Base Bundle:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.baseBundle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Custom SKU:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.customSku}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Quantity:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.quantity}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Base Price:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">R${item.basePrice.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Add-on Cost:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">R${item.addonCost.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Total Price:</strong></td>
              <td style="padding: 8px 0; font-weight: bold; color: #D4AF37;">R${item.totalPrice.toLocaleString()}</td>
            </tr>
          </table>
          <h4 style="margin: 15px 0 10px;">Configuration:</h4>
          <ul style="margin: 0; padding-left: 20px;">
            ${optionsHtml}
          </ul>
        </div>
      `;
    })
    .join("");

  // Build regular items HTML if any
  const regularItemsHtml =
    regularItems.length > 0
      ? `
        <h3 style="margin-top: 25px;">Additional Items</h3>
        <ul>
          ${regularItems.map((item) => `<li>${item.title} x${item.quantity} - R${item.price.toLocaleString()}</li>`).join("")}
        </ul>
      `
      : "";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #1a1a1a, #333); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; color: #D4AF37; }
        .content { background: #ffffff; padding: 30px; }
        .summary-box { background: #fef9e7; border: 2px solid #D4AF37; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .footer { background: #1a1a1a; color: #888; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎨 New Custom Wig Order</h1>
        </div>
        <div class="content">
          <div class="summary-box">
            <p style="margin: 0; font-size: 14px; color: #666;">Payment Link ID</p>
            <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${paymentLinkId}</p>
            <p style="margin: 15px 0 0; font-size: 24px; font-weight: bold; color: #D4AF37;">R${totalAmount.toLocaleString()}</p>
            <p style="margin: 5px 0 0; font-size: 12px; color: #666;">Total Amount (includes free shipping)</p>
          </div>

          <h2 style="color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Order Details</h2>
          
          ${customWigDetailsHtml}
          ${regularItemsHtml}

          <p style="margin-top: 25px; padding: 15px; background: #e8f5e9; border-radius: 8px; text-align: center;">
            <strong>✅ Payment via Stitch Express</strong><br>
            <span style="font-size: 12px; color: #666;">Customer will complete payment through the Stitch Express checkout page</span>
          </p>
        </div>
        <div class="footer">
          <p>Luna Lux Hair | Custom Wig Production Notification</p>
          <p>This is an automated notification. Please check Stitch Express dashboard for payment status.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Luna Lux Hair <onboarding@resend.dev>",
        to: ["info@lunaluxhair.com"],
        subject: `🎨 New Custom Wig Order - R${totalAmount.toLocaleString()}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to send admin notification:", errorData);
    } else {
      console.log("Admin notification sent successfully");
    }
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    // Don't throw - we don't want to fail the checkout if email fails
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Stitch Express credentials
    if (!STITCH_EXPRESS_CLIENT_ID || !STITCH_EXPRESS_CLIENT_SECRET) {
      throw new Error("Stitch Express credentials not configured");
    }

    const { customWigItems, regularItems }: CheckoutRequest = await req.json();

    console.log("Creating Stitch Express checkout with:", {
      customWigItemCount: customWigItems?.length || 0,
      regularItemCount: regularItems?.length || 0,
    });

    // Calculate total amount in cents
    let totalAmountCents = 0;
    const orderDescription: string[] = [];

    // Add custom wig items
    if (customWigItems && customWigItems.length > 0) {
      for (const item of customWigItems) {
        totalAmountCents += Math.round(item.totalPrice * 100) * item.quantity;
        orderDescription.push(`Custom Wig (${item.baseBundle}) x${item.quantity}`);
      }
    }

    // Add regular items
    if (regularItems && regularItems.length > 0) {
      for (const item of regularItems) {
        totalAmountCents += Math.round(item.price * 100) * item.quantity;
        orderDescription.push(`${item.title} x${item.quantity}`);
      }
    }

    if (totalAmountCents === 0) {
      throw new Error("No items provided for checkout");
    }

    // Generate a unique reference
    const timestamp = Date.now();
    const reference = `LUNA-CUSTOM-${timestamp}`;

    console.log("Getting Stitch Express access token...");
    const accessToken = await getStitchAccessToken();

    console.log("Creating Stitch Express payment link...");
    const { paymentLinkId, paymentUrl } = await createPaymentLink(
      accessToken,
      totalAmountCents,
      reference,
      orderDescription.join(", ")
    );

    console.log("Payment link created:", {
      paymentLinkId,
      paymentUrl,
      totalAmountCents,
    });

    // Send admin notification email
    await sendAdminNotification(
      customWigItems || [],
      regularItems || [],
      totalAmountCents / 100, // Convert back to Rands
      paymentLinkId
    );

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: paymentUrl,
        paymentLinkId,
        orderReference: reference,
        totalPrice: (totalAmountCents / 100).toFixed(2),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create checkout";
    console.error("Error creating Stitch Express checkout:", error);
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
