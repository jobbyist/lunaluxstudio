import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const snipcartSecretKey = Deno.env.get('SNIPCART_SECRET_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-snipcart-requesttoken',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify Snipcart signature
    const signature = req.headers.get('x-snipcart-requesttoken');
    
    // TODO: Implement proper signature verification
    // For now, we'll just check if the header exists
    if (!signature) {
      console.warn('Missing Snipcart signature header');
      // In production, you should verify the signature properly
    }

    const event = await req.json();
    console.log('Received Snipcart event:', event.eventName);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event.eventName === 'order.completed') {
      const order = event.content;
      console.log('Processing completed order:', order.token);

      // Find user by email
      const { data: authUser } = await supabase.auth.admin.listUsers();
      const user = authUser?.users?.find(u => u.email === order.email);

      // Insert order into database
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          snipcart_order_id: order.token,
          snipcart_invoice_number: order.invoiceNumber,
          user_id: user?.id || null,
          customer_email: order.email,
          customer_name: order.billingAddress 
            ? `${order.billingAddress.fullName}` 
            : order.cardHolderName || 'Unknown',
          customer_phone: order.phone || null,
          billing_address: order.billingAddress,
          shipping_address: order.shippingAddress,
          items: order.items,
          subtotal: order.subtotal || 0,
          shipping_cost: order.shippingInformation?.cost || 0,
          tax_amount: order.taxesTotal || 0,
          discount_amount: order.discounts?.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0,
          total_amount: order.total || 0,
          currency: order.currency || 'ZAR',
          payment_status: order.paymentStatus || 'paid',
          payment_method: order.paymentMethod || 'card',
          payment_gateway: 'snipcart',
          fulfillment_status: 'unfulfilled',
          metadata: order.metadata || {},
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error inserting order:', orderError);
        
        // Check if it's a duplicate order (unique constraint violation)
        if (orderError.code === '23505') {
          console.log('Order already exists, skipping...');
          return new Response(
            JSON.stringify({ success: true, message: 'Order already processed' }), 
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
        
        throw orderError;
      }

      console.log('Order inserted successfully:', insertedOrder?.id);

      // Insert order items
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          // Try to find matching product in cms_products
          const { data: cmsProduct } = await supabase
            .from('cms_products')
            .select('id')
            .eq('snipcart_id', item.id)
            .single();

          const { error: itemError } = await supabase
            .from('order_items')
            .insert({
              order_id: insertedOrder.id,
              product_id: cmsProduct?.id || null,
              snipcart_product_id: item.id,
              product_name: item.name,
              product_variant: item.variant || null,
              quantity: item.quantity,
              unit_price: item.price,
              total_price: item.totalPrice || (item.price * item.quantity),
              sku: item.uniqueId || null,
              image_url: item.image || null,
              metadata: item.customFields || {},
            });

          if (itemError) {
            console.error('Error inserting order item:', itemError);
          }

          // Update inventory if stock management is enabled
          if (cmsProduct?.id) {
            const { data: productData } = await supabase
              .from('cms_products')
              .select('inventory_quantity, track_inventory')
              .eq('id', cmsProduct.id)
              .single();

            if (productData?.track_inventory && productData.inventory_quantity !== null) {
              const newQuantity = Math.max(0, productData.inventory_quantity - item.quantity);
              await supabase
                .from('cms_products')
                .update({ inventory_quantity: newQuantity })
                .eq('id', cmsProduct.id);
              
              console.log(`Updated inventory for product ${cmsProduct.id}: ${productData.inventory_quantity} -> ${newQuantity}`);
            }
          }
        }
      }

      // Award loyalty points (if user exists)
      if (user?.id) {
        const pointsEarned = Math.floor(order.total / 10); // 1 point per R10
        
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('loyalty_points')
          .eq('user_id', user.id)
          .single();

        if (userProfile) {
          // Insert loyalty transaction
          await supabase.from('loyalty_transactions').insert({
            user_id: user.id,
            points: pointsEarned,
            transaction_type: 'earn',
            description: `Purchase - Order ${order.invoiceNumber}`,
            order_reference: order.token,
          });

          // Update user profile with new points
          const newPoints = (userProfile.loyalty_points || 0) + pointsEarned;
          await supabase
            .from('user_profiles')
            .update({ loyalty_points: newPoints })
            .eq('user_id', user.id);

          console.log(`Awarded ${pointsEarned} loyalty points to user ${user.id}`);
        }
      }

      console.log('Order processing complete');
    } else if (event.eventName === 'order.status.changed') {
      const order = event.content;
      console.log('Order status changed:', order.token, 'to', order.status);

      // Update order status
      await supabase
        .from('orders')
        .update({
          payment_status: order.paymentStatus,
          fulfillment_status: order.status === 'Shipped' ? 'shipped' : 'unfulfilled',
        })
        .eq('snipcart_order_id', order.token);
    } else if (event.eventName === 'order.trackingNumber.changed') {
      const order = event.content;
      console.log('Tracking number updated:', order.token, order.trackingNumber);

      await supabase
        .from('orders')
        .update({
          tracking_number: order.trackingNumber,
          tracking_url: order.trackingUrl || null,
          shipped_at: new Date().toISOString(),
        })
        .eq('snipcart_order_id', order.token);
    }

    return new Response(
      JSON.stringify({ success: true }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
