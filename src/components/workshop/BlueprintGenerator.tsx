import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Blueprint, Attendee } from "./types/workshop";
import { BlueprintHeader } from './blueprint/BlueprintHeader';
import { WorkshopSetupForm } from './blueprint/WorkshopSetupForm';
import { GeneratedBlueprint } from './blueprint/GeneratedBlueprint';
import { BlueprintTabs } from './blueprint/BlueprintTabs';
import { CalendarSourceInfo } from './blueprint/CalendarSourceInfo';
import { EmptyBlueprintState } from './blueprint/EmptyBlueprintState';

import { useWorkshopFormState } from '@/hooks/useWorkshopFormState';
import { useWorkshopLoader } from '@/hooks/useWorkshopLoader';
import { useBlueprintProcessor } from '@/hooks/useBlueprintProcessor';
import { useBlueprintSynchronization } from '@/hooks/useBlueprintSynchronization';

interface BlueprintGeneratorProps {
  workshopIdParam?: string | null;
  initialName?: string;
  initialProblem?: string;
  initialDuration?: number;
  initialAttendees?: Attendee[];
  onBlueprintGenerated?: (blueprint: Blueprint) => void;
  onWorkshopNameChange?: (name: string) => void;
}

export function BlueprintGenerator({
  workshopIdParam,
  initialName = "",
  initialProblem = "",
  initialDuration = 60,
  initialAttendees = [],
  onBlueprintGenerated,
  onWorkshopNameChange,
}: BlueprintGeneratorProps) {
  const [activeTab, setActiveTab] = useState<"settings" | "blueprint">("settings");
  const [workshopId, setWorkshopId] = useState<string | null>(workshopIdParam || null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);

  const formState = useWorkshopFormState({
    initialName,
    initialProblem,
    initialDuration,
    initialAttendees,
    initialMetrics: [], 
    onWorkshopNameChange,
  });

  const { loadingWorkshop, workshopError } = useWorkshopLoader({
    workshopIdParam,
    setWorkshopId,
    setFormStates: formState.setFormStates,
    setParentBlueprint: setBlueprint,
  });

  const {
    generateWorkshopBlueprint,
    saveWorkshopSettings,
    loading: processingLoading,
    errorMessage: processingErrorMessage,
    generatedBlueprint, // Make sure to get the generated blueprint from the processor
  } = useBlueprintProcessor({
    workshopId,
    formState: {
      workshopName: formState.workshopName,
      problem: formState.problem,
      metrics: formState.metrics,
      duration: formState.duration,
      workshopType: formState.workshopType,
      attendees: formState.attendees,
    },
    setParentBlueprint: setBlueprint,
    setParentWorkshopId: setWorkshopId,
    setActiveTab,
  });

  // Use the blueprint synchronization hook to update blueprint state
  useBlueprintSynchronization(
    generatedBlueprint, 
    blueprint, 
    setBlueprint, 
    onBlueprintGenerated
  );
  
  // Effect to notify parent when blueprint is loaded or changes
  useEffect(() => {
    if (blueprint && onBlueprintGenerated) {
      console.log("Blueprint changed, notifying parent component:", blueprint);
      setActiveTab("blueprint"); // Move tab setting here for consistency if blueprint is generated/loaded
      onBlueprintGenerated(blueprint);
    }
  }, [blueprint, onBlueprintGenerated]);
  
  // Effect to reset tab to settings if blueprint becomes null (e.g. new workshop)
  useEffect(() => {
    if (!blueprint && activeTab === "blueprint") {
      setActiveTab("settings");
    }
  }, [blueprint, activeTab]);

  const handleBlueprintUpdate = async (updatedBlueprint: Blueprint) => {
    setBlueprint(updatedBlueprint);
    if (workshopId) {
      try {
        await supabase.from('workshops').update({ 
          generated_blueprint: updatedBlueprint
        }).eq('id', workshopId);
        
        // Notify parent component about the update
        if (onBlueprintGenerated) {
          onBlueprintGenerated(updatedBlueprint);
        }
      } catch (error) {
        console.error("Error saving updated blueprint:", error);
      }
    }
  };

  const renderContent = () => {
    if (loadingWorkshop) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Loading blueprint data...</span></div>;
    }
    if (workshopError) {
      return <div className="text-red-500 flex items-center"><AlertCircle className="mr-2"/> Error loading blueprint data: {workshopError}</div>;
    }

    if (activeTab === "settings") {
      return (
        <WorkshopSetupForm
          errorMessage={processingErrorMessage} // Use error from processor
          workshopId={workshopId}
          workshopName={formState.workshopName}
          setWorkshopName={formState.setWorkshopName}
          problem={formState.problem}
          setProblem={formState.setProblem}
          metrics={formState.metrics}
          metricInput={formState.metricInput}
          setMetricInput={formState.setMetricInput}
          addMetric={formState.addMetric}
          removeMetric={formState.removeMetric} 
          duration={formState.duration}
          setDuration={formState.setDuration}
          workshopType={formState.workshopType}
          setWorkshopType={formState.setWorkshopType}
          loading={processingLoading} // Use loading from processor
          onGenerate={generateWorkshopBlueprint} 
          attendees={formState.attendees}
          updateAttendees={formState.setAttendees}
        />
      );
    }
    if (activeTab === "blueprint" && blueprint) {
      return <GeneratedBlueprint blueprint={blueprint} onBlueprintUpdate={handleBlueprintUpdate} />;
    }
    if (activeTab === "blueprint" && !blueprint) {
      return <EmptyBlueprintState onNavigateToSettings={() => setActiveTab("settings")} />;
    }
    return <div className="text-center p-4">Select a tab or generate an Instant AI Meeting Blueprint to begin.</div>;
  };
  
  // This handles the case where workshopIdParam is present but initial loading via hook is still pending.
  // useWorkshopLoader already sets workshopId, so this might be redundant or can be simplified.
  // For now, keeping a simple loader if workshopId is expected but not yet set by the hook.
  if (workshopIdParam && !workshopId && loadingWorkshop) { 
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading blueprint details...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <BlueprintHeader /> 
        {workshopId && <CalendarSourceInfo workshopId={workshopId} />}
        <BlueprintTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          blueprint={blueprint} 
        />
      </CardHeader>
      <CardContent className="mt-2">
        {renderContent()}
      </CardContent>
      {activeTab === 'settings' && (
        <CardFooter className="flex justify-end">
          <Button 
            onClick={workshopId ? saveWorkshopSettings : generateWorkshopBlueprint} 
            disabled={processingLoading || !formState.problem}
          >
            {processingLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {workshopId ? (processingLoading ? 'Saving...' : 'Save Blueprint Setup') : (processingLoading ? 'Generating...' : 'Generate Instant AI Meeting Blueprint')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
