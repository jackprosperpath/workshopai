
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IMPROVE_PROMPTS: Record<string, string> = {
  redraft: 'Rewrite this section to improve clarity and flow. Do not change its meaning. Respond with the improved section and a short reasoning as: "REASONING: ..."',
  add_detail: 'Expand this section by adding more specifics or examples, making it richer and more informative but staying concise. Respond with the improved section and a short reasoning as: "REASONING: ..."',
  simplify: 'Simplify this section to make it shorter and more accessible, without removing essential meaning. Respond with the improved section and a short reasoning as: "REASONING: ..."',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, section } = await req.json();

    if (!action || !section || !IMPROVE_PROMPTS[action]) {
      throw new Error("Missing or invalid action/section type.");
    }

    const prompt = `${IMPROVE_PROMPTS[action]}\n\nSection:\n${section.trim()}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that improves writing style on request.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.45,
      }),
    });

    const data = await response.json();
    const solution = data.choices[0].message.content;

    // Parse for improved section + reasoning block
    let newText = solution;
    let reasoning = "";
    if (solution.includes('REASONING:')) {
      const [sectionText, ...reasoningParts] = solution.split('REASONING:');
      newText = sectionText.trim();
      reasoning = reasoningParts.join('REASONING:').trim();
    }

    return new Response(
      JSON.stringify({ newText, reasoning }),
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
