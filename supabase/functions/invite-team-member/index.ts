
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@3.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
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
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://app.teho.ai";
    const isDevelopment = siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1");
    
    console.log("Environment variables check:");
    console.log("- SUPABASE_URL exists:", !!supabaseUrl);
    console.log("- SUPABASE_SERVICE_ROLE_KEY exists:", !!supabaseKey);
    console.log("- RESEND_API_KEY exists:", !!resendApiKey);
    console.log("- SITE_URL:", siteUrl);
    console.log("- Is Development:", isDevelopment);
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    }
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    
    const resend = new Resend(resendApiKey);
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const requestData = await req.json();
    const { workshopId, email, inviterId } = requestData;
    
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

    // First determine if workshopId is a UUID or a share_id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workshopId);
    
    // Fetch workshop details
    const workshopQuery = supabaseClient
      .from('workshops')
      .select('id, name, share_id');
    
    if (isUuid) {
      workshopQuery.eq('id', workshopId);
    } else {
      workshopQuery.eq('share_id', workshopId);
    }
      
    const { data: workshopData, error: workshopError } = await workshopQuery.single();

    if (workshopError) {
      console.error("Error fetching workshop:", workshopError);
      return new Response(
        JSON.stringify({
          error: `Error fetching workshop: ${workshopError.message}`,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Workshop data:", workshopData);
    
    const actualWorkshopId = workshopData.id;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if the email has already been invited to this workshop
    const { data: existingInvites, error: checkError } = await supabaseClient
      .from("workshop_collaborators")
      .select("id, email, status")
      .eq("workshop_id", actualWorkshopId)
      .eq("email", normalizedEmail);

    if (checkError) {
      console.error("Error checking existing invites:", checkError);
      return new Response(
        JSON.stringify({
          error: `Error checking existing invites: ${checkError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If the email has already been invited, return an error with clear message
    if (existingInvites && existingInvites.length > 0) {
      const existingInvite = existingInvites[0];
      console.log("Existing invite found:", existingInvite);
      
      return new Response(
        JSON.stringify({
          error: `This email has already been invited to this workshop`,
          existingInvite: {
            id: existingInvite.id,
            email: existingInvite.email,
            status: existingInvite.status
          }
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
        workshop_id: actualWorkshopId,
        email: normalizedEmail,
        invited_by: inviterId,
        status: "pending"
      })
      .select()
      .single();

    if (invitationError) {
      console.error("Error creating invitation:", invitationError);
      return new Response(
        JSON.stringify({
          error: `Error creating invitation: ${invitationError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Invitation created:", invitation);
    console.log("About to send email with Resend");
    
    // Get inviter email for development notification
    let inviterEmail = null;
    if (isDevelopment) {
      const { data: inviterData } = await supabaseClient
        .from('profiles')
        .select('email')
        .eq('id', inviterId)
        .single();
      
      if (inviterData?.email) {
        inviterEmail = inviterData.email;
      } else {
        const { data: authUser } = await supabaseClient.auth.admin.getUserById(inviterId);
        inviterEmail = authUser?.user?.email;
      }
    }

    try {
      // Using the Resend API to send the email invite
      const emailParams = {
        from: "Teho AI <noreply@app.teho.ai>", 
        to: [isDevelopment && inviterEmail ? inviterEmail : normalizedEmail],
        subject: `You've been invited to collaborate on a Teho AI workshop`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Workshop Collaboration Invite</h2>
            <p>You've been invited to collaborate on the workshop "${workshopData.name}".</p>
            ${isDevelopment && inviterEmail !== normalizedEmail ? 
              `<p><strong>Note:</strong> This is a development environment email. In production, this would be sent to: ${normalizedEmail}</p>` : ''}
            <p>Click the button below to join:</p>
            <a href="${siteUrl}/workshop?id=${workshopData.share_id || workshopData.id}&invite=${invitation.id}" 
               style="display: inline-block; background-color: #4F46E5; color: white; 
                      padding: 10px 20px; text-decoration: none; border-radius: 5px; 
                      margin: 15px 0;">
              Join Workshop
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you didn't expect this invite, you can safely ignore this email.
            </p>
          </div>
        `
      };

      const { data, error } = await resend.emails.send(emailParams);

      if (error) {
        console.error("Resend error details:", JSON.stringify(error, null, 2));
        throw error;
      }

      console.log("Email sent successfully:", data);

      // Return success response with info about who the email was actually sent to
      return new Response(
        JSON.stringify({
          success: true,
          message: `Invitation sent to ${normalizedEmail}`,
          emailSent: true,
          emailSentTo: isDevelopment && inviterEmail ? inviterEmail : normalizedEmail,
          isDevelopment,
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
          message: `Invitation created for ${normalizedEmail} but email could not be sent`,
          invitation,
          devNote: "To send emails to other recipients in development, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain."
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
