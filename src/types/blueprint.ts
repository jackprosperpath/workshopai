
export interface ConciseBlueprintStep {
  activity: string;
  durationEstimate: string;
}

export interface ConciseBlueprint {
  workshopTitle: string;
  objectives: string[];
  agendaItems: string[];
  attendeesList?: string[];
  basicTimeline: ConciseBlueprintStep[];
  meetingContext?: string;
}
