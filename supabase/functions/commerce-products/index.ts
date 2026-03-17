// Commerce Products CRUD API
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const url = new URL(req.url);
  const productId = url.searchParams.get("id");
  const slug = url.searchParams.get("slug");
  const category = url.searchParams.get("category");
  const status = url.searchParams.get("status");

  try {
    if (req.method === "GET") {
      // Public read - use anon key so RLS policies apply (active products only for public)
      const authHeader = req.headers.get("authorization");
      const supabase = createClient(supabaseUrl, authHeader ? supabaseAnonKey : supabaseAnonKey, {
        global: { headers: authHeader ? { Authorization: authHeader } : {} },
      });

      let query = supabase.from("cms_products").select("*");

      if (productId) {
        query = query.eq("id", productId);
        const { data, error } = await query.single();
        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (slug) {
        query = query.eq("slug", slug);
        const { data, error } = await query.single();
        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (category) {
        query = query.eq("category", category);
      }

      // Only admins (via auth header) see non-active products
      if (!authHeader) {
        query = query.eq("status", "active");
      } else if (status) {
        query = query.eq("status", status);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mutation endpoints require admin auth - use service key after verifying caller
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Verify the user is an admin
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { data: roleData } = await userSupabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin access required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Use service key for mutations
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === "POST") {
      const body = await req.json();

      // Validate required fields
      if (!body.title || !body.price) {
        return new Response(JSON.stringify({ error: "title and price are required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Auto-generate slug if not provided
      if (!body.slug) {
        body.slug = body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      const { data, error } = await adminSupabase
        .from("cms_products")
        .insert({
          title: body.title,
          slug: body.slug,
          description: body.description || "",
          price: parseFloat(body.price),
          compare_at_price: body.compare_at_price ? parseFloat(body.compare_at_price) : null,
          currency: body.currency || "ZAR",
          sku: body.sku || null,
          inventory_quantity: parseInt(body.inventory_quantity ?? body.stock ?? 0),
          images: body.images || [],
          featured_image: body.featured_image || null,
          status: body.status || "draft",
          tags: body.tags || [],
          category: body.category || null,
          meta_title: body.meta_title || null,
          meta_description: body.meta_description || null,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      });
    }

    if (req.method === "PUT") {
      if (!productId) {
        return new Response(JSON.stringify({ error: "id query parameter is required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const body = await req.json();
      const updates: Record<string, unknown> = {};

      if (body.title !== undefined) updates.title = body.title;
      if (body.slug !== undefined) updates.slug = body.slug;
      if (body.description !== undefined) updates.description = body.description;
      if (body.price !== undefined) updates.price = parseFloat(body.price);
      if (body.compare_at_price !== undefined) {
        updates.compare_at_price = body.compare_at_price ? parseFloat(body.compare_at_price) : null;
      }
      if (body.currency !== undefined) updates.currency = body.currency;
      if (body.sku !== undefined) updates.sku = body.sku;
      if (body.inventory_quantity !== undefined) {
        updates.inventory_quantity = parseInt(body.inventory_quantity);
      } else if (body.stock !== undefined) {
        updates.inventory_quantity = parseInt(body.stock);
      }
      if (body.images !== undefined) updates.images = body.images;
      if (body.featured_image !== undefined) updates.featured_image = body.featured_image;
      if (body.status !== undefined) updates.status = body.status;
      if (body.tags !== undefined) updates.tags = body.tags;
      if (body.category !== undefined) updates.category = body.category;
      if (body.meta_title !== undefined) updates.meta_title = body.meta_title;
      if (body.meta_description !== undefined) updates.meta_description = body.meta_description;

      const { data, error } = await adminSupabase
        .from("cms_products")
        .update(updates)
        .eq("id", productId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      if (!productId) {
        return new Response(JSON.stringify({ error: "id query parameter is required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const { error } = await adminSupabase
        .from("cms_products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("commerce-products error:", error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
