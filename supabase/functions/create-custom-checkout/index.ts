import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STITCH_EXPRESS_API_URL = "https://express.stitch.money";
const STITCH_EXPRESS_CLIENT_ID = Deno.env.get("STITCH_EXPRESS_CLIENT_ID");
const STITCH_EXPRESS_CLIENT_SECRET = Deno.env.get("STITCH_EXPRESS_CLIENT_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
  paymentLinkId: string,
  orderReference: string,
  paymentUrl: string
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
            <p style="margin: 0; font-size: 14px; color: #666;">Order Reference</p>
            <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${orderReference}</p>
            <p style="margin: 15px 0 0; font-size: 24px; font-weight: bold; color: #D4AF37;">R${totalAmount.toLocaleString()}</p>
            <p style="margin: 5px 0 0; font-size: 12px; color: #666;">Total Amount (includes free shipping)</p>
          </div>

          <h2 style="color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Order Details</h2>
          
          ${customWigDetailsHtml}
          ${regularItemsHtml}

          <p style="margin-top: 25px; padding: 15px; background: #fff3cd; border-radius: 8px; text-align: center;">
            <strong>⏳ Awaiting Payment via Stitch Express</strong><br>
            <span style="font-size: 12px; color: #666;">Customer will complete payment through the Stitch Express checkout page</span>
          </p>
        </div>
        <div class="footer">
          <p>Luna Lux Hair | Custom Wig Production Notification</p>
          <p>Payment Link ID: ${paymentLinkId}</p>
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
        subject: `🎨 New Custom Wig Order - ${orderReference} - R${totalAmount.toLocaleString()}`,
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
  }
}

