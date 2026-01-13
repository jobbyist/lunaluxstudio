import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentLinkRequest {
  orderId: string;
  amount: number; // Amount in cents
  customerEmail: string;
  customerName: string | null;
  orderReference: string;
  customSku: string | null;
}

async function getStitchAccessToken(): Promise<string> {
  const clientId = Deno.env.get('STITCH_EXPRESS_CLIENT_ID');
  const clientSecret = Deno.env.get('STITCH_EXPRESS_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Stitch Express credentials not configured');
  }

  const response = await fetch('https://express.stitch.money/api/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'client_paymentrequest',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Stitch token error:', error);
    throw new Error('Failed to obtain Stitch access token');
  }

  const data = await response.json();
  return data.access_token;
}

async function createPaymentLink(
  accessToken: string,
  amount: number,
  reference: string,
  customerEmail: string
): Promise<{ id: string; url: string }> {
  const response = await fetch('https://express.stitch.money/api/v1/payment-links', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount, // Amount in cents
      externalReference: reference,
      payerEmail: customerEmail,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Stitch payment link error:', error);
    throw new Error('Failed to create payment link');
  }

  const data = await response.json();
  return {
    id: data.id,
    url: data.url,
  };
}

async function sendPaymentLinkEmail(
  email: string,
  name: string | null,
  paymentUrl: string,
  addonAmount: number,
  orderReference: string,
  customSku: string | null
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping email');
    return;
  }

  const displayName = name || 'Valued Customer';
  const formattedAmount = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(addonAmount / 100);

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #1a1a1a, #333); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 10px 0 0; opacity: 0.9; color: #D4AF37; }
        .content { background: #ffffff; padding: 40px 30px; }
        .amount-box { background: linear-gradient(135deg, #fef9e7, #fdf2d0); border: 2px solid #D4AF37; border-radius: 12px; padding: 30px; text-align: center; margin: 25px 0; }
        .amount { font-size: 42px; font-weight: bold; color: #B8860B; margin: 0; }
        .amount-label { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .order-ref { font-family: monospace; font-size: 14px; color: #666; margin-top: 15px; }
        .info-box { background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-box p { margin: 5px 0; color: #555; font-size: 14px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; text-decoration: none; padding: 18px 50px; border-radius: 30px; font-weight: bold; font-size: 16px; margin: 25px 0; }
        .cta-button:hover { background: linear-gradient(135deg, #B8860B, #8B6914); }
        .footer { background: #1a1a1a; color: #888; padding: 30px; text-align: center; font-size: 12px; }
        .footer a { color: #D4AF37; text-decoration: none; }
        .security-note { font-size: 12px; color: #888; text-align: center; margin-top: 20px; }
        .security-note span { color: #4CAF50; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Complete Your Custom Wig Order</h1>
          <p>Payment Required for Add-on Customizations</p>
        </div>
        <div class="content">
          <p>Hi ${displayName},</p>
          
          <p>Thank you for your custom wig order! Your base bundle payment has been received. To complete your order, please pay for your selected add-on customizations.</p>
          
          <div class="amount-box">
            <p class="amount-label">Add-on Customization Fee</p>
            <p class="amount">${formattedAmount}</p>
            ${customSku ? `<p class="order-ref">SKU: ${customSku}</p>` : ''}
            <p class="order-ref">Order: #${orderReference}</p>
          </div>

          <div class="info-box">
            <p><strong>What's included:</strong></p>
            <p>This payment covers the additional customizations you selected for your wig, including any upgrades to length, color, styling, or special features beyond the base bundle.</p>
          </div>

          <p style="text-align: center;">
            <a href="${paymentUrl}" class="cta-button">Pay Now – ${formattedAmount}</a>
          </p>

          <p class="security-note">
            <span>🔒</span> Secure payment powered by Stitch Express
          </p>

          <div class="info-box">
            <p><strong>Accepted Payment Methods:</strong></p>
            <p>• Instant EFT (Pay with your bank)</p>
            <p>• Credit/Debit Card (Visa, Mastercard)</p>
            <p>• SnapScan</p>
          </div>

          <p>Once payment is received, our production team will begin crafting your custom wig. You'll receive updates as your order progresses.</p>
          
          <p>If you have any questions, please don't hesitate to reach out.</p>

          <p>With love,<br><strong>The Luna Lux Hair Team</strong></p>
        </div>
        <div class="footer">
          <p>Luna Lux Hair | Premium Custom Wigs</p>
          <p><a href="https://lunaluxhair.com">Visit Our Store</a> | <a href="mailto:info@lunaluxhair.com">Contact Us</a></p>
          <p style="margin-top: 15px; color: #666;">This payment link expires in 24 hours.</p>
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
        subject: `Complete Your Custom Wig Order – ${formattedAmount} Due`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send payment link email:', errorData);
    } else {
      console.log(`Payment link email sent to ${email}`);
    }
  } catch (error) {
    console.error('Error sending payment link email:', error);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, amount, customerEmail, customerName, orderReference, customSku }: PaymentLinkRequest = await req.json();

    if (!orderId || !amount || !customerEmail || !orderReference) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating payment link for order ${orderId}, amount: ${amount} cents`);

    // Get Stitch access token
    const accessToken = await getStitchAccessToken();

    // Create payment link
    const reference = customSku || orderReference;
    const paymentLink = await createPaymentLink(accessToken, amount, reference, customerEmail);

    console.log(`Payment link created: ${paymentLink.id}`);

    // Update the order with payment link info
    const { error: updateError } = await supabase
      .from('custom_wig_orders')
      .update({
        payment_link_id: paymentLink.id,
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order with payment link:', updateError);
    }

    // Send email with payment link
    await sendPaymentLinkEmail(
      customerEmail,
      customerName,
      paymentLink.url,
      amount,
      orderReference,
      customSku
    );

    return new Response(
      JSON.stringify({
        success: true,
        paymentLinkId: paymentLink.id,
        paymentUrl: paymentLink.url,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating payment link:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
