import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-stitch-signature",
};

interface StitchWebhookPayload {
  id?: string;
  paymentLinkId?: string;
  externalReference?: string;
  status?: string;
  amount?: number;
  currency?: string;
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

async function sendNotification(supabaseUrl: string, supabaseKey: string, type: string, order: any) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-order-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        type,
        order: {
          order_number: order.order_number,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          items: order.items || [],
          subtotal: order.subtotal || 0,
          shipping_cost: order.shipping_cost || 0,
          discount_amount: order.discount_amount || 0,
          total: order.total || 0,
          shipping_address: order.shipping_address,
        },
      }),
    });
    if (!response.ok) {
      console.error("Notification failed:", await response.text());
    }
  } catch (e) {
    console.error("Notification error:", e);
  }
}

async function awardLoyaltyPoints(supabase: any, customerEmail: string, total: number, orderNumber: string) {
  try {
    // Find user profile by email
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("email", customerEmail)
      .single();

    if (!profile) {
      console.log("No user profile found for loyalty points:", customerEmail);
      return;
    }

    // Award 1 point per R25 spent (excluding shipping)
    const pointsToAward = Math.floor(total / 25);
    if (pointsToAward <= 0) return;

    // Insert loyalty transaction (trigger will update tier)
    const { error } = await supabase.from("loyalty_transactions").insert({
      user_id: profile.user_id,
      points: pointsToAward,
      transaction_type: "purchase",
      order_id: orderNumber,
      description: `Earned ${pointsToAward} points from order ${orderNumber}`,
    });

    if (error) {
      console.error("Failed to award loyalty points:", error);
    } else {
      console.log(`Awarded ${pointsToAward} loyalty points to ${customerEmail}`);
    }
  } catch (e) {
    console.error("Loyalty points error:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: StitchWebhookPayload = await req.json();
    console.log("Stitch webhook received:", JSON.stringify(payload, null, 2));

    const externalReference =
      payload.externalReference ||
      payload.data?.externalReference ||
      payload.data?.payment?.externalReference;

    const status =
      payload.status ||
      payload.data?.status ||
      payload.data?.payment?.status;

    if (!externalReference) {
      console.log("No external reference, ignoring");
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("Processing:", externalReference, "Status:", status);

    // Look up order in cms_orders
    const { data: orderData, error: orderError } = await supabase
      .from("cms_orders")
      .select("*")
      .eq("order_number", externalReference)
      .single();

    if (orderError || !orderData) {
      console.error("Order not found:", externalReference);
      return new Response(JSON.stringify({ error: "Order not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === "complete" || normalizedStatus === "completed" || normalizedStatus === "success" || normalizedStatus === "paid") {
      console.log("Payment completed:", externalReference);

      // Update order
      await supabase.from("cms_orders").update({
        payment_status: "paid",
        status: "processing",
      }).eq("order_number", externalReference);

      // Update customer totals
      if (orderData.customer_email) {
        const { data: customer } = await supabase
          .from("cms_customers")
          .select("id, total_orders, total_spent")
          .eq("email", orderData.customer_email)
          .single();

        if (customer) {
          // Customer was already created/updated in create-stitch-payment, just ensure data is correct
          console.log("Customer record exists:", customer.id);
        }
      }

      // Award loyalty points
      await awardLoyaltyPoints(supabase, orderData.customer_email, orderData.subtotal, externalReference);

      // Send order confirmation emails
      await sendNotification(supabaseUrl, supabaseKey, "order_placed", orderData);

      // Also handle if this was a custom wig order (backward compat)
      const hasCustomWig = (orderData.items || []).some((item: any) => item.isCustomWig);
      if (hasCustomWig) {
        // Update custom_wig_orders table if an entry exists
        await supabase.from("custom_wig_orders").update({
          payment_status: "paid",
          status: "processing",
          paid_at: new Date().toISOString(),
        }).eq("order_reference", externalReference);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Payment processed", orderReference: externalReference }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else if (normalizedStatus === "cancelled" || normalizedStatus === "canceled") {
      await supabase.from("cms_orders").update({
        payment_status: "cancelled",
        status: "cancelled",
      }).eq("order_number", externalReference);

      return new Response(
        JSON.stringify({ success: true, message: "Cancellation recorded" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else if (normalizedStatus === "expired" || normalizedStatus === "failed") {
      await supabase.from("cms_orders").update({
        payment_status: normalizedStatus,
        status: "cancelled",
      }).eq("order_number", externalReference);

      return new Response(
        JSON.stringify({ success: true, message: `${normalizedStatus} recorded` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log("Webhook acknowledged, status:", status);
    return new Response(
      JSON.stringify({ received: true, status }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Webhook failed";
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
