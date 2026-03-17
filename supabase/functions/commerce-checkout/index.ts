// Commerce Checkout Endpoint
// Validates cart items against DB prices, calculates total, creates order
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CartItem {
  product_id: string;
  quantity: number;
  /** Client-side price - used for display only, actual price validated from DB */
  price?: number;
}

interface CheckoutRequest {
  items: CartItem[];
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  shipping_address?: {
    street: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  };
  notes?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const body: CheckoutRequest = await req.json();

    // Validate request
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: "items array is required and cannot be empty" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!body.customer_email) {
      return new Response(JSON.stringify({ error: "customer_email is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate quantities
    for (const item of body.items) {
      if (!item.product_id) {
        return new Response(JSON.stringify({ error: "Each item must have a product_id" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      if (!item.quantity || item.quantity < 1) {
        return new Response(JSON.stringify({ error: `Invalid quantity for product ${item.product_id}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Use service key to fetch product prices (bypasses RLS so we get all active products)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch prices from DB to prevent client-side price tampering
    const productIds = body.items.map((i) => i.product_id);
    const { data: products, error: productsError } = await supabase
      .from("cms_products")
      .select("id, title, price, inventory_quantity, status, slug, featured_image")
      .in("id", productIds)
      .eq("status", "active");

    if (productsError) throw productsError;

    // Validate all products exist and are active
    const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);
    const missingProducts: string[] = [];
    const outOfStockProducts: string[] = [];

    for (const item of body.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        missingProducts.push(item.product_id);
      } else if (
        product.inventory_quantity !== null &&
        product.inventory_quantity < item.quantity
      ) {
        // Covers both zero stock (0 < quantity) and insufficient stock (n < quantity)
        outOfStockProducts.push(product.title);
      }
    }

    if (missingProducts.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Some products are unavailable",
          unavailable_ids: missingProducts,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
      );
    }

    if (outOfStockProducts.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Some products are out of stock",
          out_of_stock: outOfStockProducts,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
      );
    }

    // Build validated order items using DB prices
    const orderItems = body.items.map((item) => {
      const product = productMap.get(item.product_id)!;
      return {
        product_id: item.product_id,
        title: product.title,
        slug: product.slug,
        image: product.featured_image || null,
        quantity: item.quantity,
        unit_price: product.price,
        line_total: parseFloat((product.price * item.quantity).toFixed(2)),
      };
    });

    // Calculate totals
    const subtotal = parseFloat(
      orderItems.reduce((sum, item) => sum + item.line_total, 0).toFixed(2)
    );
    const total = subtotal; // No complex tax logic per requirements

    // Generate unique order reference
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderReference = `ORD-${timestamp}-${random}`;

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("commerce_orders")
      .insert({
        order_reference: orderReference,
        customer_email: body.customer_email,
        customer_name: body.customer_name || null,
        customer_phone: body.customer_phone || null,
        items: orderItems,
        subtotal,
        total,
        currency: "ZAR",
        status: "pending",
        shipping_address: body.shipping_address || null,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          order_reference: order.order_reference,
          items: orderItems,
          subtotal,
          total,
          currency: "ZAR",
          status: "pending",
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("commerce-checkout error:", error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
