
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

    if (!sectionText || typeof sectionText !== 'string' || sectionText.trim().length === 0) {
      console.error('Invalid section text:', sectionText);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or empty section text',
          questions: getDefaultQuestions(),
          sectionHash: generateSimpleHash(sectionText || ''),
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate a hash for caching/identifying this text
    const sectionHash = generateSimpleHash(sectionText);
    
    const SYSTEM = `
    You are a world-class facilitator helping cross-functional teams stress-test ideas.
    Given a solution section, output 3 thought-provoking questions that:
    - Spark constructive debate
    - Expose risks or missing data
    - Are answerable within 2 minutes
    Return JSON: { "questions": [ ... ] }
    `;

    try {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      let questions = [];

      try {
        // Try to parse the response content as JSON
        const content = data.choices[0].message.content;
        console.log('OpenAI response content:', content);
        
        const parsed = JSON.parse(content);
        questions = parsed.questions || [];
        console.log('Parsed questions:', questions);
      } catch (error) {
        console.error('Error parsing response as JSON:', error);
        // Fallback: Extract questions from text response
        const content = data.choices[0].message.content;
        // Simple regex extraction if JSON parsing fails
        const matches = content.match(/"([^"]+)"/g);
        if (matches && matches.length > 0) {
          questions = matches.slice(0, 3).map(q => q.replace(/"/g, ''));
          console.log('Extracted questions using regex:', questions);
        }
      }

      // Ensure we have 3 questions, even if parsing failed
      while (questions.length < 3) {
        questions.push(getDefaultQuestions()[questions.length]);
      }

      return new Response(
        JSON.stringify({ 
          questions,
          sectionHash,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ 
          error: error.message,
          questions: getDefaultQuestions(),
          sectionHash,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error generating discussion prompts:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        questions: getDefaultQuestions(),
        sectionHash: generateSimpleHash(''),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper functions
function getDefaultQuestions() {
  return [
    "What assumptions is this section making?",
    "What challenges might arise during implementation?",
    "Is there anything missing from this recommendation?"
  ];
}

function generateSimpleHash(text: string): string {
  // Simple hash function for consistent section identification
  return btoa(text.substring(0, 100)).substring(0, 10);
}
