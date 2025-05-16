
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define the response format for the CONCISE blueprint (for calendar invites)
const conciseResponseFormatObject = {
  workshopTitle: "Concise and relevant title for the meeting/workshop (max 5-7 words)",
  meetingContext: "A brief summary of the meeting's original description or purpose (1-2 sentences).",
  objectives: [
    "Objective 1: A clear, actionable goal for the meeting (e.g., 'Decide on X strategy').",
    "Objective 2: Another clear, actionable goal (e.g., 'Align on Y proposal')."
  ],
  agendaItems: [
    "Agenda Item 1: A key discussion point or question (e.g., 'Review Q1 performance data').",
    "Agenda Item 2: Another key discussion point (e.g., 'Brainstorm solutions for challenge Z').",
    "Agenda Item 3: A final key discussion point or action planning (e.g., 'Define next steps for project A')."
  ],
  attendeesList: ["attendee1@example.com", "attendee2@example.com"], // To be populated based on input
  basicTimeline: [
    { activity: "Introduction & Goal Setting", durationEstimate: "5-10 minutes" },
    { activity: "Agenda Item 1 Discussion", durationEstimate: "15-20 minutes" },
    { activity: "Wrap-up & Next Steps", durationEstimate: "5-10 minutes" }
  ]
};

// Define the response format for the FULL blueprint (original behavior)
const fullResponseFormatObject = {
  title: "Workshop title",
  description: "Brief description of the workshop",
  objective: "Main workshop objective",
  totalDuration: "Total workshop duration in minutes",
  materials: ["List of required materials"],
  preparation: ["Preparation steps before the workshop"],
  steps: [
    {
      name: "Step or activity name",
      duration: "Duration in minutes",
      description: "Detailed description of the activity",
      facilitation_notes: "Tips for the facilitator"
    }
  ],
  expected_outcomes: ["List of expected outcomes"],
  follow_up: ["Suggested follow-up activities"]
};


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      context,        // Used as main input for AI
      objective,      // Also can be main input or more specific goal
      duration,       // Meeting/workshop duration in minutes
      workshopType,   // e.g., 'online', 'in-person'
      constraints,    // Special string "Generated from calendar invite" triggers concise mode
      metrics,        // For full blueprints
      attendees       // Array of {email, role, count}, role is often "" from invites
    } = await req.json();

    const isConciseMode = constraints === "Generated from calendar invite";
    console.log(`Generating blueprint. Concise mode: ${isConciseMode}`);

    let systemPrompt = "";
    let userPromptContent = "";
    let responseFormatToUse = fullResponseFormatObject;

    // Prepare attendee information for the AI prompt
    let attendeesPromptInfo = "No specific attendee list provided.";
    if (attendees && Array.isArray(attendees) && attendees.length > 0) {
        const attendeeEmails = attendees.map((a: { email: string }) => a.email).filter(Boolean);
        if (attendeeEmails.length > 0) {
            attendeesPromptInfo = `The meeting attendees are: ${attendeeEmails.join(", ")}. Please list these emails under 'attendeesList' in your response.`;
        }
    }
    
    if (isConciseMode) {
      responseFormatToUse = conciseResponseFormatObject;
      systemPrompt = `You are an AI assistant that creates concise, actionable meeting blueprints from calendar invite details.
Focus on clarity and brevity. The meeting duration is ${duration || 'not specified'} minutes.
${attendeesPromptInfo}
The primary context/objective for this meeting is: ${context || objective || 'Not specified'}.
Generate a blueprint that helps attendees prepare and stay focused.`;

      userPromptContent = `Based on the provided meeting context ("${context || objective || 'Not specified'}"), duration (${duration || 'unknown'} minutes), and attendees, create a concise meeting blueprint.
Ensure the workshopTitle is short and relevant.
Provide 2-3 clear objectives.
Suggest 3-5 key agenda items or discussion questions.
List the attendees' emails if provided.
Suggest a basic timeline with estimated durations for agenda segments, respecting the total meeting duration.
Return your response as a JSON object that strictly follows this format:
${JSON.stringify(responseFormatToUse, null, 2)}`;

    } else {
      // Logic for FULL blueprint (original behavior)
      let attendeesFullInfo = '';
      if (attendees && attendees.length > 0) {
        attendeesFullInfo = `Number of attendees: ${attendees.length}\nAttendee details (if available): ${attendees.map((a: any) => a.email + (a.role ? ` (${a.role})` : '')).join(", ")}`;
      }

      let metricsInfo = '';
      if (metrics && metrics.length > 0) {
        metricsInfo = `Success metrics to achieve:\n${metrics.map((m: string, i: number) => `${i+1}. ${m}`).join("\n")}`;
      }

      systemPrompt = `You are a professional workshop facilitator specializing in ${workshopType || 'collaborative'} sessions.
Design a detailed workshop blueprint optimized for: ${objective}
${metricsInfo ? `\n${metricsInfo}` : ''}
Keep in mind these constraints: ${constraints || 'None specified'}
Total duration should be: ${duration || '120'} minutes
Workshop type: ${workshopType || 'online'}
${attendeesFullInfo ? `\n${attendeesFullInfo}` : ''}`;
      
      userPromptContent = `Create a detailed workshop blueprint for: ${objective}.
Return your response as a JSON object that follows this format: ${JSON.stringify(responseFormatToUse, null, 2)}`;
    }

    console.log(`Sending request to OpenAI API. Objective: ${objective || context}`);
    console.log(`System prompt: ${systemPrompt}`);
    // console.log(`User prompt content: ${userPromptContent}`); // Can be very long

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Consider gpt-4o for potentially better structure adherence
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPromptContent }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5, // Slightly lower temperature for more deterministic concise output
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API returned status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid response structure from OpenAI:", data);
      throw new Error('Invalid response structure from OpenAI API');
    }
    
    const blueprintText = data.choices[0].message.content;
    let blueprintJson;
    
    try {
      blueprintJson = JSON.parse(blueprintText);
      console.log("Successfully generated blueprint content from OpenAI.");
      // console.log("Blueprint JSON:", blueprintJson);
    } catch (e) {
      console.error("Failed to parse JSON response from OpenAI:", blueprintText);
      console.error("Error during parsing:", e);
      throw new Error(`Failed to parse workshop blueprint from OpenAI. Raw text: ${blueprintText}`);
    }

    return new Response(
      JSON.stringify({ 
        blueprint: blueprintJson, // This will be either ConciseBlueprint or Full Blueprint structure
        message: "Workshop blueprint generated successfully"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-workshop-blueprint function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
