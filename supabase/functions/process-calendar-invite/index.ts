
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import ical from "npm:ical@0.8.0"
import { Resend } from "npm:resend@3.1.0"
import { simpleParser } from "npm:mailparser@3.6.6"
import { agendaEmail } from "../_shared/emailTemplates.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials')
    }
    
    if (!resendApiKey) {
      throw new Error('Missing Resend API key')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const resend = new Resend(resendApiKey)
    
    // Parse request body based on the source (direct ICS upload or Cloudflare Email)
    const body = await req.json()
    
    // Handle the different input formats
    let rawIcs = ''
    let email = ''
    
    // Handle direct ICS upload (original format)
    if (body.rawIcs && body.email) {
      console.log("Processing direct ICS upload")
      rawIcs = body.rawIcs
      email = body.email
    } 
    // Handle Cloudflare Email Routing format (base64 encoded MIME)
    else if (body.rawB64) {
      console.log('Processing email from Cloudflare Email Routing')
      
      // Parse the raw MIME email from base64
      const rawMime = atob(body.rawB64)
      const parsed = await simpleParser(rawMime)
      
      // Get sender email
      email = parsed.from?.value[0]?.address || ''
      
      if (!email) {
        throw new Error('Could not extract sender email from MIME message')
      }
      
      // Find the ICS attachment
      let icsAttachment = null
      if (parsed.attachments && parsed.attachments.length > 0) {
        icsAttachment = parsed.attachments.find(att => 
          att.contentType === 'text/calendar' || 
          att.filename?.endsWith('.ics')
        )
      }
      
      if (!icsAttachment) {
        throw new Error('No calendar attachment found in email')
      }
      
      // Get the ICS content
      rawIcs = icsAttachment.content.toString('utf-8')
    } else {
      throw new Error('Invalid request format. Expected either {rawIcs, email} or {rawB64}')
    }
    
    if (!rawIcs || !email) {
      throw new Error('Missing required parameters: ICS content or sender email')
    }
    
    // Parse the ICS file
    console.log('Attempting to parse ICS file...')
    const parsedIcs = ical.parseICS(rawIcs)
    console.log('Parsed ICS data:', JSON.stringify(parsedIcs))
    
    // Get the first event from the ICS file
    const events = Object.values(parsedIcs).filter(item => item.type === 'VEVENT')
    
    console.log('Filtered events:', JSON.stringify(events))
    
    if (events.length === 0) {
      throw new Error('No events found in the ICS file')
    }
    
    const event = events[0] as ical.CalendarComponent
    
    console.log('Selected event:', JSON.stringify(event))
    console.log('Event start:', event.start)
    console.log('Event end:', event.end)
    
    if (!event.start || !event.end) {
      throw new Error('Event start or end time missing')
    }
    
    // Extract event information
    const summary = event.summary || 'Untitled Workshop'
    const description = event.description || ''
    const startTime = event.start
    const endTime = event.end
    
    // Calculate duration in minutes
    const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    
    // Extract attendees if available
    const attendeesList = event.attendee ? 
      (Array.isArray(event.attendee) ? event.attendee : [event.attendee]) : 
      []
    
    // Format attendees as an array of email addresses
    const attendees = attendeesList.map(attendee => {
      // Handle different formats of attendee data
      if (typeof attendee === 'string') {
        // Extract email from string like "mailto:user@example.com"
        return attendee.replace('mailto:', '')
      } else if (attendee && typeof attendee === 'object' && 'val' in attendee) {
        return attendee.val.replace('mailto:', '')
      }
      return null
    }).filter(Boolean)
    
    // Store the invitation in the database
    const { data: inviteData, error: inviteError } = await supabase
      .from('inbound_invites')
      .insert({
        raw_ics: rawIcs,
        parsed_data: parsedIcs,
        organizer_email: email,
        summary: summary,
        description: description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        attendees: attendees,
        status: 'pending'
      })
      .select('id')
      .single()
    
    if (inviteError) {
      console.error('Error storing invitation:', inviteError)
      throw inviteError
    }
    
    // Create a workshop from this invitation
    const { data: workshopData, error: workshopError } = await supabase
      .from('workshops')
      .insert({
        owner_id: 'calendar-invite', // Placeholder until user claims the workshop
        share_id: crypto.randomUUID().substring(0, 8),
        name: summary,
        problem: description,
        duration: durationMinutes,
        invitation_source_id: inviteData.id,
        workshop_type: 'online'  // Default to online
      })
      .select('id, share_id')
      .single()
    
    if (workshopError) {
      console.error('Error creating workshop:', workshopError)
      throw workshopError
    }
    
    // Update the invitation with the workshop ID
    await supabase
      .from('inbound_invites')
      .update({ 
        workshop_id: workshopData.id,
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('id', inviteData.id)
    
    // Send confirmation email to the organizer using the new template
    try {
      const startDate = new Date(startTime)
      const formattedDate = `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at ${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
      
      const workshopUrl = `https://app.teho.ai/workshop?id=${workshopData.share_id}`
      
      // Generate agenda preview
      const agendaPreview = description.substring(0, 300) + (description.length > 300 ? '...' : '')
      
      // Extract host name from email
      const hostName = email.split('@')[0]
      
      // Use the new email template
      const emailHtml = agendaEmail({
        hostName,
        agendaPreview,
        editorUrl: workshopUrl
      })
      
      await resend.emails.send({
        from: "Teho AI <noreply@app.teho.ai>",
        to: [email],
        reply_to: email, // Add reply-to header to avoid spam filters
        subject: `Workshop Created: ${summary}`,
        html: emailHtml,
      });
      
      console.log("Confirmation email sent to:", email);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Continue with response even if email fails
    }
    
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
    )
    
  } catch (error) {
    console.error('Error processing calendar invite:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
