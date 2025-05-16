// Defines the structure for a concise blueprint generated from calendar invites

export interface ConciseBlueprintStep {
  activity: string;
  durationEstimate: string;
}

export interface ConciseBlueprint {
  workshopTitle: string;
  objectives: string[];
  agendaItems: string[];
  attendeesList?: string[]; // List of attendee emails or a summary
  basicTimeline: ConciseBlueprintStep[];
  // Optional: include original meeting description if helpful for context, or derived summary
  meetingContext?: string; 
}

// Keep Attendee type if used elsewhere, though not directly part of ConciseBlueprint structure itself
export interface Attendee {
  email: string;
  role: string; // For calendar invites, role might often be empty or generic
}
