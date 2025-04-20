
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
    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";
    
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
    const { workshopId, email, inviterId } = await req.json();
    console.log("Request body:", { workshopId, email, inviterId });

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

    // Check if the email has already been invited to this workshop
    const { data: existingInvites, error: checkError } = await supabaseClient
      .from("workshop_collaborators")
      .select("id")
      .eq("workshop_id", workshopId)
      .eq("email", email);

    if (checkError) {
      console.error("Error checking existing invites:", checkError);
      throw checkError;
    }

    // If the email has already been invited, return an error
    if (existingInvites && existingInvites.length > 0) {
      return new Response(
        JSON.stringify({
          error: "This email has already been invited to this workshop",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert the collaboration invitation
    const { data: invitation, error: invitationError } = await supabaseClient
      .from("workshop_collaborators")
      .insert({
        workshop_id: workshopId,
        email: email,
        invited_by: inviterId,
        status: "pending"
      })
      .select()
      .single();

    if (invitationError) {
      console.error("Error creating invitation:", invitationError);
      throw invitationError;
    }

    console.log("Invitation created:", invitation);
    console.log("About to send email with Resend");
    
    try {
      // Using the Resend sandbox mode with the verified onboarding email
      const { data, error } = await resend.emails.send({
        from: "Consensus Workshop <onboarding@resend.dev>", // Using Resend's default verified sender
        to: [email],
        subject: `You've been invited to collaborate on a Consensus Workshop`,
        html: `
          <h1>Workshop Collaboration Invite</h1>
          <p>You've been invited to collaborate on the workshop "${workshopData.name}".</p>
          <p>Click the link below to join:</p>
          <a href="${siteUrl}/workshop?id=${workshopId}&invite=${invitation.id}">Join Workshop</a>
          <p>If you didn't expect this invite, you can safely ignore this email.</p>
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
          message: `Invitation sent to ${email}`,
          invitation
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      
      // Still return a success response for the database operation
      // but include info that email couldn't be sent
      return new Response(
        JSON.stringify({
          success: true,
          emailSent: false,
          emailError: emailError.message,
          message: `Invitation created for ${email} but email could not be sent`,
          invitation
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error in invite-team-member function:", error);
    
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
