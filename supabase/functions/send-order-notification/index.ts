import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "info@lunaluxhair.com";

interface NotificationRequest {
  type: "order_placed" | "order_shipped" | "order_delivered";
  order: {
    order_number: string;
    customer_name: string;
    customer_email: string;
    items: Array<{ title: string; quantity: number; price: number }>;
    subtotal: number;
    shipping_cost: number;
    discount_amount: number;
    total: number;
    shipping_address?: any;
  };
}

function formatPrice(amount: number): string {
  return `R${amount.toFixed(2)}`;
}

function buildOrderPlacedCustomerEmail(order: NotificationRequest["order"]): string {
  const itemRows = (order.items || []).map(item => 
    `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${item.title}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">×${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(item.price * item.quantity)}</td></tr>`
  ).join('');

  return `
    <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;background:#fafafa;padding:40px;">
      <div style="text-align:center;margin-bottom:30px;">
        <h1 style="color:#1a1a1a;font-size:28px;margin:0;">Luna Lux Studio</h1>
        <p style="color:#666;font-size:14px;margin-top:5px;">Premium Hair Boutique</p>
      </div>
      <div style="background:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
        <h2 style="color:#1a1a1a;font-size:22px;margin-bottom:20px;">Order Confirmed! ✨</h2>
        <p style="color:#333;line-height:1.6;">Dear ${order.customer_name || 'Valued Customer'},</p>
        <p style="color:#333;line-height:1.6;">Thank you for your order! We've received your payment and your order is being prepared.</p>
        
        <div style="background:#f8f4f0;padding:20px;border-radius:6px;margin:20px 0;">
          <p style="margin:5px 0;color:#555;"><strong>Order Reference:</strong> ${order.order_number}</p>
        </div>
        
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <thead><tr style="background:#f8f4f0;"><th style="padding:10px;text-align:left;">Item</th><th style="padding:10px;text-align:center;">Qty</th><th style="padding:10px;text-align:right;">Price</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        
        <div style="border-top:2px solid #eee;padding-top:15px;margin-top:15px;">
          <div style="display:flex;justify-content:space-between;margin:5px 0;"><span style="color:#666;">Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
          ${order.discount_amount > 0 ? `<div style="display:flex;justify-content:space-between;margin:5px 0;color:#22c55e;"><span>Discount</span><span>-${formatPrice(order.discount_amount)}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;margin:5px 0;"><span style="color:#666;">Shipping (The Courier Guy)</span><span>${order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost)}</span></div>
          <div style="display:flex;justify-content:space-between;margin:10px 0;font-size:18px;font-weight:bold;"><span>Total</span><span style="color:#d4a574;">${formatPrice(order.total)}</span></div>
        </div>
        
        <p style="color:#333;line-height:1.6;margin-top:20px;">You'll receive tracking details once your order is shipped. If you have any questions, contact us at <a href="mailto:info@lunaluxhair.com" style="color:#d4a574;">info@lunaluxhair.com</a></p>
        <p style="color:#333;line-height:1.6;margin-top:30px;">With love,<br/><strong>The Luna Lux Team</strong></p>
      </div>
      <div style="text-align:center;margin-top:30px;color:#999;font-size:12px;"><p>© ${new Date().getFullYear()} Luna Lux Studio. All rights reserved.</p></div>
    </div>
  `;
}

function buildOrderPlacedAdminEmail(order: NotificationRequest["order"]): string {
  const itemList = (order.items || []).map(item => 
    `• ${item.title} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`
  ).join('<br/>');

  const address = order.shipping_address;
  const addressStr = address ? `${address.street}, ${address.city}, ${address.province} ${address.postalCode}, ${address.country}` : 'N/A';

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#1a1a1a;">🛒 New Order: ${order.order_number}</h2>
      <div style="background:#f8f4f0;padding:20px;border-radius:8px;margin:20px 0;">
        <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
        <p><strong>Ship To:</strong> ${addressStr}</p>
        <h3>Items:</h3>
        <p>${itemList}</p>
        <hr style="border:1px solid #ddd;"/>
        <p><strong>Subtotal:</strong> ${formatPrice(order.subtotal)}</p>
        ${order.discount_amount > 0 ? `<p><strong>Discount:</strong> -${formatPrice(order.discount_amount)}</p>` : ''}
        <p><strong>Shipping:</strong> ${order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost)}</p>
        <p style="font-size:18px;"><strong>Total: ${formatPrice(order.total)}</strong></p>
      </div>
      <p style="color:#666;">Login to the admin dashboard to manage this order.</p>
    </div>
  `;
}

