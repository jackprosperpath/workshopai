
import React, { useState, useEffect, useCallback } from 'react';
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

import { useCalendarAttendees } from '@/hooks/useCalendarAttendees';
import { useBlueprintGenerationState } from '@/hooks/useBlueprintGenerationState';
import { useBlueprintSynchronization } from '@/hooks/useBlueprintSynchronization';
import { useWorkshop } from '@/hooks/useWorkshop'; // Assuming this hook provides workshop data

interface BlueprintGeneratorProps {
  workshopIdParam: string | null;
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
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1); // Step management remains internal
  const [activeTab, setActiveTab] = useState<"settings" | "blueprint">("settings");

  const { workshop, workshopId, setWorkshopId, loadingWorkshop, workshopError } = useWorkshop(workshopIdParam);

  const {
    workshopName, setWorkshopName,
    problem, setProblem,
    metrics, metricInput, setMetricInput, addMetric, removeMetric,
    duration, setDuration,
    workshopType, setWorkshopType,
    attendees, setAttendees,
    blueprint, setBlueprint,
    loading, setLoading,
    errorMessage, setErrorMessage,
  } = useBlueprintGenerationState(
    initialName,
    initialProblem,
    initialDuration,
    initialAttendees
  );

  useCalendarAttendees(workshopId, setAttendees, setWorkshopName, setProblem, setDuration);
  useBlueprintSynchronization(workshopId, setBlueprint, setWorkshopName, setProblem, setDuration, setMetrics, setWorkshopType, setAttendees);

  useEffect(() => {
    if (workshopIdParam) {
      setWorkshopId(workshopIdParam);
    }
  }, [workshopIdParam, setWorkshopId]);

  useEffect(() => {
    if (onWorkshopNameChange && workshopName) {
      onWorkshopNameChange(workshopName);
    }
  }, [workshopName, onWorkshopNameChange]);

  useEffect(() => {
    if (blueprint) {
      setActiveTab("blueprint");
      if (onBlueprintGenerated) {
        onBlueprintGenerated(blueprint);
      }
    }
  }, [blueprint, onBlueprintGenerated]);

  const generateBlueprint = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await supabase.functions.invoke("generate-workshop-blueprint", {
        body: {
          workshopId: workshopId, // Use workshopId from useWorkshop hook
          name: workshopName,
          problem,
          metrics,
          duration,
          workshop_type: workshopType,
          attendees: attendees.map(a => ({ email: a.email, name: a.name, role: a.role })),
        },
      });

      if (response.error) throw response.error;
      if (!response.data) throw new Error("No data returned from blueprint generation.");

      setBlueprint(response.data.blueprint);
      toast({ title: "Blueprint Generated!", description: "Your workshop blueprint is ready." });
      setActiveTab("blueprint");
    } catch (error: any) {
      console.error("Error generating blueprint:", error);
      setErrorMessage(error.message || "Failed to generate blueprint. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Could not generate blueprint.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    if (!workshopId) {
      toast({ title: "Error", description: "Workshop ID is missing.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase
        .from('workshops')
        .update({
          name: workshopName,
          problem: problem,
          // metrics: metrics, // Assuming metrics is an array of strings
          duration: duration,
          workshop_type: workshopType,
          // attendees: attendees // You might need to handle attendees update differently, e.g., a separate table
        })
        .eq('id', workshopId);

      if (error) throw error;

      toast({ title: "Settings Saved", description: "Workshop settings have been updated." });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setErrorMessage(error.message || "Failed to save settings.");
      toast({
        title: "Error",
        description: error.message || "Could not save settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const renderContent = () => {
    if (loadingWorkshop) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Loading workshop...</span></div>;
    }
    if (workshopError) {
      return <div className="text-red-500 flex items-center"><AlertCircle className="mr-2"/> Error loading workshop data: {workshopError}</div>;
    }

    if (activeTab === "settings") {
      return (
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
          // removeMetric={removeMetric} // This function is missing from useBlueprintGenerationState
          duration={duration}
          setDuration={setDuration}
          workshopType={workshopType}
          setWorkshopType={setWorkshopType}
          loading={loading}
          onGenerate={generateBlueprint}
          attendees={attendees}
          updateAttendees={setAttendees}
        />
      );
    }
    if (activeTab === "blueprint" && blueprint) {
      return <GeneratedBlueprint blueprint={blueprint} />;
    }
    return <div className="text-center p-4">Select a tab or generate a blueprint to begin.</div>;
  };

  if (!workshopId && workshopIdParam) {
    // If workshopIdParam is present but workshopId is not yet set (still loading/resolving), show loading.
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading workshop details...</p>
      </div>
    );
  }
  
  if (!workshopId && !workshopIdParam) {
     // This case implies creating a new workshop from scratch without a param
     // It might require a slightly different UI or flow, but for now, we allow proceeding to settings
  }


  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <BlueprintHeader currentStep={currentStep} />
        {workshopId && <CalendarSourceInfo workshopId={workshopId} />}
        <BlueprintTabs activeTab={activeTab} setActiveTab={setActiveTab} blueprint={blueprint} />
      </CardHeader>
      <CardContent className="mt-2">
        {renderContent()}
      </CardContent>
      {activeTab === 'settings' && (
        <CardFooter className="flex justify-end">
          <Button onClick={workshopId ? handleSaveSettings : generateBlueprint} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {workshopId ? (loading ? 'Saving...' : 'Save Settings') : (loading ? 'Generating...' : 'Generate Blueprint')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
