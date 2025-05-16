
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Blueprint } from "@/components/workshop/types/workshop";
import type { ConciseBlueprint } from "@/types/blueprint";

export function useBlueprintData(workshopId: string) {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchBlueprintData() {
      if (!workshopId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isValidUuid = uuidRegex.test(workshopId);
        
        let query;
        if (isValidUuid) {
          query = supabase
            .from('workshops')
            .select('generated_blueprint, name')
            .eq('id', workshopId)
            .single();
        } else {
          query = supabase
            .from('workshops')
            .select('generated_blueprint, name')
            .eq('share_id', workshopId)
            .single();
        }

        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data && data.generated_blueprint) {
          // Add attendees property if not exists
          const blueprintData = data.generated_blueprint as Blueprint;
          // Ensure the blueprint has an attendees property (even if empty)
          if (!blueprintData.attendees) {
            blueprintData.attendees = [];
          }
          
          setBlueprint(blueprintData);
        }
      } catch (err: any) {
        console.error("Error fetching blueprint data:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBlueprintData();
  }, [workshopId]);

  return { blueprint, isLoading, error };
}
