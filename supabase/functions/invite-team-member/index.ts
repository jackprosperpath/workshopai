
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@3.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const { workshopId, email, inviterId } = await req.json();

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

    // Fetch inviter's details
    const { data: inviterData, error: inviterError } = await supabaseClient
      .from('users')
      .select('email')
      .eq('id', inviterId)
      .single();

    if (inviterError) {
      throw inviterError;
    }

    // Fetch workshop details
    const { data: workshopData, error: workshopError } = await supabaseClient
      .from('workshops')
      .select('name')
      .eq('id', workshopId)
      .single();

    if (workshopError) {
      throw workshopError;
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
      throw invitationError;
    }

    // Send invitation email
    const { data, error } = await resend.emails.send({
      from: "Consensus <onboarding@lovable.dev>",
      to: email,
      subject: `You've been invited to collaborate on a Consensus Workshop`,
      html: `
        <h1>Workshop Collaboration Invite</h1>
        <p>You've been invited to collaborate on the workshop "${workshopData.name}" by ${inviterData.email}.</p>
        <p>Click the link below to join:</p>
        <a href="${Deno.env.get('SITE_URL')}/workshop?id=${workshopId}&invite=${invitation.id}">Join Workshop</a>
        <p>If you didn't expect this invite, you can safely ignore this email.</p>
      `
    });

    if (error) {
      throw error;
    }

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
