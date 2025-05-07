
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
          .select('generated_blueprint')
          .eq('id', workshopId)
          .single();

        if (error) throw error;
        
        if (data && data.generated_blueprint) {
          // Ensure the blueprint data is of the correct type
          const blueprintData = data.generated_blueprint as Blueprint;
          setBlueprint(blueprintData);
          setActiveTab("blueprint");
        }
      } catch (error) {
        console.error("Error checking existing blueprint:", error);
      }
    }

    checkExistingBlueprint();
  }, [workshopId, setBlueprint]);

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
