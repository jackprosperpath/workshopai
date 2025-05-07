
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Blueprint } from "@/components/workshop/types/workshop";
import type { PredefinedFormat } from "@/types/OutputFormat";
import type { AiModel } from "@/hooks/usePromptCanvas";

export function useBlueprintData(
  workshopId: string | null,
  setProblem: (value: string) => void,
  setMetrics: (value: string[]) => void,
  setConstraints: (value: string[]) => void,
  setSelectedModel: (value: AiModel) => void,
  updateFormat: (value: PredefinedFormat) => void,
  setCustomFormat: (value: string) => void,
  setWorkshopType: (type: 'online' | 'in-person') => void,
  setWorkshopName: (name: string) => void
) {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("settings");

  // Check for existing blueprint
  useEffect(() => {
    async function checkExistingBlueprint() {
      if (!workshopId) return;

      try {
        const { data, error } = await supabase
          .from('workshops')
          .select('generated_blueprint, problem, metrics, constraints, selected_model, selected_format, custom_format, workshop_type, duration, name')
          .eq('id', workshopId)
          .single();

        if (error) throw error;
        
        // Load all workshop data to persist form values
        if (data) {
          // Load blueprint if exists
          if (data.generated_blueprint) {
            const blueprintData = data.generated_blueprint as Blueprint;
            setBlueprint(blueprintData);
            
            // Only set the tab to blueprint on initial load, not on subsequent data fetches
            if (!initialLoadComplete) {
              setActiveTab("blueprint");
            }
          }
          
          // Load all other form values to persist between tab switches
          if (data.problem) setProblem(data.problem);
          
          // Fix the type issues by explicitly checking and converting types
          if (data.metrics && Array.isArray(data.metrics)) {
            setMetrics(data.metrics as string[]);
          }
          
          if (data.constraints && Array.isArray(data.constraints)) {
            setConstraints(data.constraints as string[]);
          }
          
          if (data.selected_model) {
            // Ensure we're passing a valid AiModel type
            const modelValue = data.selected_model as AiModel;
            setSelectedModel(modelValue);
          }
          
          if (data.selected_format && typeof data.selected_format === 'object' && 'type' in data.selected_format) {
            // Ensure we're casting to the correct PredefinedFormat type
            const formatType = data.selected_format.type;
            if (typeof formatType === 'string' && (
                formatType === 'detailed-report' || 
                formatType === 'prd' || 
                formatType === 'project-proposal' || 
                formatType === 'strategic-plan' || 
                formatType === 'business-case' ||
                formatType === 'other'
              )) {
              updateFormat(formatType as PredefinedFormat);
            }
          }
          
          if (data.custom_format && typeof data.custom_format === 'string') {
            setCustomFormat(data.custom_format);
          }
          
          if (data.workshop_type) setWorkshopType(data.workshop_type as 'online' | 'in-person');
          if (data.name) setWorkshopName(data.name);
          
          // Mark initial load as complete
          setInitialLoadComplete(true);
        }
      } catch (error) {
        console.error("Error checking existing blueprint:", error);
        setInitialLoadComplete(true);
      }
    }

    checkExistingBlueprint();
  }, [workshopId, setProblem, setMetrics, setConstraints, setSelectedModel, updateFormat, setCustomFormat, setWorkshopType, setWorkshopName, initialLoadComplete]);

  return {
    blueprint,
    setBlueprint,
    activeTab,
    setActiveTab
  };
}
