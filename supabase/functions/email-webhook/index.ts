
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

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
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse email webhook data
    const emailData = await req.json()
    
    console.log('Received email webhook:', JSON.stringify(emailData))
    
    // Check if this is a calendar invitation
    const isCalendarInvite = 
      emailData.attachments?.some(attachment => 
        attachment.filename?.endsWith('.ics') || 
        attachment.contentType === 'text/calendar'
      ) ||
      emailData.html?.includes('METHOD:REQUEST') ||
      emailData.html?.includes('BEGIN:VCALENDAR')
    
    if (!isCalendarInvite) {
      console.log('Not a calendar invitation email')
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not a calendar invitation' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }
    
    // Extract the ICS data
    let icsData = ''
    
    // Try to get ICS from attachment
    const icsAttachment = emailData.attachments?.find(attachment => 
      attachment.filename?.endsWith('.ics') || 
      attachment.contentType === 'text/calendar'
    )
    
    if (icsAttachment && icsAttachment.content) {
      // Decode base64 content if needed
      icsData = atob(icsAttachment.content)
    } 
    // If no attachment, try to extract from HTML content
    else if (emailData.html) {
      const match = emailData.html.match(/BEGIN:VCALENDAR[\s\S]*?END:VCALENDAR/)
      if (match) {
        icsData = match[0]
      }
    }
    
    if (!icsData) {
      throw new Error('Could not extract ICS data from email')
    }
    
    // Get sender email
    const fromEmail = emailData.from?.email || 
                      emailData.envelope?.from || 
                      'unknown@example.com'
    
    // Forward to process-calendar-invite function
    const { data: processResult, error } = await supabase.functions.invoke('process-calendar-invite', {
      body: { rawIcs: icsData, email: fromEmail }
    })
    
    if (error) {
      console.error('Error forwarding to process-calendar-invite:', error)
      throw error
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Calendar invitation processed',
        result: processResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
    
  } catch (error) {
    console.error('Error processing email webhook:', error)
    
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
