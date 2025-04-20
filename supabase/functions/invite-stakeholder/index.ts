
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
      return new Response(
        JSON.stringify({
          error: "RESEND_API_KEY is not set in environment variables",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const resend = new Resend(resendApiKey);
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const requestData = await req.json();
    const { workshopId, email, inviterId, role } = requestData;
    console.log("Request body:", requestData);

    // Validate request
    if (!workshopId || !email || !inviterId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: workshopId, email, and inviterId are required",
          receivedData: requestData,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // First try to fetch workshop by UUID
    let workshopData = null;
    let workshopError = null;
    
    // First try to fetch by ID (assuming it's a UUID)
    if (workshopId.includes("-")) {
      const result = await supabaseClient
        .from('workshops')
        .select('name')
        .eq('id', workshopId)
        .maybeSingle();
        
      workshopData = result.data;
      workshopError = result.error;
      
      if (workshopError) {
        console.error("Error fetching workshop by ID:", workshopError);
      }
    }

    // If not found by ID, try using share_id
    if (!workshopData) {
      console.log("No workshop found with ID, trying share_id instead:", workshopId);
      
      const result = await supabaseClient
        .from('workshops')
        .select('name, id')
        .eq('share_id', workshopId)
        .maybeSingle();
      
      workshopData = result.data;
      workshopError = result.error;
      
      if (workshopError) {
        console.error("Error fetching workshop by share_id:", workshopError);
        return new Response(
          JSON.stringify({
            error: "Failed to fetch workshop details",
            details: workshopError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
    
    if (!workshopData) {
      return new Response(
        JSON.stringify({
          error: `Workshop not found with ID or share_id: ${workshopId}`,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log("Workshop data found:", workshopData);

    // Using the Resend API to send the email invite
    try {
      const { data, error } = await resend.emails.send({
        from: "Workshop AI <onboarding@resend.dev>", 
        to: [email],
        subject: `You've been invited as a stakeholder for a Workshop AI project`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Workshop Stakeholder Invite</h2>
            <p>You've been invited as a <strong>${role || 'Stakeholder'}</strong> for the workshop "${workshopData.name || 'Untitled Workshop'}".</p>
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
        return new Response(
          JSON.stringify({
            error: "Failed to send email",
            details: error,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
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
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({
          error: "Error sending email",
          details: emailError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Uncaught error in invite-stakeholder function:", error);
    
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
