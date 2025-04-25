
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
      constraints 
    } = await req.json();

    // Adjust system prompt based on workshop type and constraints
    const systemPrompt = `You are a professional workshop facilitator specializing in ${workshopType || 'collaborative'} sessions. 
Design a workshop blueprint optimized for: ${objective}
Keep in mind these constraints: ${constraints || 'None specified'}
Total duration should be: ${duration || '120'} minutes`;

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
          { role: 'user', content: `Create a detailed workshop blueprint for: ${objective}` }
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
