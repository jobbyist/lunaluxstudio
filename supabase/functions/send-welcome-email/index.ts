import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailData {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body: WelcomeEmailData = await req.json();
    const { email, name } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const displayName = name || 'Beautiful';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; padding: 50px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 32px; }
          .header .emoji { font-size: 50px; display: block; margin-bottom: 15px; }
          .header p { margin: 15px 0 0; opacity: 0.95; font-size: 18px; }
          .content { background: #ffffff; padding: 40px 30px; }
          .welcome-box { background: linear-gradient(135deg, #fef9e7, #fdf2d0); border: 2px solid #D4AF37; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0; }
          .welcome-box h2 { margin: 0 0 10px; color: #B8860B; }
          .tier-info { display: flex; gap: 15px; margin: 25px 0; flex-wrap: wrap; }
          .tier-card { flex: 1; min-width: 150px; background: #f9f9f9; border-radius: 10px; padding: 20px; text-align: center; }
          .tier-card.bronze { border-top: 4px solid #CD7F32; }
          .tier-card.silver { border-top: 4px solid #C0C0C0; }
          .tier-card.gold { border-top: 4px solid #FFD700; }
          .tier-card h4 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
          .tier-card p { margin: 0; font-size: 12px; color: #666; }
          .how-to-earn { background: #f9f9f9; border-radius: 12px; padding: 25px; margin: 25px 0; }
          .how-to-earn h3 { margin-top: 0; color: #333; }
          .how-to-earn ul { margin: 0; padding-left: 20px; }
          .how-to-earn li { margin: 10px 0; color: #555; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; margin: 20px 0; }
          .footer { background: #1a1a1a; color: #888; padding: 30px; text-align: center; font-size: 12px; }
          .footer a { color: #D4AF37; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="emoji">✨</span>
            <h1>Welcome to The Lux Club!</h1>
            <p>Hey ${displayName}, you're officially part of the family!</p>
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2>🎁 Your Membership is Active</h2>
              <p>Start earning points with every purchase and unlock exclusive rewards!</p>
            </div>

            <p>We're thrilled to have you join <strong>The Lux Club</strong> - our exclusive loyalty program designed to reward you for being amazing.</p>

            <h3>💎 Your Tier Journey</h3>
            <div class="tier-info">
              <div class="tier-card bronze">
                <h4>🥉 Bronze</h4>
                <p>0-499 points</p>
                <p><strong>5% off</strong> redemptions</p>
              </div>
              <div class="tier-card silver">
                <h4>🥈 Silver</h4>
                <p>500-999 points</p>
                <p><strong>10% off</strong> + early access</p>
              </div>
              <div class="tier-card gold">
                <h4>👑 Gold</h4>
                <p>1000+ points</p>
                <p><strong>15% off</strong> + VIP perks</p>
              </div>
            </div>

            <div class="how-to-earn">
              <h3>🌟 Ways to Earn Points</h3>
              <ul>
                <li><strong>Shop:</strong> Earn 1 point for every R10 spent</li>
                <li><strong>Review:</strong> Get 50 points for rating products</li>
                <li><strong>Refer:</strong> Earn points when friends make their first purchase</li>
                <li><strong>Birthday:</strong> Receive bonus points on your special day</li>
              </ul>
            </div>

            <p style="text-align: center;">
              <a href="https://lunaluxhair.com/explore" class="cta-button">Start Shopping</a>
            </p>

            <p>Ready to start your journey to gorgeous hair? Browse our collection and start earning points today!</p>
            
            <p>With love,<br><strong>The Luna Lux Hair Team</strong></p>
          </div>
          <div class="footer">
            <p>Luna Lux Hair | Premium Hair Extensions</p>
            <p><a href="https://lunaluxhair.com">Visit Our Store</a> | <a href="https://lunaluxhair.com/loyalty">View Your Rewards</a> | <a href="https://lunaluxhair.com/contact">Contact Us</a></p>
            <p style="margin-top: 15px; color: #666;">You're receiving this because you joined The Lux Club loyalty program.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Luna Lux Hair <onboarding@resend.dev>",
        to: [email],
        subject: "✨ Welcome to The Lux Club - Your Rewards Await!",
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to send welcome email:", errorData);
      throw new Error("Failed to send welcome email");
    }

    console.log(`Welcome email sent to ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Welcome email sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    console.error("Error in send-welcome-email:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
