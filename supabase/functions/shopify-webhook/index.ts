import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic',
};

// Points earning rate: 1 point per R10 spent
const POINTS_PER_RAND = 0.1;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const topic = req.headers.get('x-shopify-topic');
    const body = await req.json();

    console.log('Received webhook:', topic);

    // Handle order paid webhook
    if (topic === 'orders/paid') {
      const { email, total_price, id: orderId, currency } = body;

      if (!email || !total_price) {
        console.log('Missing required fields:', { email, total_price });
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Find user by email in user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id, email')
        .eq('email', email.toLowerCase())
        .single();

      if (profileError || !profile) {
        // Try to find user in auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.log('Error finding user:', authError);
          return new Response(JSON.stringify({ message: 'User not found, points not awarded' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const authUser = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        
        if (!authUser) {
          console.log('User not registered:', email);
          return new Response(JSON.stringify({ message: 'User not registered, points not awarded' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update profile with email if not set
        await supabase
          .from('user_profiles')
          .update({ email: email.toLowerCase() })
          .eq('user_id', authUser.id);

        // Calculate points (1 point per R10)
        const amount = parseFloat(total_price);
        const pointsEarned = Math.floor(amount * POINTS_PER_RAND);

        if (pointsEarned > 0) {
          // Check if this order already awarded points
          const { data: existingTransaction } = await supabase
            .from('loyalty_transactions')
            .select('id')
            .eq('order_id', orderId.toString())
            .single();

          if (existingTransaction) {
            console.log('Points already awarded for order:', orderId);
            return new Response(JSON.stringify({ message: 'Points already awarded' }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Award points
          const { error: transactionError } = await supabase
            .from('loyalty_transactions')
            .insert({
              user_id: authUser.id,
              points: pointsEarned,
              transaction_type: 'purchase',
              order_id: orderId.toString(),
              description: `Earned ${pointsEarned} points from order #${orderId} (${currency} ${total_price})`,
            });

          if (transactionError) {
            console.error('Error creating transaction:', transactionError);
            throw transactionError;
          }

          console.log(`Awarded ${pointsEarned} points to user ${authUser.id} for order ${orderId}`);
        }

        return new Response(JSON.stringify({ success: true, pointsEarned: pointsEarned || 0 }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // User found in profiles
      const amount = parseFloat(total_price);
      const pointsEarned = Math.floor(amount * POINTS_PER_RAND);

      if (pointsEarned > 0) {
        // Check if this order already awarded points
        const { data: existingTransaction } = await supabase
          .from('loyalty_transactions')
          .select('id')
          .eq('order_id', orderId.toString())
          .single();

        if (existingTransaction) {
          console.log('Points already awarded for order:', orderId);
          return new Response(JSON.stringify({ message: 'Points already awarded' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Award points
        const { error: transactionError } = await supabase
          .from('loyalty_transactions')
          .insert({
            user_id: profile.user_id,
            points: pointsEarned,
            transaction_type: 'purchase',
            order_id: orderId.toString(),
            description: `Earned ${pointsEarned} points from order #${orderId} (${currency} ${total_price})`,
          });

        if (transactionError) {
          console.error('Error creating transaction:', transactionError);
          throw transactionError;
        }

        console.log(`Awarded ${pointsEarned} points to user ${profile.user_id} for order ${orderId}`);
      }

      return new Response(JSON.stringify({ success: true, pointsEarned: pointsEarned || 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Webhook received' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
