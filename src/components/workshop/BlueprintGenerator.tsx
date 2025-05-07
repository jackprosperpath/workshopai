
import { useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { usePromptCanvasSync } from "@/hooks/usePromptCanvasSync";
import { CalendarSourceInfo } from "./blueprint/CalendarSourceInfo";
import { useBlueprintGenerator } from "@/hooks/useBlueprintGenerator";
import { useWorkshopSettings } from "@/hooks/useWorkshopSettings";
import { useBlueprintData } from "@/hooks/useBlueprintData";
import { BlueprintContent } from "./blueprint/BlueprintContent";
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
    blueprint: generatedBlueprint,
    setBlueprint: setGeneratedBlueprint,
    errorMessage,
    generateBlueprint
  } = useBlueprintGenerator();

  // Use new hook for handling blueprint data loading
  const {
    blueprint,
    setBlueprint,
    activeTab,
    setActiveTab
  } = useBlueprintData(
    workshopId,
    setProblem,
    setMetrics,
    setConstraints,
    setSelectedModel,
    updateFormat,
    setCustomFormat,
    setWorkshopType,
    setWorkshopName
  );

  // Sync the blueprint from generation to our local state
  if (generatedBlueprint && generatedBlueprint !== blueprint) {
    setBlueprint(generatedBlueprint);
  }

  // Data synchronization
  const { syncData } = usePromptCanvasSync(
    { problem, metrics, constraints, selectedModel, selectedFormat, customFormat },
    (data) => {
      if (data.problem !== undefined) setProblem(data.problem);
      if (data.metrics !== undefined) setMetrics(data.metrics);
      if (data.constraints !== undefined) setConstraints(data.constraints);
      if (data.selectedModel !== undefined) setSelectedModel(data.selectedModel);
      if (data.selectedFormat !== undefined && updateFormat) {
        updateFormat(data.selectedFormat.type as PredefinedFormat);
      }
      if (data.customFormat !== undefined && setCustomFormat) {
        setCustomFormat(data.customFormat);
      }
    }
  );

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
      
      <BlueprintContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        blueprint={blueprint}
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
  );
}
