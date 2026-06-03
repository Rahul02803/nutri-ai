import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Authenticate the user calling the function using their JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized access: Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Read Resend configuration
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Resend API key is not configured in secrets" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Parse payload name for display
    let name = "";
    try {
      const payload = await req.json();
      name = payload.name;
    } catch {
      // Allow fallback if no body is passed
    }

    const email = user.email!;
    const userName = name || user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
    const loginTime = new Date().toLocaleString("en-US", { timeZone: "UTC" }) + " UTC";

    const emailSubject = "Successful Login to ZenLog";
    const emailBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; line-height: 1.6; color: #1F2937; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; background-color: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 28px; font-weight: 900; color: #111827; letter-spacing: -0.5px; margin: 0;">ZenLog</h1>
          <p style="font-size: 10px; color: #6B7280; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin: 4px 0 0 0;">AI Meal Tracking</p>
        </div>
        
        <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
          <p style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 16px 0;">Hello ${userName},</p>
          <p style="font-size: 14px; color: #4B5563; margin: 0 0 24px 0;">You have successfully logged into <strong>ZenLog</strong>.</p>
          
          <div style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="font-size: 13px; color: #4B5563; margin: 0;"><strong>Login Time:</strong> ${loginTime}</p>
          </div>
          
          <p style="font-size: 12px; color: #EF4444; font-weight: 700; margin: 0 0 24px 0;">
            If this was not you, please contact support immediately.
          </p>
        </div>

        <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 24px; text-align: left;">
          <p style="font-size: 13px; color: #6B7280; margin: 0;">Thank you,</p>
          <p style="font-size: 13px; font-weight: 800; color: #111827; margin: 4px 0 0 0;">The ZenLog Team</p>
        </div>
      </div>
    `;

    // Send email using Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: "ZenLog <onboarding@resend.dev>",
        to: [email],
        subject: emailSubject,
        html: emailBody
      })
    });

    const resData = await res.json();

    if (!res.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(resData)}`);
    }

    return new Response(JSON.stringify({ success: true, message: "Login email sent successfully", data: resData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
