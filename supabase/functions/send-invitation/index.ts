
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    const { email, fullName, invitedByName } = await req.json();
    
    console.log("Received request to send invitation:", {
      email,
      fullName,
      invitedByName,
      resendApiKey: !!Deno.env.get("RESEND_API_KEY"), // Log if we have the API key (true/false)
    });

    if (!Deno.env.get("RESEND_API_KEY")) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const { data, error } = await resend.emails.send({
      from: "ChoreQuest <onboarding@resend.dev>",
      to: [email], // Make sure email is in an array
      subject: "You've been invited to join ChoreQuest!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to ChoreQuest!</h1>
          <p>Hi ${fullName || email},</p>
          <p>${invitedByName} has invited you to join their family on ChoreQuest!</p>
          <p>ChoreQuest is a fun and engaging way to manage family chores and responsibilities.</p>
          <p style="margin: 24px 0;">
            <a href="${Deno.env.get("PUBLIC_SITE_URL") || "http://localhost:3000"}/auth" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Accept Invitation
            </a>
          </p>
          <p>If you can't click the button, copy and paste this link into your browser:</p>
          <p>${Deno.env.get("PUBLIC_SITE_URL") || "http://localhost:3000"}/auth</p>
          <p>Best regards,<br>The ChoreQuest Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
