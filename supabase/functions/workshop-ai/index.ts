
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
    const { problem, metrics, constraints, feedback, format } = await req.json();

    // Base prompt construction
    let prompt = `
Given this problem statement: "${problem}"

Key metrics to optimize for:
${metrics.map(m => `- ${m}`).join('\n')}

Constraints to consider:
${constraints.map(c => `- ${c}`).join('\n')}`;

    // Add format-specific instructions
    if (format.type === 'report') {
      prompt += `\n\nPlease provide a detailed report including:
1. Executive Summary
2. Problem Analysis
3. Key Findings
4. Recommendations
5. Implementation Steps`;
    } else if (format.type === 'prd') {
      prompt += `\n\nPlease provide a Product Requirements Document including:
1. Product Overview
2. User Stories
3. Technical Requirements
4. Success Metrics
5. Implementation Timeline`;
    } else if (format.type === 'proposal') {
      prompt += `\n\nPlease provide a project proposal including:
1. Project Overview
2. Objectives & Goals
3. Scope of Work
4. Implementation Plan
5. Resource Requirements`;
    } else if (format.type === 'analysis') {
      prompt += `\n\nPlease provide a detailed analysis including:
1. Current Situation
2. Data Analysis
3. Key Insights
4. Trends & Patterns
5. Recommendations`;
    } else if (format.type === 'strategy') {
      prompt += `\n\nPlease provide a strategic plan including:
1. Strategic Overview
2. Goals & Objectives
3. Tactical Approach
4. Implementation Roadmap
5. Success Metrics`;
    } else if (format.type === 'other' && format.customFormat) {
      prompt += `\n\nPlease provide your response in the following custom format: ${format.customFormat}`;
    }

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
