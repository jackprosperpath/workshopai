
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { usePromptCanvasSync } from "@/hooks/usePromptCanvasSync";
import { GeneratedBlueprint } from "./blueprint/GeneratedBlueprint";
import { BlueprintTabs } from "./blueprint/BlueprintTabs";
import { CalendarSourceInfo } from "./blueprint/CalendarSourceInfo";
import { WorkshopSetupForm } from "./blueprint/WorkshopSetupForm";
import { EmptyBlueprintState } from "./blueprint/EmptyBlueprintState";
import { useBlueprintGenerator } from "@/hooks/useBlueprintGenerator";
import { useWorkshopSettings } from "@/hooks/useWorkshopSettings";
import type { Blueprint } from "./types/workshop";
import type { PredefinedFormat } from "@/types/OutputFormat";

export function BlueprintGenerator() {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');

  // Use our hooks for state management
  const {
    problem,
    setProblem,
    metrics,
    setMetrics,
    metricInput,
    setMetricInput,
    addMetric,
    constraints,
    setConstraints,
    constraintInput,
    setConstraintInput,
    addConstraint,
    selectedModel,
    setSelectedModel,
    selectedFormat,
    updateFormat,
    customFormat,
    setCustomFormat,
    workshopType,
    setWorkshopType,
  } = usePromptCanvas();

  const {
    isFromCalendar,
    workshopName,
    setWorkshopName,
    duration,
    setDuration,
  } = useWorkshopSettings(workshopId);

  // Blueprint generation hook
  const {
    loading,
    blueprint,
    setBlueprint,
    errorMessage,
    generateBlueprint
  } = useBlueprintGenerator();

  // Data synchronization
  const { syncData } = usePromptCanvasSync(
    { problem, metrics, constraints, selectedModel, selectedFormat, customFormat },
    (data) => {
      if (data.problem !== undefined) setProblem(data.problem);
      if (data.metrics !== undefined) setMetrics(data.metrics);
      if (data.constraints !== undefined) setConstraints(data.constraints);
      if (data.selectedModel !== undefined) setSelectedModel(data.selectedModel);
      if (data.selectedFormat !== undefined && updateFormat) {
        updateFormat(data.selectedFormat.type);
      }
      if (data.customFormat !== undefined && setCustomFormat) {
        setCustomFormat(data.customFormat);
      }
    }
  );

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
            setActiveTab("blueprint");
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
          
          if (data.selected_model) setSelectedModel(data.selected_model as any);
          
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
        }
      } catch (error) {
        console.error("Error checking existing blueprint:", error);
      }
    }

    checkExistingBlueprint();
  }, [workshopId, setBlueprint, setProblem, setMetrics, setConstraints, setSelectedModel, updateFormat, setCustomFormat, setWorkshopType, setWorkshopName]);

  const handleGenerateBlueprint = async () => {
    const result = await generateBlueprint({
      problem,
      metrics,
      constraints,
      selectedModel,
      selectedFormat,
      customFormat,
      duration,
      workshopType,
      workshopName,
      workshopId
    });
    
    if (result) {
      syncData({ problem, metrics, constraints, selectedModel, selectedFormat, customFormat });
      setActiveTab("blueprint");
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <CalendarSourceInfo isFromCalendar={isFromCalendar} />
      
      <div className="w-full">
        <div className={activeTab === "settings" ? "block" : "hidden"}>
          <WorkshopSetupForm 
            errorMessage={errorMessage}
            workshopId={workshopId}
            workshopName={workshopName}
            setWorkshopName={setWorkshopName}
            problem={problem}
            setProblem={setProblem}
            metrics={metrics}
            metricInput={metricInput}
            setMetricInput={setMetricInput}
            addMetric={addMetric}
            duration={duration}
            setDuration={setDuration}
            workshopType={workshopType}
            setWorkshopType={setWorkshopType}
            loading={loading}
            onGenerate={handleGenerateBlueprint}
          />
        </div>

        <div className={activeTab === "blueprint" ? "block" : "hidden"}>
          {blueprint ? (
            <GeneratedBlueprint blueprint={blueprint} />
          ) : (
            <EmptyBlueprintState onNavigateToSettings={() => setActiveTab("settings")} />
          )}
        </div>

        <BlueprintTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          blueprint={blueprint}
        />
      </div>
    </div>
  );
}
