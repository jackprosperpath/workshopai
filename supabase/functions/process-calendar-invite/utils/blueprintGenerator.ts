
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
  workshopId: string,
  summary: string,
  description: string,
  durationMinutes: number,
  attendees: string[]
): Promise<Blueprint> {
  console.log(`Generating blueprint for workshop: ${workshopId}`);
  
  try {
    // Call the blueprint generation function
    const { data, error } = await supabase.functions.invoke("generate-workshop-blueprint", {
      body: {
        context: description,
        objective: description,
        duration: durationMinutes,
        workshopType: "online", // Default to online
        constraints: "Generated from calendar invite",
        metrics: ["Successful workshop completion"],
        attendees: attendees.map(email => ({ email, role: "", count: 1 }))
      }
    });
    
    if (error) {
      console.error("Error invoking blueprint generation function:", error);
      throw error;
    }
    
    console.log("Blueprint generated successfully");
    
    // If we got a blueprint back, store it with the workshop
    if (data?.blueprint) {
      // Update the workshop with the generated blueprint
      await supabase
        .from('workshops')
        .update({ 
          generated_blueprint: data.blueprint,
          updated_at: new Date().toISOString()
        })
        .eq('id', workshopId);
      
      console.log("Workshop updated with generated blueprint");
      
      return data.blueprint;
    }
    
    // If there's no blueprint data, create a simple one
    const simpleBlueprint = createDefaultBlueprint(summary, description, durationMinutes);
    
    // Update the workshop with the simple blueprint
    await supabase
      .from('workshops')
      .update({ 
        generated_blueprint: simpleBlueprint,
        updated_at: new Date().toISOString()
      })
      .eq('id', workshopId);
    
    console.log("Workshop updated with default blueprint");
    return simpleBlueprint;
    
  } catch (error) {
    console.error("Error generating blueprint:", error);
    // Create a fallback blueprint
    const fallbackBlueprint = createDefaultBlueprint(summary, description, durationMinutes);
    
    // Try to update the workshop with fallback blueprint
    try {
      await supabase
        .from('workshops')
        .update({ 
          generated_blueprint: fallbackBlueprint,
          updated_at: new Date().toISOString()
        })
        .eq('id', workshopId);
    } catch (updateError) {
      console.error("Failed to update workshop with fallback blueprint:", updateError);
    }
    
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
