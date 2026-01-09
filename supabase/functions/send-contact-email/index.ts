import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// HTML escape function to prevent XSS
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Validation function
function validateContact(data: unknown): { valid: boolean; error?: string; data?: ContactFormData } {
  const input = data as Record<string, unknown>;
  
  if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }
  if (input.name.length > 100) {
    return { valid: false, error: "Name is too long" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || typeof input.email !== 'string' || !emailRegex.test(input.email.trim())) {
    return { valid: false, error: "Invalid email address" };
  }
  if (input.email.length > 255) {
    return { valid: false, error: "Email is too long" };
  }
  
  if (!input.subject || typeof input.subject !== 'string' || input.subject.trim().length === 0) {
    return { valid: false, error: "Subject is required" };
  }
  if (input.subject.length > 200) {
    return { valid: false, error: "Subject is too long" };
  }
  
  if (!input.message || typeof input.message !== 'string' || input.message.trim().length === 0) {
    return { valid: false, error: "Message is required" };
  }
  if (input.message.length > 5000) {
    return { valid: false, error: "Message is too long" };
  }
  
  return {
    valid: true,
    data: {
      name: (input.name as string).trim(),
      email: (input.email as string).trim(),
      subject: (input.subject as string).trim(),
      message: (input.message as string).trim(),
    }
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = validateContact(body);
    if (!validationResult.valid || !validationResult.data) {
      console.error("Validation failed:", validationResult.error);
      return new Response(
        JSON.stringify({ error: validationResult.error }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, subject, message } = validationResult.data;

    // Escape all user input for HTML safety
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    console.log(`Processing contact form from: ${email}`);

    // Email to business (info@ and webmaster@)
    const businessEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border: 1px solid #e0e0e0; }
          .message-box { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Customer Inquiry</h1>
            <p>Luna Lux Hair Contact Form</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">From:</div>
              <div class="value">${safeName} (${safeEmail})</div>
            </div>
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${safeSubject}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="value message-box">${safeMessage}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Confirmation email to customer
    const confirmationEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You, ${safeName}!</h1>
            <p>We've received your message</p>
          </div>
          <div class="content">
            <p>Thank you for reaching out to Luna Lux Hair. We have received your inquiry and our team will get back to you within 24-48 hours.</p>
            <p><strong>Your Subject:</strong> ${safeSubject}</p>
            <p>If you have any urgent questions, feel free to reach us via WhatsApp at +27 66 286 9181.</p>
            <p>Best regards,<br><strong>The Luna Lux Hair Team</strong></p>
          </div>
          <div class="footer">
            <p>Luna Lux Hair | Premium Hair Extensions</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to business addresses using Resend API directly
    const businessEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Luna Lux Hair <onboarding@resend.dev>",
        to: ["info@lunaluxhair.com", "webmaster@lunaluxhair.com"],
        reply_to: email,
        subject: `Contact Form: ${subject}`,
        html: businessEmailHtml,
      }),
    });

    if (!businessEmailResponse.ok) {
      const errorData = await businessEmailResponse.json();
      console.error("Failed to send business email:", errorData);
      throw new Error("Failed to send email to business");
    }

    console.log("Business email sent successfully");

    // Send confirmation to customer
    const confirmationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Luna Lux Hair <onboarding@resend.dev>",
        to: [email],
        subject: "We received your message - Luna Lux Hair",
        html: confirmationEmailHtml,
      }),
    });

    if (!confirmationResponse.ok) {
      const errorData = await confirmationResponse.json();
      console.error("Failed to send confirmation email:", errorData);
      // Don't throw here - business email was sent successfully
    } else {
      console.log("Confirmation email sent successfully");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Emails sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
