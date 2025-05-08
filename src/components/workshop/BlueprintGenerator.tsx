
import { useSearchParams } from "react-router-dom";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { usePromptCanvasSync } from "@/hooks/usePromptCanvasSync";
import { CalendarSourceInfo } from "./blueprint/CalendarSourceInfo";
import { useBlueprintGenerator } from "@/hooks/useBlueprintGenerator";
import { useWorkshopSettings } from "@/hooks/useWorkshopSettings";
import { useBlueprintData } from "@/hooks/useBlueprintData";
import { BlueprintContent } from "./blueprint/BlueprintContent";
import type { Blueprint } from "./types/workshop";
import { useWorkshopPersistence } from "@/hooks/useWorkshopPersistence";
import { useCalendarAttendees } from "@/hooks/useCalendarAttendees";
import { useBlueprintGenerationState } from "@/hooks/useBlueprintGenerationState";
import { useBlueprintSynchronization } from "@/hooks/useBlueprintSynchronization";

interface BlueprintGeneratorProps {
  onBlueprintGenerated?: (blueprint: Blueprint | null) => void;
}

export function BlueprintGenerator({ onBlueprintGenerated }: BlueprintGeneratorProps) {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const { saveGeneratedBlueprint } = useWorkshopPersistence();

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

  // Calendar attendees hook
  const { attendees, updateAttendeeRoles } = useCalendarAttendees(workshopId);

  // Blueprint generation hook
  const {
    loading,
    blueprint: generatedBlueprint,
    errorMessage,
    generateBlueprint
  } = useBlueprintGenerator();

  // Blueprint state management hook
  const {
    blueprint,
    setBlueprint,
    handleBlueprintUpdate
  } = useBlueprintGenerationState({ onBlueprintGenerated });

  // Use new hook for handling blueprint data loading
  const {
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
    setWorkshopName,
    setBlueprint
  );

  // Sync the generated blueprint with our local state
  useBlueprintSynchronization(generatedBlueprint, blueprint, setBlueprint, onBlueprintGenerated);

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
      workshopId,
      attendees
    });
    
    if (result) {
      syncData({ problem, metrics, constraints, selectedModel, selectedFormat, customFormat });
      setActiveTab("blueprint");
    }
  };

  // Handler for blueprint updates
  const onBlueprintUpdate = async (updatedBlueprint: Blueprint) => {
    if (!workshopId) return Promise.reject(new Error("No workshop ID"));
    return handleBlueprintUpdate(updatedBlueprint, saveGeneratedBlueprint);
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
        attendees={attendees}
        updateAttendees={updateAttendeeRoles}
        onBlueprintUpdate={onBlueprintUpdate}
      />
    </div>
  );
}
