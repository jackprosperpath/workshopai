
import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import type { Blueprint } from "@/components/workshop/types/workshop";
import type { PredefinedFormat } from "@/types/OutputFormat";

export function useWorkshopPersistence() {
  const [isSaving, setIsSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');

  const saveWorkshopData = useCallback(async ({
    problem,
    metrics,
    constraints,
    selectedModel,
    selectedFormat,
    customFormat,
    duration,
    workshopType
  }: {
    problem: string;
    metrics: string[];
    constraints: string[];
    selectedModel: string;
    selectedFormat?: {
      type: PredefinedFormat;
      description: string;
    };
    customFormat?: string;
    duration: number;
    workshopType: 'online' | 'in-person';
  }) => {
    if (!workshopId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('workshops')
        .update({
          problem,
          metrics,
          constraints,
          selected_model: selectedModel,
          selected_format: selectedFormat,
          custom_format: customFormat,
          duration,
          workshop_type: workshopType,
          updated_at: new Date().toISOString()
        })
        .eq('id', workshopId);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving workshop:", error);
      toast.error("Failed to save workshop data");
    } finally {
      setIsSaving(false);
    }
  }, [workshopId]);

  const saveGeneratedBlueprint = useCallback(async (blueprint: Blueprint) => {
    if (!workshopId) return;
    
    try {
      const { error } = await supabase
        .from('workshops')
        .update({
          generated_blueprint: blueprint,
          updated_at: new Date().toISOString()
        })
        .eq('id', workshopId);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving blueprint:", error);
      toast.error("Failed to save blueprint");
      throw error;
    }
  }, [workshopId]);

  return {
    isSaving,
    saveWorkshopData,
    saveGeneratedBlueprint
  };
}
