
export interface ConciseBlueprintStep {
  activity: string;
  durationEstimate: string;
}

export interface ConciseBlueprint {
  workshopTitle: string;
  objectives: string[];
  agendaItems: ConciseBlueprintAgendaItem[];
  attendeesList?: string[];
  basicTimeline: ConciseBlueprintStep[];
  meetingContext?: string;
}

export interface ConciseBlueprintAgendaItem {
  name: string;
  details: string;
  method: string;
  methodExplanation: string;
  tip: string;
}
