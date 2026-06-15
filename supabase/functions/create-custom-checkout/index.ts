import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { computeCustomWigUnitPrice } from "../_shared/wig-pricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHOPIFY_STORE_DOMAIN = "lunaluxstudio-yi8zs.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (!shopifyAccessToken) {
      throw new Error("SHOPIFY_ACCESS_TOKEN not configured");
    }

    const { customWigItems, regularItems, customerEmail }: CheckoutRequest = await req.json();

    console.log("Creating custom checkout with:", {
      customWigItemCount: customWigItems?.length || 0,
      regularItemCount: regularItems?.length || 0,
    });

    // Build line items for the draft order
    const lineItems: any[] = [];

    // Add custom wig items — SERVER-SIDE PRICING ONLY. Client-supplied prices are ignored.
    if (customWigItems && customWigItems.length > 0) {
      for (const item of customWigItems) {
        if (!Array.isArray(item.selectedOptions)) {
          return new Response(
            JSON.stringify({ success: false, error: "Custom wig item missing selectedOptions" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        let serverUnitPrice: number;
        try {
          serverUnitPrice = computeCustomWigUnitPrice(item.selectedOptions);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Invalid wig configuration";
          return new Response(
            JSON.stringify({ success: false, error: msg }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        const qty = Math.max(1, Math.min(50, Math.floor(Number(item.quantity) || 1)));

        const configSummary = item.selectedOptions
          .filter((opt) => opt.name !== "SKU" && opt.name !== "Free Shipping")
          .map((opt) => `${opt.name}: ${opt.value}`)
          .join(" | ");

        lineItems.push({
          title: `Custom Luna Luxury Wig - ${item.baseBundle ?? "Custom"}`,
          quantity: qty,
          price: serverUnitPrice.toFixed(2), // SERVER-computed price
          requires_shipping: true,
          taxable: true,
          properties: [
            { name: "_custom_wig", value: "true" },
            { name: "_custom_sku", value: item.customSku ?? "" },
            { name: "_server_unit_price", value: serverUnitPrice.toFixed(2) },
            { name: "_configuration", value: configSummary },
            { name: "Free Shipping", value: "Included" },
            ...item.selectedOptions
              .filter((opt) => opt.name !== "SKU" && opt.name !== "Free Shipping")
              .map((opt) => ({ name: opt.name, value: opt.value })),
          ],
        });
      }
    }

    // Add regular items using their variant IDs (Shopify uses its own catalog price)
    if (regularItems && regularItems.length > 0) {
      for (const item of regularItems) {
        const variantId = item.variantId.replace("gid://shopify/ProductVariant/", "");
        lineItems.push({
          variant_id: parseInt(variantId),
          quantity: Math.max(1, Math.min(50, Math.floor(Number(item.quantity) || 1))),
        });
      }
    }


    if (lineItems.length === 0) {
      throw new Error("No items provided for checkout");
    }

    // Create draft order with Admin API
    const draftOrderPayload: any = {
      draft_order: {
        line_items: lineItems,
        use_customer_default_address: true,
        note: "Order contains custom wig with add-on pricing",
      },
    };

    // Add customer email if provided
    if (customerEmail) {
      draftOrderPayload.draft_order.email = customerEmail;
    }

    // Check if any custom wig items have free shipping
    const hasCustomWig = customWigItems && customWigItems.length > 0;
    if (hasCustomWig) {
      // Apply free shipping for custom wig orders
      draftOrderPayload.draft_order.shipping_line = {
        title: "Free Shipping (Custom Wig)",
        price: "0.00",
        custom: true,
      };
    }

    console.log("Creating draft order:", JSON.stringify(draftOrderPayload, null, 2));

    const draftOrderResponse = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": shopifyAccessToken,
        },
        body: JSON.stringify(draftOrderPayload),
      }
    );

    if (!draftOrderResponse.ok) {
      const errorText = await draftOrderResponse.text();
      console.error("Draft order creation failed:", errorText);

      // Shopify can require merchant approval when an access token/app scope changes.
      // Surface a clear error so the frontend can show actionable guidance.
      if (
        errorText.includes("merchant approval") ||
        errorText.includes("write_draft_orders")
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              "Shopify requires merchant approval for draft orders (write_draft_orders). Please re-authorize the Shopify Admin API access token with the Draft Orders permission, then try again.",
            code: "SHOPIFY_DRAFT_ORDERS_SCOPE_APPROVAL_REQUIRED",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          }
        );
      }

      throw new Error(`Failed to create draft order: ${errorText}`);
    }

    const draftOrderData = await draftOrderResponse.json();
    const draftOrder = draftOrderData.draft_order;

    console.log("Draft order created:", {
      id: draftOrder.id,
      invoiceUrl: draftOrder.invoice_url,
      status: draftOrder.status,
    });

    // Return the invoice URL which can be used for checkout
    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: draftOrder.invoice_url,
        draftOrderId: draftOrder.id,
        orderName: draftOrder.name,
        totalPrice: draftOrder.total_price,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create checkout";
    console.error("Error creating custom checkout:", error);
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
