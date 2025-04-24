
export type Attendee = {
  role: string;
  count: number;
};

export type BlueprintAgendaItem = {
  name: string;
  duration: string;
  activity: string;
  description: string;
  prompts: string[];
  materials: string[];
  expectedOutcomes: string[];
  facilitationTips: string[];
};

export type Blueprint = {
  title: string;
  duration: string;
  agenda: BlueprintAgendaItem[];
  materialsList: string[];
  followupActions: string[];
};
