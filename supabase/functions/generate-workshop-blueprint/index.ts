
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// New, richer concise blueprint output schema
const conciseResponseFormatObject = {
  workshopTitle: "Concise and relevant title for the meeting/workshop (max 5-7 words)",
  meetingContext: "A brief summary of the meeting's original description or purpose (1-2 sentences).",
  objectives: [
    "Objective 1: A clear, actionable goal for the meeting",
    "Objective 2: Another clear, actionable goal"
  ],
  agendaItems: [
    {
      name: "Agenda step name (e.g. Welcome & Objectives)",
      details: "Short description of this segment's goal and what happens",
      method: "Facilitation technique (e.g. round robin, dot voting)",
      methodExplanation: "Explain the method in plain English (1 sentence)",
      tip: "Facilitation tip for this segment"
    }
  ],
  attendeesList: [
    "attendee1@example.com",
    "attendee2@example.com"
  ],
  basicTimeline: [
    {
      activity: "Agenda segment name",
      durationEstimate: "e.g. 10 min"
    }
  ]
};

// Rich, full blueprint output schema
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
      description: "Detailed description of the activity (goal and what happens)",
      method: "Facilitation method (e.g., brainwriting, affinity mapping, breakout)",
      methodExplanation: "Plain English summary of this method (1 sentence)",
      facilitation_notes: "Tips for the facilitator, possible risks and mitigations",
      expected_output: "Tangible outcome from this step (e.g. list of priorities, agreed actions)",
      materials_needed: "Materials/tools required (if any)"
    }
  ],
  expected_outcomes: ["List of expected workshop outcomes"],
  follow_up: ["Suggested follow-up activities"]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const {
      context, objective, duration, workshopType, constraints, metrics, attendees
    } = await req.json();
    
    console.log("Received request for blueprint generation. Constraints:", constraints);
    const isConciseMode = constraints === "Generated from calendar invite";
    console.log(`Generating blueprint. Concise mode: ${isConciseMode}`);
    
    let systemPrompt = "";
    let userPromptContent = "";
    let responseFormatToUse = fullResponseFormatObject;

    // Prepare attendee info
    let attendeesPromptInfo = "No specific attendee list provided.";
    if (attendees && Array.isArray(attendees) && attendees.length > 0) {
      const attendeeEmails = attendees.map((a: { email: string }) => a.email).filter(Boolean);
      if (attendeeEmails.length > 0) {
        attendeesPromptInfo = `The meeting attendees are: ${attendeeEmails.join(", ")}. List these emails under 'attendeesList' in your response.`;
      }
    }

    if (isConciseMode) {
      responseFormatToUse = conciseResponseFormatObject;
      // RICHER SYSTEM PROMPT for concise mode
      systemPrompt = `
You are an expert workshop facilitator. Given only a calendar invite, create a concise but high-value agenda that:
- Uses best-practice facilitation to ensure all voices are heard and outcomes are clear.
- Breaks the meeting into logical segments: welcome/context, idea/input gathering, discussion/convergence, action/next steps.
- For each agenda segment, recommend a facilitation method (e.g., round robin, dot voting, brainwriting), and explain the method briefly in plain English.
- Suggest facilitator tips (e.g., "Keep discussion on track with a timer", "Encourage quieter attendees").
- If possible, recommend a brief prep step (e.g., send pre-read), and adjust for remote or in-person meetings.
- Adapt to the provided duration and number of attendees.
- If key information is missing, make reasonable assumptions based on the topic and best practice.
Return strictly as JSON in the provided format.

${attendeesPromptInfo}
Meeting context/objective: ${context || objective || "Not specified"}.
Meeting duration: ${duration || "Not specified"} minutes.
      `.trim();

      userPromptContent = `
Based on the details above, generate a concise meeting blueprint:
- Provide a short workshop title.
- Give a 1-2 sentence meeting context.
- Write 2-3 clear, actionable objectives.
- Include 3-5 agenda segments. For each, provide:
  - Name
  - Description (goal and what happens)
  - Facilitation method (e.g., round robin, dot voting)
  - Brief explanation of method (plain English)
  - Facilitation tip
- Suggest a basic timeline, allocating estimated time for each segment.
- List attendees' emails if provided.

Output must be valid JSON in this format:
${JSON.stringify(responseFormatToUse, null, 2)}
      `.trim();

    } else {
      // FULL BLUEPRINT MODE
      responseFormatToUse = fullResponseFormatObject; // Ensure this is set for full mode
      let attendeesFullInfo = '';
      if (attendees && attendees.length > 0) {
        attendeesFullInfo = `Number of attendees: ${attendees.length}\nAttendee details (if available): ${attendees.map((a: { email: string, role?: string }) => a.email + (a.role ? ` (${a.role})` : '')).join(", ")}`;
      }
      let metricsInfo = '';
      if (metrics && Array.isArray(metrics) && metrics.length > 0) {
        metricsInfo = `Success metrics to achieve:\n${metrics.map((m: string, i: number) => `${i + 1}. ${m}`).join("\n")}`;
      }
      systemPrompt = `
You are a professional workshop designer. Create a detailed, facilitator-ready workshop plan for the provided objective, using advanced facilitation best practices. Your plan must:
- Start with a clear summary (title, description, objective, outcomes).
- Include total duration, and a breakdown of each agenda step with time estimates.
- For each step:
  - Name of step
  - Duration (mins)
  - Detailed instructions (goal, what happens, how to facilitate)
  - Method used (and brief plain English explanation)
  - Facilitation notes (tips, risks, mitigations)
  - Expected output (what this step should produce)
  - Materials/tools needed
- Add prep steps (for organiser and participants) and post-workshop follow-up actions.
- Sequence steps logically (context, divergent, convergent, action).
- Customise for attendee count, roles, remote/in-person as relevant.
- If any step is risky or critical, flag and suggest mitigations.

Input context: ${context || objective || "Not specified"}
${metricsInfo ? metricsInfo : ""}
${attendeesFullInfo ? attendeesFullInfo : ""}
Constraints: ${constraints || "None specified"}
Meeting type: ${workshopType || "workshop"}

Return strictly as JSON in the following format:
${JSON.stringify(responseFormatToUse, null, 2)}
      `.trim();

      userPromptContent = `
Given the context and requirements above, generate the most useful possible workshop blueprint for a facilitator who has only 10 minutes to prepare. Output must be valid JSON in this format:
${JSON.stringify(responseFormatToUse, null, 2)}
      `.trim();
    }
    
    console.log(`Sending request to OpenAI. Model: gpt-4o-mini`);
    // console.log("System Prompt:", systemPrompt); // Potentially long, log if debugging
    // console.log("User Prompt (for format):", userPromptContent); // Potentially long, log if debugging

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPromptContent }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorData = await response.text(); // Use .text() for better error details
      console.error("OpenAI API error response text:", errorData);
      try {
        const parsedError = JSON.parse(errorData);
        throw new Error(`OpenAI API returned status ${response.status}: ${JSON.stringify(parsedError)}`);
      } catch (e) {
        throw new Error(`OpenAI API returned status ${response.status}: ${errorData}`);
      }
    }
    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error("Invalid response structure from OpenAI:", JSON.stringify(data));
      throw new Error('Invalid response structure from OpenAI API (missing choices or message content)');
    }
    const blueprintText = data.choices[0].message.content;
    let blueprintJson;
    try {
      blueprintJson = JSON.parse(blueprintText);
      console.log("Successfully parsed blueprint JSON from OpenAI.");
    } catch (e) {
      console.error("Failed to parse JSON response from OpenAI. Raw text:", blueprintText);
      console.error("Parsing error:", e);
      throw new Error(`Failed to parse workshop blueprint from OpenAI. Raw text: ${blueprintText}. Error: ${e.message}`);
    }
    return new Response(JSON.stringify({
      blueprint: blueprintJson,
      message: "Workshop blueprint generated successfully"
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in generate-workshop-blueprint function:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
