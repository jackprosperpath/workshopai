
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { Blueprint } from "@/components/workshop/types/workshop";
// Removed import for UseWorkshopFormStateSetters as it's not exported or used.

interface UseWorkshopLoaderProps {
  workshopIdParam?: string | null;
  setWorkshopId: (id: string | null) => void;
  setFormStates: (data: {
    name?: string;
    problem?: string;
    metrics?: string[];
    duration?: number;
    workshopType?: 'online' | 'in-person';
    // attendees are not directly in workshop table top-level, often part of blueprint or separate handling
  }) => void;
  setParentBlueprint: (blueprint: Blueprint | null) => void;
}

export function useWorkshopLoader({
  workshopIdParam,
  setWorkshopId,
  setFormStates,
  setParentBlueprint,
}: UseWorkshopLoaderProps) {
  const [loadingWorkshop, setLoadingWorkshop] = useState(false);
  const [workshopError, setWorkshopError] = useState<string | null>(null);

  const fetchWorkshopDetails = useCallback(async (id: string) => {
    setLoadingWorkshop(true);
    setWorkshopError(null);
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('*') // Select all needed fields
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setFormStates({
          name: data.name,
          problem: data.problem,
          metrics: Array.isArray(data.metrics) ? data.metrics.filter((m): m is string => typeof m === 'string') : [],
          duration: data.duration,
          workshopType: data.workshop_type as 'online' | 'in-person',
        });
        // Assuming attendees might be part of generated_blueprint or handled elsewhere
        // For now, not setting attendees from this top-level workshop fetch unless schema changes
        if (data.generated_blueprint) {
          setParentBlueprint(data.generated_blueprint as Blueprint);
        } else {
          setParentBlueprint(null);
        }
      }
    } catch (error: any) {
      console.error("Error fetching workshop:", error);
      setWorkshopError(error.message);
    } finally {
      setLoadingWorkshop(false);
    }
  }, [setFormStates, setParentBlueprint]);

  useEffect(() => {
    if (workshopIdParam) {
      setWorkshopId(workshopIdParam);
      fetchWorkshopDetails(workshopIdParam);
    } else {
      // Reset if no workshopIdParam, e.g. navigating away from a specific workshop to create new
      setWorkshopId(null);
      setFormStates({ 
        name: "", 
        problem: "", 
        metrics: [], 
        duration: 60, 
        workshopType: 'online' 
      });
      setParentBlueprint(null);
    }
  }, [workshopIdParam, setWorkshopId, fetchWorkshopDetails, setFormStates, setParentBlueprint]);

  return {
    loadingWorkshop,
    workshopError,
  };
}