function buildShippedEmail(order: NotificationRequest["order"]): string {
  return `
    <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;background:#fafafa;padding:40px;">
      <div style="text-align:center;margin-bottom:30px;">
        <h1 style="color:#1a1a1a;font-size:28px;margin:0;">Luna Lux Studio</h1>
      </div>
      <div style="background:white;padding:30px;border-radius:8px;">
        <h2 style="color:#1a1a1a;">Your Order is On Its Way! 🚚</h2>
        <p>Dear ${order.customer_name || 'Valued Customer'},</p>
        <p>Great news! Your order <strong>${order.order_number}</strong> has been shipped via <strong>The Courier Guy</strong>.</p>
        <p>You should receive your package within 2-5 business days. We'll notify you once it's been delivered.</p>
        <p>If you have any questions, contact us at <a href="mailto:info@lunaluxhair.com" style="color:#d4a574;">info@lunaluxhair.com</a></p>
        <p>With love,<br/><strong>The Luna Lux Team</strong></p>
      </div>
    </div>
  `;
}

function buildDeliveredEmail(order: NotificationRequest["order"]): string {
  return `
    <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;background:#fafafa;padding:40px;">
      <div style="text-align:center;margin-bottom:30px;">
        <h1 style="color:#1a1a1a;font-size:28px;margin:0;">Luna Lux Studio</h1>
      </div>
      <div style="background:white;padding:30px;border-radius:8px;">
        <h2 style="color:#1a1a1a;">Your Order Has Been Delivered! 🎉</h2>
        <p>Dear ${order.customer_name || 'Valued Customer'},</p>
        <p>Your order <strong>${order.order_number}</strong> has been successfully delivered.</p>
        <p>We hope you love your new hair! If you have any questions or need styling advice, don't hesitate to reach out.</p>
        <p>Don't forget to leave a review on our website to earn loyalty points! 💎</p>
        <p style="text-align:center;margin:30px 0;">
          <a href="https://lunaluxstudio.lovable.app/explore" style="background:#d4a574;color:white;padding:12px 30px;border-radius:25px;text-decoration:none;font-weight:bold;">Shop More</a>
        </p>
        <p>With love,<br/><strong>The Luna Lux Team</strong></p>
      </div>
    </div>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { type, order }: NotificationRequest = await req.json();
    console.log(`Sending ${type} notification for order ${order.order_number}`);

    const emails: Array<{ to: string; subject: string; html: string }> = [];

    switch (type) {
      case "order_placed":
        emails.push({
          to: order.customer_email,
          subject: `Order Confirmed - ${order.order_number} ✨`,
          html: buildOrderPlacedCustomerEmail(order),
        });
        emails.push({
          to: ADMIN_EMAIL,
          subject: `🛒 New Order: ${order.order_number} - ${formatPrice(order.total)}`,
          html: buildOrderPlacedAdminEmail(order),
        });
        break;

      case "order_shipped":
        emails.push({
          to: order.customer_email,
          subject: `Your Order ${order.order_number} Has Been Shipped! 🚚`,
          html: buildShippedEmail(order),
        });
        emails.push({
          to: ADMIN_EMAIL,
          subject: `📦 Order Shipped: ${order.order_number}`,
          html: `<p>Order ${order.order_number} for ${order.customer_name} has been marked as shipped.</p>`,
        });
        break;

      case "order_delivered":
        emails.push({
          to: order.customer_email,
          subject: `Your Order ${order.order_number} Has Been Delivered! 🎉`,
          html: buildDeliveredEmail(order),
        });
        emails.push({
          to: ADMIN_EMAIL,
          subject: `✅ Order Delivered: ${order.order_number}`,
          html: `<p>Order ${order.order_number} for ${order.customer_name} has been marked as delivered.</p>`,
        });
        break;
    }

    // Send all emails
    for (const email of emails) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Luna Lux Studio <onboarding@resend.dev>",
          to: [email.to],
          subject: email.subject,
          html: email.html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to send email to ${email.to}:`, errorText);
      } else {
        console.log(`Email sent to ${email.to}: ${email.subject}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailsSent: emails.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Notification failed";
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
