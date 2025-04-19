
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
    const { problem, metrics, constraints, feedback } = await req.json();

    // Base prompt construction
    let prompt = `
Given this problem statement: "${problem}"

Key metrics to optimize for:
${metrics.map(m => `- ${m}`).join('\n')}

Constraints to consider:
${constraints.map(c => `- ${c}`).join('\n')}`;

    // Add feedback context if provided
    if (feedback) {
      prompt += `\n\nPrevious feedback to address:\n${feedback}`;
    }

    prompt += `\n\nPlease provide a detailed solution that:
1. Addresses the core problem
2. Optimizes for the given metrics
3. Respects all constraints
4. Is divided into clear, implementable sections
${feedback ? '5. Incorporates the provided feedback' : ''}

Respond with 3 sections maximum.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a strategic consultant helping to solve complex business and organizational problems.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const solution = data.choices[0].message.content;
    
    // Split the solution into paragraphs
    const sections = solution.split('\n\n').filter(Boolean);

    return new Response(
      JSON.stringify({ 
        output: sections,
        reasoning: feedback ? "Generated with feedback incorporated" : "Initial generation using GPT-4o"
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
