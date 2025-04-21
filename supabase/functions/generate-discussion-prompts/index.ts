
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
    const { sectionText } = await req.json();

    if (!sectionText) {
      throw new Error('Section text is required');
    }

    const SYSTEM = `
    You are a world-class facilitator helping cross-functional teams stress-test ideas.
    Given a solution section, output 3 thought-provoking questions that:
    - Spark constructive debate
    - Expose risks or missing data
    - Are answerable within 2 minutes
    Return JSON: { "questions": [ ... ] }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.8,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: sectionText }
        ],
      }),
    });

    const data = await response.json();
    let questions = [];

    try {
      // Try to parse the response content as JSON
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);
      questions = parsed.questions || [];
    } catch (error) {
      console.error('Error parsing response as JSON:', error);
      // Fallback: Extract questions from text response
      const content = data.choices[0].message.content;
      // Simple regex extraction if JSON parsing fails
      const matches = content.match(/"([^"]+)"/g);
      if (matches && matches.length > 0) {
        questions = matches.slice(0, 3).map(q => q.replace(/"/g, ''));
      }
    }

    // Ensure we have 3 questions, even if parsing failed
    while (questions.length < 3) {
      questions.push(`What are your thoughts on this section?`);
    }

    return new Response(
      JSON.stringify({ 
        questions,
        sectionHash: Buffer.from(sectionText).toString('base64').substring(0, 10),
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating discussion prompts:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        questions: [
          "What assumptions is this section making?",
          "What challenges might arise during implementation?",
          "Is there anything missing from this recommendation?"
        ]
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