// Send order confirmation email to customer
async function sendCustomerConfirmation(
  customerEmail: string,
  customWigItems: CustomWigItem[],
  regularItems: RegularItem[],
  totalAmount: number,
  orderReference: string,
  paymentUrl: string
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping customer notification");
    return;
  }

  // Build order items summary
  const itemsSummary = [
    ...customWigItems.map((item) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
          <strong>Custom Luna Luxury Wig</strong><br>
          <span style="font-size: 12px; color: #666;">${item.baseBundle}</span><br>
          <span style="font-size: 11px; color: #888;">SKU: ${item.customSku}</span>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">R${item.totalPrice.toLocaleString()}</td>
      </tr>
    `),
    ...regularItems.map((item) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">R${item.price.toLocaleString()}</td>
      </tr>
    `),
  ].join("");

  // Build configuration details for custom wigs
  const configDetails = customWigItems.map((item, index) => {
    const options = item.selectedOptions
      .filter((opt) => opt.name !== "SKU" && opt.name !== "Free Shipping")
      .map((opt) => `<li>${opt.name}: ${opt.value}</li>`)
      .join("");
    
    return `
      <div style="background: #f9f9f9; border-radius: 8px; padding: 15px; margin: 10px 0;">
        <strong>Wig #${index + 1} Configuration:</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px; font-size: 13px; color: #555;">
          ${options}
        </ul>
      </div>
    `;
  }).join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header .emoji { font-size: 50px; display: block; margin-bottom: 15px; }
        .content { background: #ffffff; padding: 40px 30px; }
        .order-box { background: #fef9e7; border: 2px solid #D4AF37; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; text-decoration: none; padding: 18px 45px; border-radius: 30px; font-weight: bold; font-size: 16px; margin: 20px 0; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th { background: #f5f5f5; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; }
        .footer { background: #1a1a1a; color: #888; padding: 30px; text-align: center; font-size: 12px; }
        .footer a { color: #D4AF37; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="emoji">✨</span>
          <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
          <div class="order-box">
            <p style="margin: 0; font-size: 14px; color: #666;">Order Reference</p>
            <p style="margin: 5px 0; font-size: 22px; font-weight: bold; color: #333;">${orderReference}</p>
          </div>

          <p>Thank you for your custom wig order! We're excited to create something beautiful for you.</p>

          <h3 style="color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Order Summary</h3>
          
          <table class="order-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsSummary}
              <tr>
                <td colspan="2" style="padding: 15px; text-align: right;"><strong>Shipping:</strong></td>
                <td style="padding: 15px; text-align: right; color: #4caf50;"><strong>FREE</strong></td>
              </tr>
              <tr style="background: #fef9e7;">
                <td colspan="2" style="padding: 15px; text-align: right; font-size: 18px;"><strong>Total:</strong></td>
                <td style="padding: 15px; text-align: right; font-size: 18px; color: #D4AF37;"><strong>R${totalAmount.toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>

          ${configDetails}

          <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 15px; font-size: 16px;"><strong>Complete Your Payment</strong></p>
            <a href="${paymentUrl}" class="cta-button">Pay Now - R${totalAmount.toLocaleString()}</a>
            <p style="font-size: 12px; color: #888; margin-top: 15px;">Secure payment via Stitch Express</p>
          </div>

          <div style="background: #e3f2fd; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px; color: #1976d2;">💳 Payment Options</h4>
            <p style="margin: 0; font-size: 13px; color: #555;">
              Card • Instant EFT • Capitec Pay • Apple Pay • Samsung Pay
            </p>
          </div>

          <p style="font-size: 13px; color: #666; text-align: center;">
            Questions? Reply to this email or contact us at<br>
            <a href="mailto:info@lunaluxhair.com" style="color: #D4AF37;">info@lunaluxhair.com</a>
          </p>
        </div>
        <div class="footer">
          <p>Luna Lux Hair | Premium Custom Wigs</p>
          <p><a href="https://lunaluxhair.com">Visit Our Store</a> | <a href="https://lunaluxhair.com/contact">Contact Us</a></p>
          <p style="margin-top: 15px; color: #666;">Your link expires in 7 days. Please complete payment to secure your order.</p>
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
        to: [customerEmail],
        subject: `✨ Your Custom Wig Order - ${orderReference}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to send customer confirmation:", errorData);
    } else {
      console.log("Customer confirmation sent to:", customerEmail);
    }
  } catch (error) {
    console.error("Failed to send customer confirmation:", error);
  }
}

// Save order to database
async function saveOrderToDatabase(
  customWigItems: CustomWigItem[],
  regularItems: RegularItem[],
  totalAmount: number,
  orderReference: string,
  paymentLinkId: string,
  customerEmail?: string
): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Save each custom wig as a separate order record
  for (const item of customWigItems) {
    const { error } = await supabase.from("custom_wig_orders").insert({
      base_bundle: item.baseBundle,
      base_price: item.basePrice,
      addon_cost: item.addonCost,
      total_price: item.totalPrice * item.quantity,
      configuration: {
        selectedOptions: item.selectedOptions,
        configuration: item.configuration,
        quantity: item.quantity,
      },
      custom_sku: item.customSku,
      customer_email: customerEmail || "guest@lunaluxhair.com",
      order_reference: orderReference,
      payment_link_id: paymentLinkId,
      payment_status: "pending",
      status: "pending",
    });

    if (error) {
      console.error("Error saving order to database:", error);
    } else {
      console.log("Order saved to database:", orderReference);
    }
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

    const { customWigItems, regularItems, customerEmail }: CheckoutRequest = await req.json();

    console.log("Creating Stitch Express checkout with:", {
      customWigItemCount: customWigItems?.length || 0,
      regularItemCount: regularItems?.length || 0,
      customerEmail: customerEmail || "not provided",
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

    const totalAmountRands = totalAmountCents / 100;

    // Save order to database
    await saveOrderToDatabase(
      customWigItems || [],
      regularItems || [],
      totalAmountRands,
      reference,
      paymentLinkId,
      customerEmail
    );

    // Send admin notification email
    await sendAdminNotification(
      customWigItems || [],
      regularItems || [],
      totalAmountRands,
      paymentLinkId,
      reference,
      paymentUrl
    );

    // Send customer confirmation email if email provided
    if (customerEmail) {
      await sendCustomerConfirmation(
        customerEmail,
        customWigItems || [],
        regularItems || [],
        totalAmountRands,
        reference,
        paymentUrl
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: paymentUrl,
        paymentLinkId,
        orderReference: reference,
        totalPrice: totalAmountRands.toFixed(2),
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
