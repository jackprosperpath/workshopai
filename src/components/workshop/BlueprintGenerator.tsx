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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Attendee } from "./types/workshop";

export function BlueprintGenerator() {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [shouldLoadFromCalendar, setShouldLoadFromCalendar] = useState<boolean>(true);

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

  // Fetch attendees when workshop ID changes
  useEffect(() => {
    const fetchAttendees = async () => {
      if (!workshopId || !shouldLoadFromCalendar) return;
      
      try {
        // First check if this is from a calendar invite
        const { data: workshop, error: workshopError } = await supabase
          .from('workshops')
          .select('invitation_source_id')
          .eq('id', workshopId)
          .single();
          
        if (workshopError || !workshop || !workshop.invitation_source_id) {
          return; // Not from calendar or error
        }
        
        // Get calendar invite attendees
        const { data: invite, error: inviteError } = await supabase
          .from('inbound_invites')
          .select('attendees')
          .eq('id', workshop.invitation_source_id)
          .single();
          
        if (inviteError || !invite || !invite.attendees) {
          return;
        }
        
        // Format attendees
        const formattedAttendees: Attendee[] = Array.isArray(invite.attendees) ? 
          invite.attendees.map((email: string) => ({
            email,
            role: ""
          })) : [];
          
        // Only update if we have new attendees and they haven't been edited yet
        if (formattedAttendees.length > 0 && 
           (attendees.length === 0 || 
            (attendees.length === 1 && !attendees[0].email))) {
          setAttendees(formattedAttendees);
          // After loading from calendar once, don't reload to avoid overwriting user edits
          setShouldLoadFromCalendar(false);
        }
      } catch (error) {
        console.error("Error fetching attendees:", error);
      }
    };
    
    fetchAttendees();
  }, [workshopId, attendees, shouldLoadFromCalendar]);

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
      workshopId,
      attendees // Pass attendees to blueprint generator
    });
    
    if (result) {
      syncData({ problem, metrics, constraints, selectedModel, selectedFormat, customFormat });
      setActiveTab("blueprint");
    }
  };

  // Update attendees with role information from the workshop settings
  const updateAttendeeRoles = (updatedAttendees: Attendee[]) => {
    setAttendees(updatedAttendees);
    // Once user has explicitly updated attendees, don't reload from calendar
    setShouldLoadFromCalendar(false);
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
      />
    </div>
  );
}
