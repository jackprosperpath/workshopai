
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@3.1.0";
import ical from "npm:ical@0.8.0";

import { corsHeaders } from "./utils/corsHeaders.ts";
import { parseRequestData } from "./utils/parseRequest.ts";
import { parseIcsData } from "./utils/parseIcs.ts";
import { findExistingUser } from "./utils/userManagement.ts";
import { 
  storeInvitation, 
  createWorkshopFromInvite, 
  updateInvitationWithWorkshop 
} from "./utils/databaseOperations.ts";
import { sendConfirmationEmail } from "./utils/emailUtils.ts";

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
    
    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    if (!resendApiKey) {
      throw new Error('Missing Resend API key');
    }

    // Initialize clients
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);
    
    // Parse request body
    const body = await req.json();
    
    // Parse the incoming data (either direct ICS or Cloudflare Email)
    const { rawIcs, email } = await parseRequestData(body);
    
    // Parse the ICS data and extract event information
    const parsedIcs = ical.parseICS(rawIcs);
    const { summary, description, startTime, endTime, durationMinutes, attendees } = parseIcsData(rawIcs);
    
    // Log extracted information
    console.log("Organizer email:", email);
    console.log("Event summary:", summary);
    console.log("Event description:", description);
    console.log("Event start time:", startTime.toISOString());
    console.log("Event end time:", endTime.toISOString());
    console.log("Event duration (minutes):", durationMinutes);
    console.log("Attendees:", attendees);
    
    // Check if the organizer already has a Teho account
    const ownerId = await findExistingUser(supabase, email);
    console.log("User lookup result:", ownerId ? `Found user: ${ownerId}` : "No user found");

    // Store the invitation in the database
    const inviteId = await storeInvitation(
      supabase, 
      rawIcs, 
      parsedIcs, 
      email, 
      { summary, description, startTime, endTime, attendees }
    );

    // Create a workshop from this invitation
    const workshopData = await createWorkshopFromInvite(
      supabase,
      ownerId,
      summary,
      description,
      durationMinutes,
      inviteId
    );
    
    // Update the invitation with the workshop ID
    await updateInvitationWithWorkshop(supabase, inviteId, workshopData.id);
    
    // Send confirmation email to the organizer
    const workshopUrl = `https://app.teho.ai/workshop?id=${workshopData.share_id}`;
    await sendConfirmationEmail(
      resend, 
      email, 
      summary, 
      description, 
      workshopUrl, 
      workshopData.blueprint // Pass the blueprint data to the email function
    );
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Workshop created successfully',
        workshopId: workshopData.id,
        shareId: workshopData.share_id
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
