
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@3.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://workshopai.lovable.app";
    
    console.log("Environment variables check:");
    console.log("- SUPABASE_URL exists:", !!supabaseUrl);
    console.log("- SUPABASE_SERVICE_ROLE_KEY exists:", !!supabaseKey);
    console.log("- RESEND_API_KEY exists:", !!resendApiKey);
    console.log("- SITE_URL:", siteUrl);
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    
    const resend = new Resend(resendApiKey);
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const { workshopId, email, inviterId, role } = await req.json();
    console.log("Request body:", { workshopId, email, inviterId, role });

    // Validate request
    if (!workshopId || !email || !inviterId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: workshopId, email, and inviterId are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch workshop details
    const { data: workshopData, error: workshopError } = await supabaseClient
      .from('workshops')
      .select('name')
      .eq('id', workshopId)
      .single();

    if (workshopError) {
      console.error("Error fetching workshop:", workshopError);
      throw workshopError;
    }

    console.log("Workshop data:", workshopData);

    // Using the Resend API to send the email invite
    const { data, error } = await resend.emails.send({
      from: "Workshop AI <onboarding@resend.dev>", 
      to: [email],
      subject: `You've been invited as a stakeholder for a Workshop AI project`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Workshop Stakeholder Invite</h2>
          <p>You've been invited as a <strong>${role || 'Stakeholder'}</strong> for the workshop "${workshopData.name}".</p>
          <p>Click the button below to review and endorse this workshop:</p>
          <a href="${siteUrl}/workshop?id=${workshopId}" 
             style="display: inline-block; background-color: #3b82f6; color: white; 
                    padding: 10px 20px; text-decoration: none; border-radius: 5px; 
                    margin: 15px 0;">
            Review Workshop
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you didn't expect this invite, you can safely ignore this email.
          </p>
        </div>
      `
    });

    if (error) {
      console.error("Resend error details:", JSON.stringify(error, null, 2));
      throw error;
    }

    console.log("Email sent successfully:", data);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation sent to ${email}`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in invite-stakeholder function:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
