
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, workshopId, userId, data } = await req.json();

    if (action === 'create') {
      // Create a new shareable workshop
      const { data: workshop, error } = await supabase
        .from('workshops')
        .insert({
          owner_id: userId,
          problem: data.problem || '',
          metrics: data.metrics || [],
          constraints: data.constraints || [],
          selected_model: data.selectedModel || 'gpt-4o-mini',
          share_id: crypto.randomUUID().substring(0, 8)
        })
        .select()
        .single();

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, workshop }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    else if (action === 'get') {
      // Get workshop by share ID
      const { data: workshop, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('share_id', workshopId)
        .single();

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, workshop }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'update') {
      // Update an existing workshop
      const { data: workshop, error } = await supabase
        .from('workshops')
        .update({
          problem: data.problem,
          metrics: data.metrics,
          constraints: data.constraints,
          selected_model: data.selectedModel,
          updated_at: new Date().toISOString()
        })
        .eq('share_id', workshopId)
        .select()
        .single();

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, workshop }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  } catch (error) {
    console.error('Error in share-workshop function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
