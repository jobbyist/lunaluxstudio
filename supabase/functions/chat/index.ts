import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_MAX_REQUESTS = 10; // Max requests per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log(`Chat request from IP: ${clientIP}`);

    // Check rate limit
    const oneMinuteAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { data: recentRequests, error: rateLimitError } = await supabase
      .from('chat_rate_limits')
      .select('id')
      .eq('ip_address', clientIP)
      .gte('created_at', oneMinuteAgo);

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      // Continue anyway to not block legitimate users
    }

    const requestCount = recentRequests?.length || 0;
    console.log(`Request count for ${clientIP}: ${requestCount}/${RATE_LIMIT_MAX_REQUESTS}`);

    if (requestCount >= RATE_LIMIT_MAX_REQUESTS) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please wait a minute before trying again.',
          retryAfter: 60 
        }), 
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          },
        }
      );
    }

    // Log this request for rate limiting
    const { error: insertError } = await supabase
      .from('chat_rate_limits')
      .insert({ ip_address: clientIP });

    if (insertError) {
      console.error('Failed to log rate limit:', insertError);
    }

    // Periodically clean up old entries (1 in 100 chance to avoid overhead)
    if (Math.random() < 0.01) {
      try {
        await supabase.rpc('cleanup_old_rate_limits');
        console.log('Cleaned up old rate limit entries');
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr);
      }
    }

    const { message } = await req.json();

    // Validate message
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Limit message length to prevent abuse
    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Message is too long. Maximum 2000 characters.' }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Processing chat message (${message.length} chars) from ${clientIP}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are Luna AI, a helpful and friendly assistant for Luna Luxury Hair, a premium hair extension and wig boutique based in South Africa.

ABOUT THE STORE:
- We specialize in luxury hair extensions, custom wigs, frontals, closures, and hair care products
- Products include: Brazilian, Peruvian, Malaysian hair bundles in various textures (Body Wave, Straight, Deep Wave, Kinky Curly)
- We offer custom wig construction and styling services
- Premium quality guaranteed with proper care

PRODUCTS & SERVICES:
- Hair Bundles: 12" to 30" lengths, various textures
- Frontals & Closures: 4x4, 5x5, 13x4, 13x6 lace options
- Custom Wigs: Made to order with client specifications
- Accessories: Wig caps, glue, edge control, care products
- Styling & Installation services available via booking

POLICIES:
- Shipping: 2-5 business days within South Africa
- Returns: 7-day return policy for unused, sealed items
- Payment: We accept Visa, Mastercard, EFT, SnapScan

CONTACT INFORMATION:
- Email: info@lunaluxhair.com
- Phone: +27 12 880 6560
- WhatsApp: +27 66 286 9181
- For more help, visit our Contact page at /contact

INSTRUCTIONS:
- Be warm, professional, and helpful
- Answer questions based on the information above
- For complex queries you cannot fully answer, encourage customers to contact us directly
- Keep responses concise but informative
- Always mention that a support ticket will be created for follow-up if needed`
          },
          {
            role: 'user',
            content: message
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error(`AI gateway error: ${response.status}`);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Our AI assistant is busy. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service temporarily unavailable. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log(`Chat response generated successfully for ${clientIP}`);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
