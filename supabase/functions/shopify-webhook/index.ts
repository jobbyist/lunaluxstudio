import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode as base64Encode } from 'https://deno.land/std@0.208.0/encoding/base64.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic',
};

// Points earning rate: 1 point per R10 spent
const POINTS_PER_RAND = 0.1;

// HMAC verification for Shopify webhooks
async function verifyShopifyHmac(rawBody: string, hmacHeader: string | null): Promise<boolean> {
  const webhookSecret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
  
  if (!webhookSecret) {
    console.error('SHOPIFY_WEBHOOK_SECRET not configured');
    return false;
  }

  if (!hmacHeader) {
    console.error('No HMAC header provided');
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
    const computedHmac = base64Encode(new Uint8Array(signature));
    
    const isValid = computedHmac === hmacHeader;
    if (!isValid) {
      console.error('HMAC verification failed');
    }
    return isValid;
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

// Send loyalty points notification email
async function sendPointsNotificationEmail(
  email: string,
  name: string | null,
  pointsEarned: number,
  totalPoints: number,
  orderId: string,
  orderTotal: string,
  currency: string
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping email notification');
    return;
  }

  const displayName = name || 'Valued Customer';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { background: #ffffff; padding: 40px 30px; }
        .points-box { background: linear-gradient(135deg, #fef9e7, #fdf2d0); border: 2px solid #D4AF37; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0; }
        .points-earned { font-size: 48px; font-weight: bold; color: #B8860B; margin: 0; }
        .points-label { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
        .total-points { margin-top: 20px; padding-top: 20px; border-top: 1px solid #D4AF37; }
        .total-points span { font-size: 24px; font-weight: bold; color: #333; }
        .order-details { background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-details p { margin: 5px 0; color: #666; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; margin: 20px 0; }
        .footer { background: #1a1a1a; color: #888; padding: 30px; text-align: center; font-size: 12px; }
        .footer a { color: #D4AF37; text-decoration: none; }
        .tier-info { margin-top: 20px; padding: 15px; background: #fff; border-radius: 8px; }
        .tier-info p { margin: 5px 0; font-size: 13px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 You Earned Points!</h1>
          <p>Thank you for your purchase, ${displayName}!</p>
        </div>
        <div class="content">
          <p>Great news! Your recent order has earned you loyalty points in <strong>The Lux Club</strong>.</p>
          
          <div class="points-box">
            <p class="points-label">Points Earned</p>
            <p class="points-earned">+${pointsEarned}</p>
            <div class="total-points">
              <p class="points-label">Your Total Balance</p>
              <span>${totalPoints} Points</span>
            </div>
          </div>

          <div class="order-details">
            <p><strong>Order #${orderId}</strong></p>
            <p>Order Total: ${currency} ${orderTotal}</p>
            <p>Points Rate: 1 point per R10 spent</p>
          </div>

          <div class="tier-info">
            <p><strong>💎 Tier Benefits Reminder:</strong></p>
            <p>• Bronze (0-499 pts): 5% discount on redemption</p>
            <p>• Silver (500-999 pts): 10% discount + early access</p>
            <p>• Gold (1000+ pts): 15% discount + VIP perks</p>
          </div>

          <p style="text-align: center;">
            <a href="https://lunaluxhair.com/loyalty" class="cta-button">View Your Rewards</a>
          </p>

          <p>Keep shopping to unlock more exclusive rewards and climb the tiers!</p>
          
          <p>With love,<br><strong>The Luna Lux Hair Team</strong></p>
        </div>
        <div class="footer">
          <p>Luna Lux Hair | Premium Hair Extensions</p>
          <p><a href="https://lunaluxhair.com">Visit Our Store</a> | <a href="https://lunaluxhair.com/contact">Contact Us</a></p>
          <p style="margin-top: 15px; color: #666;">You're receiving this because you're a member of The Lux Club loyalty program.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Luna Lux Hair <onboarding@resend.dev>',
        to: [email],
        subject: `🎉 You earned ${pointsEarned} loyalty points!`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send points notification email:', errorData);
    } else {
      console.log(`Points notification email sent to ${email}`);
    }
  } catch (error) {
    console.error('Error sending points notification email:', error);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get raw body for HMAC verification
    const rawBody = await req.text();
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const topic = req.headers.get('x-shopify-topic');

    console.log('Received webhook:', topic);

    // Verify HMAC signature
    const isValid = await verifyShopifyHmac(rawBody, hmacHeader);
    if (!isValid) {
      console.error('Webhook HMAC verification failed - rejecting request');
      return new Response(JSON.stringify({ error: 'Unauthorized - invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('HMAC verification successful');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = JSON.parse(rawBody);

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
        .select('user_id, email, full_name, loyalty_points')
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

          // Get updated profile for total points
          const { data: updatedProfile } = await supabase
            .from('user_profiles')
            .select('loyalty_points, full_name')
            .eq('user_id', authUser.id)
            .single();

          // Send email notification
          await sendPointsNotificationEmail(
            email,
            updatedProfile?.full_name || null,
            pointsEarned,
            updatedProfile?.loyalty_points || pointsEarned,
            orderId.toString(),
            total_price,
            currency
          );
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

        // Get updated profile for total points
        const { data: updatedProfile } = await supabase
          .from('user_profiles')
          .select('loyalty_points, full_name')
          .eq('user_id', profile.user_id)
          .single();

        // Send email notification
        await sendPointsNotificationEmail(
          email,
          updatedProfile?.full_name || profile.full_name,
          pointsEarned,
          updatedProfile?.loyalty_points || profile.loyalty_points + pointsEarned,
          orderId.toString(),
          total_price,
          currency
        );
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
