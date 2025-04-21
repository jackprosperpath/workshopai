
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
    const { fullText, sectionTexts } = await req.json();

    if (!fullText || typeof fullText !== 'string' || fullText.trim().length === 0) {
      console.error('Invalid document text:', fullText);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or empty document text',
          questions: getDefaultQuestions(),
          documentHash: generateSimpleHash(fullText || ''),
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate a hash for caching/identifying this text
    const documentHash = generateSimpleHash(fullText);
    
    const SYSTEM = `
    You are a world-class facilitator helping cross-functional teams stress-test ideas.
    Given a proposed solution document, output exactly 3 thought-provoking questions that:
    - Address the document holistically, considering the entire solution
    - Expose potential risks, implementation challenges, or missing data
    - Are specific enough to be answered but broad enough to prompt meaningful discussion
    - Would be valuable for stakeholders to consider before approving
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
          temperature: 0.7,
          messages: [
            { role: 'system', content: SYSTEM },
            { role: 'user', content: fullText }
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
          documentHash,
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
          documentHash,
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
        documentHash: generateSimpleHash(''),
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
    "What are the key assumptions underlying this proposed solution?",
    "What implementation challenges might the team face with this approach?",
    "Are there any stakeholder perspectives that haven't been addressed in this solution?"
  ];
}

function generateSimpleHash(text: string): string {
  // Simple hash function for consistent document identification
  return btoa(text.substring(0, 100)).substring(0, 10);
}
