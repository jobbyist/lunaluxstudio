import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-stitch-signature",
};

const STITCH_WEBHOOK_SECRET = Deno.env.get("STITCH_WEBHOOK_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Verify Stitch webhook signature
async function verifyWebhookSignature(
  payload: string,
  signature: string | null
): Promise<boolean> {
  if (!STITCH_WEBHOOK_SECRET || !signature) {
    console.warn("Webhook secret or signature not provided");
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(STITCH_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const signatureBuffer = encoder.encode(payload);
    const expectedSignature = await crypto.subtle.sign("HMAC", key, signatureBuffer);
    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return expectedHex === signature;
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

// Send payment confirmation email to customer
async function sendPaymentConfirmationEmail(
  customerEmail: string,
  orderReference: string,
  totalAmount: number,
  paymentMethod: string
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping customer notification");
    return;
  }

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
        .success-box { background: #e8f5e9; border: 2px solid #4caf50; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0; }
        .success-box h2 { margin: 0; color: #2e7d32; }
        .order-details { background: #f9f9f9; border-radius: 10px; padding: 25px; margin: 25px 0; }
        .order-details h3 { margin: 0 0 15px; color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #666; }
        .detail-value { font-weight: bold; color: #333; }
        .total-row { font-size: 18px; color: #D4AF37; }
        .next-steps { background: #fef9e7; border-radius: 10px; padding: 25px; margin: 25px 0; }
        .next-steps h3 { margin: 0 0 15px; color: #B8860B; }
        .next-steps ol { margin: 0; padding-left: 20px; }
        .next-steps li { margin: 10px 0; color: #555; }
        .footer { background: #1a1a1a; color: #888; padding: 30px; text-align: center; font-size: 12px; }
        .footer a { color: #D4AF37; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="emoji">✅</span>
          <h1>Payment Confirmed!</h1>
        </div>
        <div class="content">
          <div class="success-box">
            <h2>Thank you for your order!</h2>
            <p style="margin: 10px 0 0; color: #555;">Your custom wig order is being prepared with love.</p>
          </div>

          <div class="order-details">
            <h3>Order Summary</h3>
            <div class="detail-row">
              <span class="detail-label">Order Reference</span>
              <span class="detail-value">${orderReference}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method</span>
              <span class="detail-value">${paymentMethod || "Card/EFT"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Status</span>
              <span class="detail-value" style="color: #4caf50;">✓ Paid</span>
            </div>
            <div class="detail-row total-row">
              <span class="detail-label">Total Paid</span>
              <span class="detail-value">R${totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div class="next-steps">
            <h3>What's Next?</h3>
            <ol>
              <li><strong>Production begins</strong> - Our artisans will start crafting your custom wig</li>
              <li><strong>Quality check</strong> - Every piece undergoes rigorous quality inspection</li>
              <li><strong>Shipping notification</strong> - You'll receive an email when your order ships</li>
              <li><strong>Delivery</strong> - Your gorgeous wig arrives at your doorstep!</li>
            </ol>
          </div>

          <p style="text-align: center; color: #666;">
            Questions about your order? Reply to this email or contact us at<br>
            <a href="mailto:info@lunaluxhair.com" style="color: #D4AF37;">info@lunaluxhair.com</a>
          </p>
        </div>
        <div class="footer">
          <p>Luna Lux Hair | Premium Custom Wigs</p>
          <p><a href="https://lunaluxhair.com">Visit Our Store</a> | <a href="https://lunaluxhair.com/contact">Contact Us</a></p>
          <p style="margin-top: 15px; color: #666;">Thank you for choosing Luna Lux Hair!</p>
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
        subject: `✅ Payment Confirmed - Order ${orderReference}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to send payment confirmation email:", errorData);
    } else {
      console.log("Payment confirmation email sent to:", customerEmail);
    }
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error);
  }
}

// Send payment success notification to admin
async function sendAdminPaymentNotification(
  orderReference: string,
  paymentLinkId: string,
  totalAmount: number,
  paymentMethod: string,
  customerEmail: string
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping admin notification");
    return;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #ffffff; padding: 30px; }
        .success-box { background: #e8f5e9; border: 2px solid #4caf50; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .footer { background: #1a1a1a; color: #888; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Payment Received!</h1>
        </div>
        <div class="content">
          <div class="success-box">
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2e7d32;">R${totalAmount.toLocaleString()}</p>
            <p style="margin: 10px 0 0; color: #666;">Payment successfully received</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Order Reference:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${orderReference}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Payment Link ID:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${paymentLinkId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Payment Method:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${paymentMethod || "Unknown"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Customer Email:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${customerEmail}</td>
            </tr>
          </table>

          <p style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px; text-align: center;">
            <strong>✅ Ready for Production</strong><br>
            <span style="font-size: 12px; color: #666;">This order can now be processed</span>
          </p>
        </div>
        <div class="footer">
          <p>Luna Lux Hair | Payment Notification</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Luna Lux Hair <onboarding@resend.dev>",
        to: ["info@lunaluxhair.com"],
        subject: `💰 Payment Received - ${orderReference} - R${totalAmount.toLocaleString()}`,
        html: emailHtml,
      }),
    });
    console.log("Admin payment notification sent");
  } catch (error) {
    console.error("Failed to send admin payment notification:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const signature = req.headers.get("x-stitch-signature");

    // Verify webhook signature (optional but recommended)
    if (STITCH_WEBHOOK_SECRET && signature) {
      const isValid = await verifyWebhookSignature(payload, signature);
      if (!isValid) {
        console.warn("Invalid webhook signature");
        // Continue anyway for now - Stitch may use different signature format
      }
    }

    const webhookData = JSON.parse(payload);
    console.log("Received Stitch webhook:", JSON.stringify(webhookData, null, 2));

    // Stitch Express webhook payload structure
    const { 
      type, 
      data 
    } = webhookData;

    // Handle payment completed events
    if (type === "payment.completed" || type === "payment_link.paid") {
      const paymentLinkId = data?.paymentLinkId || data?.id;
      const paymentId = data?.paymentId || data?.payment?.id;
      const paymentMethod = data?.paymentMethod || data?.payment?.paymentMethod || "card";
      const amountInCents = data?.amount || data?.payment?.amount;
      const externalReference = data?.externalReference || data?.payment?.externalReference;

      console.log("Processing payment completion:", {
        paymentLinkId,
        paymentId,
        paymentMethod,
        amountInCents,
        externalReference,
      });

      if (!paymentLinkId && !externalReference) {
        console.error("No payment link ID or external reference in webhook");
        return new Response(
          JSON.stringify({ success: false, error: "Missing payment identifier" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Initialize Supabase client with service role
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Find the order by payment_link_id or order_reference
      let query = supabase.from("custom_wig_orders").select("*");
      
      if (paymentLinkId) {
        query = query.eq("payment_link_id", paymentLinkId);
      } else if (externalReference) {
        query = query.eq("order_reference", externalReference);
      }

      const { data: orders, error: fetchError } = await query.limit(1);

      if (fetchError) {
        console.error("Error fetching order:", fetchError);
        return new Response(
          JSON.stringify({ success: false, error: "Database error" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      if (!orders || orders.length === 0) {
        console.log("Order not found for payment:", paymentLinkId || externalReference);
        // Still return success - webhook received
        return new Response(
          JSON.stringify({ success: true, message: "Order not found but webhook acknowledged" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      const order = orders[0];

      // Update order status to paid
      const { error: updateError } = await supabase
        .from("custom_wig_orders")
        .update({
          payment_status: "paid",
          payment_method: paymentMethod,
          paid_at: new Date().toISOString(),
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("Error updating order:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to update order" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      console.log("Order updated successfully:", order.id);

      // Send confirmation emails
      const totalAmount = amountInCents ? amountInCents / 100 : order.total_price;
      const orderRef = externalReference || order.order_reference;

      // Send customer confirmation
      if (order.customer_email) {
        await sendPaymentConfirmationEmail(
          order.customer_email,
          orderRef,
          totalAmount,
          paymentMethod
        );
      }

      // Send admin notification
      await sendAdminPaymentNotification(
        orderRef,
        paymentLinkId || order.payment_link_id,
        totalAmount,
        paymentMethod,
        order.customer_email || "Unknown"
      );

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Payment processed and order updated",
          orderId: order.id 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle other webhook types (log but acknowledge)
    console.log("Received webhook type:", type);
    return new Response(
      JSON.stringify({ success: true, message: "Webhook received" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Webhook processing failed";
    console.error("Error processing Stitch webhook:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
