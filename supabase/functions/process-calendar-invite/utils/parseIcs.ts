
import ical from "npm:ical@0.8.0";

// Types
export interface EventData {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  attendees: string[];
}

/**
 * Parse ICS data and extract event information
 */
export function parseIcsData(rawIcs: string): EventData {
  // Parse the ICS file
  console.log('Attempting to parse ICS file...');
  const parsedIcs = ical.parseICS(rawIcs);
  console.log('Parsed ICS data:', JSON.stringify(parsedIcs));
  
  // Get the first event from the ICS file
  const events = Object.values(parsedIcs).filter(item => item.type === 'VEVENT');
  
  console.log('Filtered events:', JSON.stringify(events));
  
  if (events.length === 0) {
    throw new Error('No events found in the ICS file');
  }
  
  const event = events[0] as ical.CalendarComponent;
  
  console.log('Selected event:', JSON.stringify(event));
  console.log('Event start:', event.start);
  console.log('Event end:', event.end);
  
  if (!event.start || !event.end) {
    throw new Error('Event start or end time missing');
  }
  
  // Extract event information
  const summary = event.summary || 'Untitled Workshop';
  const description = event.description || '';
  const startTime = event.start;
  const endTime = event.end;
  
  // Calculate duration in minutes
  const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  
  // Extract attendees if available
  const attendeesList = event.attendee ? 
    (Array.isArray(event.attendee) ? event.attendee : [event.attendee]) : 
    [];
  
  // Format attendees as an array of email addresses
  const attendees = attendeesList.map(attendee => {
    // Handle different formats of attendee data
    if (typeof attendee === 'string') {
      // Extract email from string like "mailto:user@example.com"
      return attendee.replace('mailto:', '');
    } else if (attendee && typeof attendee === 'object' && 'val' in attendee) {
      return attendee.val.replace('mailto:', '');
    }
    return null;
  }).filter(Boolean) as string[];
  
  return {
    summary,
    description,
    startTime,
    endTime,
    durationMinutes,
    attendees
  };
}
