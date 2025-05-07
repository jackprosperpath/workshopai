
import { simpleParser } from "npm:mailparser@3.6.6";

// Types
export interface ParsedRequestData {
  rawIcs: string;
  email: string;
}

/**
 * Parse incoming request data (either direct ICS or Cloudflare Email)
 */
export async function parseRequestData(body: any): Promise<ParsedRequestData> {
  let rawIcs = '';
  let email = '';
  
  // Handle direct ICS upload (original format)
  if (body.rawIcs && body.email) {
    console.log("Processing direct ICS upload");
    rawIcs = body.rawIcs;
    email = body.email;
  } 
  // Handle Cloudflare Email Routing format (base64 encoded MIME)
  else if (body.rawB64) {
    console.log('Processing email from Cloudflare Email Routing');
    
    // Parse the raw MIME email from base64
    const rawMime = atob(body.rawB64);
    const parsed = await simpleParser(rawMime);
    
    // Get sender email
    email = parsed.from?.value[0]?.address || '';
    
    if (!email) {
      throw new Error('Could not extract sender email from MIME message');
    }
    
    // Find the ICS attachment
    const icsAttachment = parsed.attachments?.find(att => 
      att.contentType === 'text/calendar' || 
      att.filename?.endsWith('.ics')
    );
    
    if (!icsAttachment) {
      throw new Error('No calendar attachment found in email');
    }
    
    // Get the ICS content
    rawIcs = icsAttachment.content.toString('utf-8');
  } else {
    throw new Error('Invalid request format. Expected either {rawIcs, email} or {rawB64}');
  }
  
  if (!rawIcs || !email) {
    throw new Error('Missing required parameters: ICS content or sender email');
  }
  
  return { rawIcs, email };
}
