import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode as base64Encode } from 'https://deno.land/std@0.208.0/encoding/base64.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic',
};

// Points earning rate: 1 point per R25 spent (excluding shipping)
const POINTS_PER_RAND = 0.04; // 1/25 = 0.04

// Tier thresholds
const TIER_THRESHOLDS = {
  bronze: { min: 0, max: 2499 },
  silver: { min: 2500, max: 4999 },
  gold: { min: 5000, max: Infinity },
};

// Referral bonus points by tier
const REFERRAL_BONUS = {
  Bronze: 100,
  Silver: 150,
  Gold: 200,
};

function getTierFromPoints(points: number): string {
  if (points >= TIER_THRESHOLDS.gold.min) return 'gold';
  if (points >= TIER_THRESHOLDS.silver.min) return 'silver';
  return 'bronze';
}

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
            <p>• Bronze (0-2,499 pts): 1x points multiplier</p>
            <p>• Silver (2,500-4,999 pts): 1.5x points + early access</p>
            <p>• Gold (5,000+ pts): 2x points + VIP perks</p>
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

// Send tier upgrade notification email
async function sendTierUpgradeEmail(
  email: string,
  name: string | null,
  newTier: string,
  totalPoints: number
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping tier upgrade email');
    return;
  }

  const displayName = name || 'Valued Customer';
  const tierEmoji = newTier === 'gold' ? '👑' : '🥈';
  const tierColor = newTier === 'gold' ? '#FFD700' : '#C0C0C0';
  const tierGradient = newTier === 'gold' 
    ? 'linear-gradient(135deg, #FFD700, #B8860B)' 
    : 'linear-gradient(135deg, #C0C0C0, #A8A8A8)';
  
  const tierBenefits = newTier === 'gold' 
    ? `
      <li>15% discount when redeeming points</li>
      <li>VIP early access to new collections</li>
      <li>Exclusive Gold member promotions</li>
      <li>Priority customer support</li>
      <li>Birthday surprise rewards</li>
      <li>Free shipping on orders over R500</li>
    `
    : `
      <li>10% discount when redeeming points</li>
      <li>Early access to new collections</li>
      <li>Exclusive Silver member promotions</li>
      <li>Birthday bonus points</li>
    `;

  const nextTierInfo = newTier === 'silver' 
    ? `<p style="margin-top: 20px; padding: 15px; background: #fff9e6; border-radius: 8px; border-left: 4px solid #FFD700;">
        <strong>🎯 Next Goal:</strong> Reach 1,000 points to unlock Gold status and enjoy 15% discounts plus VIP perks!
       </p>`
    : '';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: ${tierGradient}; color: white; padding: 50px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .header .emoji { font-size: 60px; display: block; margin-bottom: 15px; }
        .header p { margin: 15px 0 0; opacity: 0.95; font-size: 18px; }
        .content { background: #ffffff; padding: 40px 30px; }
        .tier-badge { display: inline-block; background: ${tierGradient}; color: white; padding: 8px 25px; border-radius: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 10px 0; }
        .benefits-box { background: #f9f9f9; border-radius: 12px; padding: 25px; margin: 25px 0; }
        .benefits-box h3 { margin-top: 0; color: #333; }
        .benefits-box ul { margin: 0; padding-left: 20px; }
        .benefits-box li { margin: 10px 0; color: #555; }
        .points-display { text-align: center; padding: 20px; background: linear-gradient(135deg, #fef9e7, #fdf2d0); border-radius: 12px; margin: 20px 0; }
        .points-display .number { font-size: 42px; font-weight: bold; color: #B8860B; }
        .points-display .label { font-size: 14px; color: #666; text-transform: uppercase; }
        .cta-button { display: inline-block; background: ${tierGradient}; color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; margin: 20px 0; }
        .footer { background: #1a1a1a; color: #888; padding: 30px; text-align: center; font-size: 12px; }
        .footer a { color: #D4AF37; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="emoji">${tierEmoji}</span>
          <h1>Congratulations, ${displayName}!</h1>
          <p>You've been upgraded to <span class="tier-badge">${newTier.toUpperCase()}</span> status!</p>
        </div>
        <div class="content">
          <p>Your loyalty has paid off! You've reached <strong>${newTier.charAt(0).toUpperCase() + newTier.slice(1)} Tier</strong> in The Lux Club, unlocking exclusive new benefits.</p>
          
          <div class="points-display">
            <div class="label">Your Points Balance</div>
            <div class="number">${totalPoints}</div>
          </div>

          <div class="benefits-box">
            <h3>${tierEmoji} Your New ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} Benefits:</h3>
            <ul>
              ${tierBenefits}
            </ul>
          </div>

          ${nextTierInfo}

          <p style="text-align: center;">
            <a href="https://lunaluxhair.com/loyalty" class="cta-button">Explore Your Benefits</a>
          </p>

          <p>Thank you for being a valued member of The Lux Club. We appreciate your continued support!</p>
          
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
        subject: `${tierEmoji} You've been upgraded to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} status!`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send tier upgrade email:', errorData);
    } else {
      console.log(`Tier upgrade email (${newTier}) sent to ${email}`);
    }
  } catch (error) {
    console.error('Error sending tier upgrade email:', error);
  }
}

// Process custom wig orders from line items
async function processCustomWigOrders(
  supabase: any,
  lineItems: any[],
  orderId: string,
  orderNumber: string,
  customerEmail: string,
  customer: any
): Promise<void> {
  if (!lineItems || !Array.isArray(lineItems)) {
    console.log('No line items to process');
    return;
  }

  for (const item of lineItems) {
    // Check if this is a custom wig order by looking at properties/attributes
    const properties = item.properties || [];
    const isCustomWig = properties.some((p: any) => p.name === '_custom_wig' && p.value === 'true');

    if (!isCustomWig) continue;

    console.log('Processing custom wig order:', item);

    // Extract custom wig details from properties
    const getProperty = (name: string): string => {
      const prop = properties.find((p: any) => p.name === name);
      return prop?.value || '';
    };

    const customSku = getProperty('_custom_sku');
    const totalPriceStr = getProperty('_total_price');
    const addonCostStr = getProperty('_addon_cost');
    const configuration = getProperty('_configuration');
    const baseBundle = getProperty('Base Bundle');

    // Calculate prices
    const totalPrice = parseFloat(totalPriceStr) || parseFloat(item.price) || 0;
    const addonCost = parseFloat(addonCostStr) || 0;
    const basePrice = totalPrice - addonCost;

    // Build configuration JSON from all properties
    const configJson: Record<string, string> = {};
    const excludeProps = ['_custom_wig', '_custom_sku', '_total_price', '_addon_cost', '_configuration', '_free_shipping'];
    for (const prop of properties) {
      if (!excludeProps.includes(prop.name)) {
        configJson[prop.name] = prop.value;
      }
    }

    // Check if order already exists
    const { data: existing } = await supabase
      .from('custom_wig_orders')
      .select('id')
      .eq('shopify_order_id', orderId.toString())
      .single();

    if (existing) {
      console.log('Custom wig order already processed:', orderId);
      continue;
    }

    // Insert custom wig order
    const { error } = await supabase
      .from('custom_wig_orders')
      .insert({
        shopify_order_id: orderId.toString(),
        shopify_order_number: orderNumber?.toString() || null,
        customer_email: customerEmail,
        customer_name: customer?.first_name ? `${customer.first_name} ${customer.last_name || ''}`.trim() : null,
        base_bundle: baseBundle || 'Unknown',
        base_price: basePrice,
        addon_cost: addonCost,
        total_price: totalPrice,
        configuration: configJson,
        custom_sku: customSku || null,
        status: 'pending',
      });

    if (error) {
      console.error('Error inserting custom wig order:', error);
    } else {
      console.log(`Custom wig order ${customSku} saved with total: ${totalPrice}, add-ons: ${addonCost}`);
    }
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
      const { email, total_price, id: orderId, currency, order_number, line_items, customer } = body;

      // Process custom wig orders from line items
      await processCustomWigOrders(supabase, line_items, orderId, order_number, email, customer);

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
        .select('user_id, email, full_name, loyalty_points, loyalty_tier')
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

          // Get updated profile for total points and check tier upgrade
          const { data: updatedProfile } = await supabase
            .from('user_profiles')
            .select('loyalty_points, full_name, loyalty_tier')
            .eq('user_id', authUser.id)
            .single();

          const newTotalPoints = updatedProfile?.loyalty_points || pointsEarned;
          const oldTier = 'bronze'; // New user starts at bronze
          const newTier = getTierFromPoints(newTotalPoints);

          // Send points notification email
          await sendPointsNotificationEmail(
            email,
            updatedProfile?.full_name || null,
            pointsEarned,
            newTotalPoints,
            orderId.toString(),
            total_price,
            currency
          );

          // Check for tier upgrade and send email
          if (newTier !== oldTier && (newTier === 'silver' || newTier === 'gold')) {
            await sendTierUpgradeEmail(
              email,
              updatedProfile?.full_name || null,
              newTier,
              newTotalPoints
            );

            // Update tier in database
            await supabase
              .from('user_profiles')
              .update({ loyalty_tier: newTier })
              .eq('user_id', authUser.id);
          }
        }

        return new Response(JSON.stringify({ success: true, pointsEarned: pointsEarned || 0 }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // User found in profiles
      const amount = parseFloat(total_price);
      const pointsEarned = Math.floor(amount * POINTS_PER_RAND);
      const oldTier = profile.loyalty_tier || 'bronze';
      const oldPoints = profile.loyalty_points || 0;

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
          .select('loyalty_points, full_name, loyalty_tier')
          .eq('user_id', profile.user_id)
          .single();

        const newTotalPoints = updatedProfile?.loyalty_points || oldPoints + pointsEarned;
        const newTier = getTierFromPoints(newTotalPoints);

        // Send points notification email
        await sendPointsNotificationEmail(
          email,
          updatedProfile?.full_name || profile.full_name,
          pointsEarned,
          newTotalPoints,
          orderId.toString(),
          total_price,
          currency
        );

        // Check for tier upgrade and send email
        if (newTier !== oldTier && (newTier === 'silver' || newTier === 'gold')) {
          console.log(`Tier upgrade detected: ${oldTier} -> ${newTier}`);
          
          await sendTierUpgradeEmail(
            email,
            updatedProfile?.full_name || profile.full_name,
            newTier,
            newTotalPoints
          );

          // Update tier in database
          await supabase
            .from('user_profiles')
            .update({ loyalty_tier: newTier })
            .eq('user_id', profile.user_id);
        }
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
