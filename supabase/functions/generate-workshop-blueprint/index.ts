
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
      attendees, 
      prereads, 
      constraints 
    } = await req.json();

    // Base prompt construction
    const prompt = `
You are a professional workshop facilitator with extensive experience designing effective collaborative sessions. 
Design a workshop blueprint based on these inputs:

CONTEXT: ${context || 'Not specified'}
OBJECTIVE: ${objective || 'Not specified'}
DURATION: ${duration || '2 hours'} 
ATTENDEES: ${attendees ? JSON.stringify(attendees) : 'Mixed group'}
PRE-READS: ${prereads || 'None'}
CONSTRAINTS: ${constraints || 'None'}

Create a detailed workshop plan with:
1. A compelling title for the workshop
2. A time-boxed agenda with specific blocks (e.g., Warm-up, Diverge, Converge, Decision)
3. Specific activity formats for each block (e.g., brainwriting, lightning talks, silent voting)
4. Facilitation prompts for each activity
5. Required materials or digital tools
6. Timeboxes for each section in minutes
7. Expected outcomes from each section
8. Tips for facilitating each section effectively

Format your response as a JSON object with this structure:
{
  "title": "Workshop Title",
  "duration": "Total duration in minutes",
  "agenda": [
    {
      "name": "Block name",
      "duration": "Duration in minutes",
      "activity": "Activity format",
      "description": "Brief explanation of the activity",
      "prompts": ["Facilitation prompt 1", "Facilitation prompt 2"],
      "materials": ["Material 1", "Material 2"],
      "expectedOutcomes": ["Outcome 1", "Outcome 2"],
      "facilitationTips": ["Tip 1", "Tip 2"]
    }
  ],
  "materialsList": ["All required materials consolidated"],
  "followupActions": ["Suggested follow-up 1", "Suggested follow-up 2"]
}

Ensure the activities are engaging, appropriate for the context, and will help achieve the objective within the time constraints.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert workshop facilitator designing effective collaborative sessions.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    // Parse the JSON response from OpenAI
    const blueprintText = data.choices[0].message.content;
    let blueprint;
    
    try {
      blueprint = JSON.parse(blueprintText);
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
