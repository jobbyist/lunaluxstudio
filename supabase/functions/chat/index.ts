import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

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
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

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
