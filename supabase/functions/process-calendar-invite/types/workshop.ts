
export interface Blueprint {
  title: string;
  description: string;
  objective: string;
  totalDuration: string | number;
  materials: string[];
  preparation?: string[];
  steps: Array<{
    name: string;
    duration: string | number;
    description: string;
    facilitation_notes?: string;
  }>;
  expected_outcomes?: string[];
  follow_up: string[];
}

export interface Attendee {
  email: string;
  role: string;
  count: number;
}
