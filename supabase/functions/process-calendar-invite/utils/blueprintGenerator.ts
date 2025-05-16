import type { Blueprint } from "../types/workshop.ts";

// Define our simplified Blueprint type (matching the frontend type)
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

/**
 * Generate a workshop blueprint based on calendar invite data
 */
export async function generateBlueprintFromInvite(
  supabase: any,
  summary: string,
  description: string,
  durationMinutes: number,
  attendees: string[]
): Promise<Blueprint> {
  console.log(`Generating blueprint for invite: ${summary}`);
  console.log(`Description: ${description}`);
  console.log(`Duration: ${durationMinutes} minutes`);
  console.log(`Attendees: ${attendees.join(', ')}`);
  
  try {
    // Format attendees for the blueprint generation
    const formattedAttendees = attendees.map(email => ({
      email,
      role: "",  // We don't have roles from the calendar invite
      count: 1   // Default to 1 person per email
    }));

    // Extract meeting objective from the description
    // Remove Google Meet links and other auto-generated content
    const cleanDescription = description.replace(
      /-::~:~::~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~::~:~::-([\s\S]*)-::~:~::~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~::~:~::-/g, 
      ''
    ).trim();
    
    console.log(`Clean description: "${cleanDescription}"`);
    
    // Call the blueprint generation function with enhanced context
    console.log("Calling generate-workshop-blueprint function...");
    const { data, error } = await supabase.functions.invoke("generate-workshop-blueprint", {
      body: {
        context: cleanDescription || summary,
        objective: cleanDescription || summary,
        duration: durationMinutes,
        workshopType: "online", // Default to online for calendar invites
        constraints: "Generated from calendar invite",
        metrics: ["Successful workshop completion"], // Placeholder, can be improved
        attendees: formattedAttendees
      }
    });
    
    if (error) {
      console.error("Error invoking blueprint generation function:", error);
      throw error;
    }
    
    console.log("Blueprint generation response:", data);
    
    // If we got a blueprint back, return it
    if (data?.blueprint) {
      console.log("Blueprint generated successfully by AI service.");
      return data.blueprint as Blueprint; // Cast to Blueprint
    }
    
    // If there's no blueprint data from AI, create a simple default one
    console.log("No blueprint data returned from AI, creating default blueprint");
    const simpleBlueprint = createDefaultBlueprint(summary, cleanDescription, durationMinutes);
    return simpleBlueprint;
    
  } catch (error) {
    console.error("Error generating blueprint:", error);
    // Create a fallback blueprint
    const fallbackBlueprint = createDefaultBlueprint(summary, description, durationMinutes);
    return fallbackBlueprint;
  }
}

/**
 * Create a default blueprint based on basic invite data
 */
function createDefaultBlueprint(title: string, description: string, durationMinutes: number): Blueprint {
  // Create a simplified agenda with basic time allocation
  const introTime = Math.max(5, Math.floor(durationMinutes * 0.1));
  const discussionTime = Math.max(15, Math.floor(durationMinutes * 0.6));
  const wrapUpTime = Math.max(5, Math.floor(durationMinutes * 0.1));
  const remainingTime = durationMinutes - (introTime + discussionTime + wrapUpTime);
  const actionTime = Math.max(5, remainingTime);
  
  return {
    title: title || "Workshop",
    description: description || "Calendar-created workshop",
    objective: description || "Complete workshop objectives",
    totalDuration: durationMinutes,
    materials: ["Note-taking tools", "Calendar invite"],
    steps: [
      {
        name: "Introduction",
        duration: introTime,
        description: "Welcome participants and set expectations for the meeting",
        facilitation_notes: "Make sure to welcome everyone and explain the purpose of the workshop"
      },
      {
        name: "Discussion",
        duration: discussionTime,
        description: "Main discussion period for addressing the core objectives",
        facilitation_notes: "Focus on the key objective from the calendar description"
      },
      {
        name: "Action Items",
        duration: actionTime,
        description: "Identify next steps and assign responsibilities",
        facilitation_notes: "Assign specific actions to individuals with deadlines"
      },
      {
        name: "Wrap-up",
        duration: wrapUpTime,
        description: "Summarize decisions and confirm next steps",
        facilitation_notes: "Recap all decisions and commitments made during the workshop"
      }
    ],
    expected_outcomes: ["Clear action items", "Decisions on key topics", "Shared understanding"],
    follow_up: ["Send meeting notes", "Schedule follow-up meeting if needed", "Track action item completion"]
  };
}
