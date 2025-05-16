
import type { ConciseBlueprint } from "../types/workshop.ts"; // Updated import

/**
 * Generate a workshop blueprint based on calendar invite data
 */
export async function generateBlueprintFromInvite(
  supabase: any,
  summary: string,
  description: string,
  durationMinutes: number,
  attendees: string[] // List of attendee emails
): Promise<ConciseBlueprint> { // Updated return type
  console.log(`Generating concise blueprint for invite: ${summary}`);
  console.log(`Description: ${description}`);
  console.log(`Duration: ${durationMinutes} minutes`);
  console.log(`Attendees: ${attendees.join(', ')}`);
  
  try {
    // Format attendees for the blueprint generation function.
    // The generate-workshop-blueprint function expects an array of objects.
    const formattedAttendeesPayload = attendees.map(email => ({
      email,
      role: "",  // Roles are not typically available from basic ICS parsing for all attendees
      count: 1
    }));

    const cleanDescription = description.replace(
      /-::~:~::~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~::~:~::-([\s\S]*)-::~:~::~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~::~:~::-/g, 
      ''
    ).trim();
    
    console.log(`Clean description for AI: "${cleanDescription}"`);
    
    console.log("Calling generate-workshop-blueprint function for a concise blueprint...");
    const { data, error } = await supabase.functions.invoke("generate-workshop-blueprint", {
      body: {
        // context is used by AI for understanding
        context: cleanDescription || summary, 
        // objective is what the workshop aims to achieve, can be same as context for invites
        objective: cleanDescription || summary, 
        duration: durationMinutes,
        workshopType: "online", 
        // This specific constraint will trigger concise blueprint generation
        constraints: "Generated from calendar invite", 
        metrics: [], // Metrics are less relevant for a concise auto-generated blueprint
        attendees: formattedAttendeesPayload, // Pass the list of attendee emails
      }
    });
    
    if (error) {
      console.error("Error invoking blueprint generation function:", error);
      throw error;
    }
    
    console.log("Blueprint generation response:", data);
    
    if (data?.blueprint) {
      console.log("Concise blueprint generated successfully by AI service.");
      // The structure of data.blueprint should now match ConciseBlueprint
      // when 'Generated from calendar invite' constraint is used.
      return data.blueprint as ConciseBlueprint; 
    }
    
    console.log("No blueprint data returned from AI, creating default concise blueprint");
    return createDefaultConciseBlueprint(summary, cleanDescription || description, durationMinutes, attendees);
    
  } catch (error) {
    console.error("Error generating concise blueprint:", error);
    return createDefaultConciseBlueprint(summary, description, durationMinutes, attendees);
  }
}

/**
 * Create a default concise blueprint based on basic invite data
 */
function createDefaultConciseBlueprint(
  title: string, 
  description: string, 
  durationMinutes: number,
  attendeeEmails: string[]
): ConciseBlueprint {
  const objectives = ["Review meeting topic.", "Define next steps."];
  const agendaItems = [
    "Discuss main points from invite description.",
    "Identify key takeaways.",
    "Outline action items."
  ];

  let timeline: { activity: string; durationEstimate: string }[] = [
    { activity: "Introductions and goals", durationEstimate: "5-10 min" },
    { activity: "Main discussion", durationEstimate: `${Math.max(15, durationMinutes - 20)} min` },
    { activity: "Wrap-up and action items", durationEstimate: "5-10 min" },
  ];

  if (durationMinutes <= 30) {
    timeline = [
      { activity: "Quick Intro & Main Point", durationEstimate: `${Math.floor(durationMinutes * 0.3)} min` },
      { activity: "Discussion & Decisions", durationEstimate: `${Math.floor(durationMinutes * 0.5)} min` },
      { activity: "Next Steps", durationEstimate: `${Math.floor(durationMinutes * 0.2)} min` },
    ];
  }

  return {
    workshopTitle: title || "Meeting Blueprint",
    meetingContext: description || "N/A",
    objectives: objectives,
    agendaItems: agendaItems,
    attendeesList: attendeeEmails.length > 0 ? attendeeEmails : ["Attendees not specified"],
    basicTimeline: timeline,
  };
}
