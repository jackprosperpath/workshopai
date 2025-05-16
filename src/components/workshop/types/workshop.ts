
export type Attendee = {
  name?: string; // Added optional name property
  role: string;
  email?: string;
};

export type BlueprintStep = {
  name: string;
  duration: string;
  description: string;
  facilitation_notes: string;
  materials?: string[]; // Added optional materials property
};

export type Blueprint = {
  title: string;
  description?: string;
  objective?: string;
  totalDuration?: string;
  duration?: string; // For backward compatibility
  steps?: BlueprintStep[];
  agenda?: any[]; // For backward compatibility
  materials?: string[];
  materialsList?: string[]; // For backward compatibility
  preparation?: string[];
  expected_outcomes?: string[];
  follow_up?: string[];
  followupActions?: string[]; // For backward compatibility
  attendees?: Attendee[]; // Adding attendees property that was missing
};

export type TeamMemberRole = {
  id: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "declined";
};

