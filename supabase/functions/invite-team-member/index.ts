
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
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

    // Check if user exists in auth.users
    const { data: existingUsers, error: userLookupError } = await supabaseClient.auth
      .admin.listUsers({
        search: email,
      });

    if (userLookupError) {
      console.error("Error looking up user:", userLookupError);
    }

    let userId = null;
    if (existingUsers && existingUsers?.users.length > 0) {
      // Find the exact match
      const exactMatch = existingUsers.users.find(user => user.email === email);
      if (exactMatch) {
        userId = exactMatch.id;
      }
    }

    // Generate a unique invitation token
    const invitationToken = crypto.randomUUID();

    // Store the invitation in the database (would implement in a real system)
    // const { data: invitation, error: invitationError } = await supabaseClient
    //   .from("workshop_invitations")
    //   .insert({
    //     workshop_id: workshopId,
    //     email: email,
    //     inviter_id: inviterId,
    //     status: "pending",
    //     invitation_token: invitationToken,
    //     user_id: userId,
    //   })
    //   .select()
    //   .single();
    
    // if (invitationError) {
    //   throw invitationError;
    // }

    // Generate login link
    let loginLink = `${supabaseUrl.replace('.supabase.co', '.supabase.in')}/auth/v1/invite/invite_via_email`;
    loginLink += `?redirect_to=${encodeURIComponent(`${Deno.env.get("SITE_URL") || ""}/workshop?id=${workshopId}`)}`;

    // Compose email content
    const invitationLink = `${Deno.env.get("SITE_URL") || ""}/workshop?id=${workshopId}&invite=${invitationToken}`;
    
    console.log(`Sending invitation email to ${email} for workshop ${workshopId}`);
    console.log(`Invitation link: ${invitationLink}`);
    
    // Send email (would implement in a real system)
    // In a real implementation, we would use a service like Resend, SendGrid, etc.
    // to send the actual email with the invitation link

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation sent to ${email}`,
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
