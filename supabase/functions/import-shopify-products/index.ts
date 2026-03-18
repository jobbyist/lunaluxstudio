import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHOPIFY_STORE_DOMAIN = "luna-hair-boutique-9dwzm.myshopify.com";
const SHOPIFY_API_VERSION = "2024-10";

// Map products to collections based on product type, tags, and vendor
function inferCollection(product: any): string {
  const title = (product.title || "").toLowerCase();
  const tags = (product.tags || "").toLowerCase();
  const productType = (product.product_type || "").toLowerCase();
  const vendor = (product.vendor || "").toLowerCase();

  if (productType.includes("custom wig") || title.includes("custom")) return "custom-wigs";
  if (productType.includes("hair accessories") || title.includes("brush") || title.includes("storage bag") || title.includes("wig cap")) return "accessories";
  if (productType.includes("hair extensions") || title.includes("clip-in")) return "extensions";
  if (title.includes("unit") || title.includes("wig")) return "wigs";
  if (title.includes("frontal") || tags.includes("frontal")) return "frontals";
  if (title.includes("closure") || tags.includes("closure")) return "closures";
  if (title.includes("bundle") || title.includes("bundle deal")) return "bundles";
  if (title.includes("ponytail")) return "extensions";
  if (title.includes("highlight")) return "highlight-wigs";
  
  return "other";
}

function inferCategory(product: any): string {
  const collection = inferCollection(product);
  const vendor = (product.vendor || "").toLowerCase();
  
  if (collection === "wigs") {
    if (vendor === "lunaluxstudio") return "Premium Wigs";
    return "Wigs";
  }
  if (collection === "bundles") {
    if ((product.title || "").toLowerCase().includes("vietnamese")) return "Vietnamese Bundles";
    if ((product.title || "").toLowerCase().includes("raw")) return "Raw Vietnamese Bundles";
    return "Brazilian Bundles";
  }
  if (collection === "closures") return "Closures";
  if (collection === "frontals") return "Frontals";
  if (collection === "accessories") return "Accessories";
  if (collection === "extensions") return "Extensions";
  if (collection === "highlight-wigs") return "Highlight Wigs";
  return "Other";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!shopifyAccessToken) {
      throw new Error("SHOPIFY_ACCESS_TOKEN not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all products from Shopify Admin API
    let allProducts: any[] = [];
    let pageInfo: string | null = null;
    let hasNext = true;

    while (hasNext) {
      let url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250&status=active`;
      if (pageInfo) {
        url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250&page_info=${pageInfo}`;
      }

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": shopifyAccessToken,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      allProducts = [...allProducts, ...data.products];

      // Check for pagination
      const linkHeader = response.headers.get("Link");
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const match = linkHeader.match(/page_info=([^>&]+).*rel="next"/);
        pageInfo = match ? match[1] : null;
        hasNext = !!pageInfo;
      } else {
        hasNext = false;
      }
    }

    console.log(`Fetched ${allProducts.length} products from Shopify`);

    // Transform and insert products
    let imported = 0;
    let skipped = 0;

    for (const product of allProducts) {
      // Skip gift vouchers
      if (product.title.toLowerCase().includes("gift voucher")) {
        skipped++;
        continue;
      }

      // Map variants
      const variants = (product.variants || []).map((v: any, idx: number) => ({
        id: v.admin_graphql_api_id || `variant-${v.id}`,
        title: v.title || "Default",
        price: parseFloat(v.price) || 0,
        compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
        sku: v.sku || null,
        inventory_quantity: v.inventory_quantity || 0,
        available: (v.inventory_quantity || 0) > 0 || v.inventory_policy === "continue",
        options: {} as Record<string, string>,
      }));

      // Map option values to variants
      const optionNames = (product.options || []).map((o: any) => o.name);
      for (const variant of variants) {
        const shopifyVariant = product.variants.find((v: any) => 
          (v.admin_graphql_api_id || `variant-${v.id}`) === variant.id
        );
        if (shopifyVariant) {
          optionNames.forEach((name: string, idx: number) => {
            const optKey = `option${idx + 1}`;
            if (shopifyVariant[optKey]) {
              variant.options[name] = shopifyVariant[optKey];
            }
          });
        }
      }

      // Map options
      const options = (product.options || [])
        .filter((o: any) => !(o.values.length === 1 && o.values[0] === "Default Title"))
        .map((o: any) => ({
          name: o.name,
          values: o.values,
        }));

      // Get images
      const featuredImage = product.image?.src || product.images?.[0]?.src || null;
      const additionalImages = (product.images || [])
        .slice(1)
        .map((img: any) => img.src);

      // Get min price from variants
      const minPrice = Math.min(...(product.variants || []).map((v: any) => parseFloat(v.price) || 0));
      
      // Get total inventory
      const totalInventory = (product.variants || []).reduce(
        (sum: number, v: any) => sum + (v.inventory_quantity || 0), 0
      );

      const tags = product.tags ? product.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];

      const cmsProduct = {
        title: product.title,
        handle: product.handle,
        description: product.body_html ? product.body_html.replace(/<[^>]*>/g, '') : null,
        description_html: product.body_html || null,
        price: minPrice,
        compare_at_price: null,
        currency_code: "ZAR",
        sku: product.variants?.[0]?.sku || null,
        inventory_quantity: totalInventory,
        category: inferCategory(product),
        tags,
        status: "active",
        featured_image_url: featuredImage,
        additional_images: additionalImages.length > 0 ? additionalImages : null,
        collection: inferCollection(product),
        is_featured: false,
        options,
        variants,
        display_order: imported,
      };

      // Upsert by handle
      const { error } = await supabase
        .from("cms_products")
        .upsert(cmsProduct, { onConflict: "handle" });

      if (error) {
        console.error(`Failed to import ${product.title}:`, error);
        skipped++;
      } else {
        imported++;
        console.log(`Imported: ${product.title} → ${cmsProduct.collection}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: allProducts.length,
        imported,
        skipped,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Import failed";
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
