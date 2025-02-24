
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Email service configuration is missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { email, fullName, invitedByName } = await req.json();
    
    console.log("Processing invitation request for:", email);

    const resend = new Resend(resendApiKey);

    const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "http://localhost:3000";
    
    try {
      // Temporarily send all emails to your verified email
      const { data, error } = await resend.emails.send({
        from: "ParentPal <onboarding@resend.dev>",
        to: ["amer_moreau@hotmail.com"], // Your verified email
        subject: `[TEST] Invitation for ${email} - ChoreQuest Family Management`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome to ChoreQuest!</h1>
            <p>[TEST EMAIL - Originally meant for: ${email}]</p>
            <p>Hi ${fullName || email},</p>
            <p>${invitedByName} has invited you to join their family on ChoreQuest!</p>
            <p>ChoreQuest is a fun and engaging way to manage family chores and responsibilities.</p>
            <p style="margin: 24px 0;">
              <a href="${siteUrl}/auth" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Accept Invitation
              </a>
            </p>
            <p>If you can't click the button, copy and paste this link into your browser:</p>
            <p>${siteUrl}/auth</p>
            <p>Best regards,<br>The ChoreQuest Team</p>
          </div>
        `
      });

      if (error) {
        console.error("Resend API Error:", error);
        throw error;
      }

      console.log("Email sent successfully to test address");
      return new Response(
        JSON.stringify({ success: true, data }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );

    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send invitation email",
          details: emailError.message
        }),
        {
          status: 200, // Return 200 even on email error to avoid mutation error
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error) {
    console.error("General error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message
      }),
      {
        status: 200, // Return 200 to avoid mutation error
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
