
import ical from "npm:ical@0.8.0";

export interface EventData {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  attendees: string[];
  status: string;
}

export function parseIcsData(rawIcs: string): EventData {
  try {
    const parsedIcs = ical.parseICS(rawIcs);
    
    // Find the first VEVENT entry
    const events = Object.values(parsedIcs).filter(event => event.type === 'VEVENT');
    
    if (events.length === 0) {
      throw new Error("No events found in ICS file");
    }
    
    // Get the first event (most calendar invites have just one)
    const event: any = events[0];
    
    // Extract attendees email addresses
    let attendees: string[] = [];
    if (event.attendee) {
      attendees = Array.isArray(event.attendee) 
        ? event.attendee.map((a: any) => a.val.replace('mailto:', '')) 
        : [event.attendee.val.replace('mailto:', '')];
    }
    
    // Get organizer email
    let organizerEmail = '';
    if (event.organizer && event.organizer.val) {
      organizerEmail = event.organizer.val.replace('mailto:', '');
      // Add organizer to attendees if not already included
      if (!attendees.includes(organizerEmail)) {
        attendees.push(organizerEmail);
      }
    }
    
    // Calculate duration in minutes
    const startTime = event.start;
    const endTime = event.end;
    const durationMinutes = Math.round((endTime - startTime) / (60 * 1000));
    
    // Extract event status (CONFIRMED, CANCELLED, etc.)
    const status = event.status || 'CONFIRMED';
    
    // Clean up description by removing Google Meet links if present
    let description = event.description || '';
    description = description.split('-::~:~::~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:')[0].trim();
    
    return {
      summary: event.summary || 'Untitled Event',
      description,
      startTime,
      endTime,
      durationMinutes,
      attendees,
      status
    };
  } catch (error) {
    console.error("Error parsing ICS data:", error);
    throw new Error(`Failed to parse ICS data: ${error.message}`);
  }
}
