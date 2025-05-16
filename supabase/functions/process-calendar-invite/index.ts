
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@3.1.0";
import ical from "npm:ical@0.8.0";

import { corsHeaders } from "./utils/corsHeaders.ts";
import { parseRequestData } from "./utils/parseRequest.ts";
import { parseIcsData } from "./utils/parseIcs.ts";
import { 
  storeInvitation,
  storeGeneratedBlueprint
} from "./utils/databaseOperations.ts";
import { sendConfirmationEmail } from "./utils/emailUtils.ts";
import { generateBlueprintFromInvite } from "./utils/blueprintGenerator.ts";
import type { Blueprint } from "./types/workshop.ts";

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const siteUrl = Deno.env.get('SITE_URL') ?? "https://app.teho.ai";
    const isDevelopment = siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1");
    
    console.log("Environment variables check:");
    console.log("- SUPABASE_URL exists:", !!supabaseUrl);
    console.log("- SUPABASE_SERVICE_ROLE_KEY exists:", !!supabaseServiceKey);
    console.log("- RESEND_API_KEY exists:", !!resendApiKey);
    console.log("- SITE_URL:", siteUrl);
    console.log("- Is Development:", isDevelopment);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    }
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    
    const resend = new Resend(resendApiKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json();
    
    // Parse the incoming data (either direct ICS or Cloudflare Email)
    const { rawIcs, email } = await parseRequestData(body);
    
    // Parse the ICS data and extract event information
    const { summary, description, startTime, endTime, durationMinutes, attendees, status } = parseIcsData(rawIcs);
    
    // Log extracted information
    console.log("Organizer email:", email);
    console.log("Event summary:", summary);
    console.log("Event description:", description);
    console.log("Event start time:", startTime.toISOString());
    console.log("Event end time:", endTime.toISOString());
    console.log("Event duration (minutes):", durationMinutes);
    console.log("Event status:", status);
    console.log("Attendees:", attendees);
    
    // Check if the event is active (not cancelled or declined)
    if (status === 'CANCELLED') {
      console.log("Event is cancelled, skipping blueprint generation");
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Event is cancelled, skipping blueprint generation',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    // Store the invitation in the database
    const inviteId = await storeInvitation(
      supabase, 
      rawIcs, 
      ical.parseICS(rawIcs), 
      email, 
      { summary, description, startTime, endTime, attendees, status }
    );

    // Generate a blueprint based on the calendar invite information
    const blueprintContent: Blueprint = await generateBlueprintFromInvite(
      supabase,
      summary,
      description,
      durationMinutes,
      attendees
    );
    
    // Store the generated blueprint
    const generatedBlueprintRecord = await storeGeneratedBlueprint(
      supabase,
      inviteId,
      blueprintContent
    );
    
    // Update the inbound_invites status to 'processed' (or a new status like 'blueprint_generated')
    await supabase
      .from('inbound_invites')
      .update({ 
        status: 'blueprint_generated', 
        processed_at: new Date().toISOString() 
      })
      .eq('id', inviteId);

    // Create a workshop entry for easier integration with the main app
    const { data: workshopData, error: workshopError } = await supabase
      .from('workshops')
      .insert({
        name: summary || blueprintContent.workshopTitle || "Untitled Meeting",
        problem: description || blueprintContent.meetingContext || "",
        duration: durationMinutes,
        share_id: generatedBlueprintRecord.share_id,  // Use the same share_id for consistency
        owner_id: email,  // Use email as owner since we don't have user ID yet
        generated_blueprint: blueprintContent,
        invitation_source_id: inviteId
      })
      .select()
      .single();

    if (workshopError) {
      console.error("Error creating workshop from blueprint:", workshopError);
      // Continue anyway since we have the generated blueprint
    } else {
      console.log("Created workshop from blueprint:", workshopData.id);
      
      // Update the inbound_invite with the workshop_id reference
      await supabase
        .from('inbound_invites')
        .update({ workshop_id: workshopData.id })
        .eq('id', inviteId);
    }
    
    // Send confirmation email to the organizer with a link to view the blueprint
    const shareId = generatedBlueprintRecord.share_id;
    await sendConfirmationEmail(
      resend, 
      email, 
      summary, 
      description, 
      shareId, // Just pass the share_id
      blueprintContent 
    );
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Blueprint generated and notification sent successfully',
        inviteId: inviteId,
        blueprintId: generatedBlueprintRecord.id,
        blueprintShareId: shareId,
        workshopId: workshopData?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error processing calendar invite:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
