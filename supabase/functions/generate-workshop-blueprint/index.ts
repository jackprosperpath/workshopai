
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      context, 
      objective, 
      duration, 
      workshopType,
      constraints,
      metrics,
      attendees 
    } = await req.json();

    // Format attendees information if available
    let attendeesInfo = '';
    if (attendees && attendees.length > 0) {
      attendeesInfo = `Number of attendees: ${attendees.length}\nAttendee roles: ${
        attendees
          .filter(a => a.role)
          .map(a => a.role)
          .join(", ")
      }`;
    }

    // Format success metrics if available
    let metricsInfo = '';
    if (metrics && metrics.length > 0) {
      metricsInfo = `Success metrics to achieve:\n${metrics.map((m, i) => `${i+1}. ${m}`).join("\n")}`;
    }

    // Adjust system prompt based on workshop type, constraints, metrics and attendees
    const systemPrompt = `You are a professional workshop facilitator specializing in ${workshopType || 'collaborative'} sessions. 
Design a workshop blueprint optimized for: ${objective}
${metricsInfo ? `\n${metricsInfo}` : ''}
Keep in mind these constraints: ${constraints || 'None specified'}
Total duration should be: ${duration || '120'} minutes
Workshop type: ${workshopType || 'online'}
${attendeesInfo ? `\n${attendeesInfo}` : ''}`;

    // Define the response format structure
    const responseFormatObject = {
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

    console.log(`Sending request to OpenAI API for workshop: ${objective}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a detailed workshop blueprint for: ${objective}. 
Return your response as a JSON object that follows this format: ${JSON.stringify(responseFormatObject, null, 2)}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
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
    
    // Parse the JSON response from OpenAI
    const blueprintText = data.choices[0].message.content;
    let blueprint;
    
    try {
      blueprint = JSON.parse(blueprintText);
      console.log("Successfully generated blueprint");
    } catch (e) {
      console.error("Failed to parse JSON response:", blueprintText);
      throw new Error('Failed to parse workshop blueprint');
    }

    return new Response(
      JSON.stringify({ 
        blueprint,
        message: "Workshop blueprint generated successfully"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
