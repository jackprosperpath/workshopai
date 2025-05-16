// Defines the structure for a concise blueprint generated from calendar invites

export interface ConciseBlueprintAgendaItem {
  name: string;
  details: string;
  method: string;
  methodExplanation: string;
  tip: string;
}

export interface ConciseBlueprintTimelineStep {
  activity: string; // Should match a name in ConciseBlueprintAgendaItem
  durationEstimate: string; // e.g., "10-15 minutes"
}

export interface ConciseBlueprint {
  workshopTitle: string;
  objectives: string[];
  agendaItems: ConciseBlueprintAgendaItem[];
  attendeesList?: string[]; // List of attendee emails or a summary
  basicTimeline: ConciseBlueprintTimelineStep[];
  // Optional: include original meeting description if helpful for context, or derived summary
  meetingContext?: string; 
}

// Keep Attendee type if used elsewhere, though not directly part of ConciseBlueprint structure itself
export interface Attendee {
  email: string;
  role: string; // For calendar invites, role might often be empty or generic
}
