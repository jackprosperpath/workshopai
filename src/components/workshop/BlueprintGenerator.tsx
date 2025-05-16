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
import { EmptyBlueprintState } from './blueprint/EmptyBlueprintState'; // Added this import

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
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1); // This seems unused, consider removing if not part of a future plan
  const [activeTab, setActiveTab] = useState<"settings" | "blueprint">("settings");
  
  // Workshop ID and state management
  const [workshopId, setWorkshopId] = useState<string | null>(workshopIdParam || null);
  const [loadingWorkshop, setLoadingWorkshop] = useState(false);
  const [workshopError, setWorkshopError] = useState<string | null>(null);
  
  // Workshop data state
  const [workshopName, setWorkshopName] = useState(initialName);
  const [problem, setProblem] = useState(initialProblem);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [metricInput, setMetricInput] = useState("");
  const [duration, setDuration] = useState(initialDuration);
  const [workshopType, setWorkshopType] = useState<'online' | 'in-person'>('online');
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (workshopIdParam) {
      setWorkshopId(workshopIdParam);
      fetchWorkshopDetails(workshopIdParam);
    }
  }, [workshopIdParam]);

  const fetchWorkshopDetails = async (id: string) => {
    setLoadingWorkshop(true);
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        if (data.name) setWorkshopName(data.name);
        if (data.problem) setProblem(data.problem);
        if (data.metrics && Array.isArray(data.metrics)) {
          setMetrics(data.metrics.filter((m): m is string => typeof m === 'string'));
        } else {
          setMetrics([]);
        }
        if (data.duration) setDuration(data.duration);
        if (data.workshop_type) setWorkshopType(data.workshop_type as 'online' | 'in-person');
        if (data.generated_blueprint) setBlueprint(data.generated_blueprint as Blueprint);
        // Ensure attendees are loaded if available, though not explicitly in schema for this table in this snippet
        // For now, we rely on initialAttendees or manual input for this component instance
      }
    } catch (error: any) {
      console.error("Error fetching workshop:", error);
      setWorkshopError(error.message);
    } finally {
      setLoadingWorkshop(false);
    }
  };

  useEffect(() => {
    if (onWorkshopNameChange && workshopName) {
      onWorkshopNameChange(workshopName);
    }
  }, [workshopName, onWorkshopNameChange]);

  useEffect(() => {
    if (blueprint && onBlueprintGenerated) {
      setActiveTab("blueprint");
      onBlueprintGenerated(blueprint);
    }
  }, [blueprint, onBlueprintGenerated]);

  const addMetric = () => {
    if (metricInput.trim()) {
      setMetrics([...metrics, metricInput.trim()]);
      setMetricInput("");
    }
  };

  const removeMetric = (index: number) => {
    const updatedMetrics = [...metrics];
    updatedMetrics.splice(index, 1);
    setMetrics(updatedMetrics);
  };

  const generateBlueprint = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await supabase.functions.invoke("generate-workshop-blueprint", {
        body: {
          workshopId: workshopId, // workshopId can be null if creating a new one
          name: workshopName,
          problem,
          metrics,
          duration,
          workshop_type: workshopType,
          attendees: attendees.map(a => ({ email: a.email, role: a.role })),
        },
      });

      if (response.error) throw response.error;
      if (!response.data) throw new Error("No data returned from blueprint generation.");
      
      // If a new workshop was created, the function might return the new workshopId
      if (response.data.workshopId && !workshopId) {
        setWorkshopId(response.data.workshopId);
      }

      setBlueprint(response.data.blueprint);
      toast({ title: "Blueprint Generated!", description: "Your Instant AI Meeting Blueprint is ready." });
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
      toast({ title: "Error", description: "Blueprint ID is missing.", variant: "destructive" });
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
          metrics: metrics,
          duration: duration,
          workshop_type: workshopType,
          // attendees are part of generated_blueprint, not top-level workshop columns based on previous context
        })
        .eq('id', workshopId);

      if (error) throw error;

      toast({ title: "Settings Saved", description: "Blueprint settings have been updated." });
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
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Loading blueprint data...</span></div>;
    }
    if (workshopError) {
      return <div className="text-red-500 flex items-center"><AlertCircle className="mr-2"/> Error loading blueprint data: {workshopError}</div>;
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
          removeMetric={removeMetric} 
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
      return <GeneratedBlueprint blueprint={blueprint} onBlueprintUpdate={async (updatedBlueprint) => { 
        setBlueprint(updatedBlueprint);
        if(workshopId) {
          await supabase.from('workshops').update({ generated_blueprint: updatedBlueprint}).eq('id', workshopId);
        }
      }} />;
    }
    // If blueprint is null and tab is blueprint, show empty state or message
    if (activeTab === "blueprint" && !blueprint) {
      return <EmptyBlueprintState onNavigateToSettings={() => setActiveTab("settings")} />;
    }
    return <div className="text-center p-4">Select a tab or generate an Instant AI Meeting Blueprint to begin.</div>;
  };

  if (!workshopId && workshopIdParam) { 
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
        <BlueprintHeader currentStep={currentStep} />
        {workshopId && <CalendarSourceInfo workshopId={workshopId} />}
        <BlueprintTabs 
          activeTab={activeTab} 
          setActiveTab={(tab) => setActiveTab(tab)} 
          blueprint={blueprint} 
        />
      </CardHeader>
      <CardContent className="mt-2">
        {renderContent()}
      </CardContent>
      {activeTab === 'settings' && (
        <CardFooter className="flex justify-end">
          <Button onClick={workshopId ? handleSaveSettings : generateBlueprint} disabled={loading || !problem} /* Disable generate if problem is empty */>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {workshopId ? (loading ? 'Saving...' : 'Save Blueprint Setup') : (loading ? 'Generating...' : 'Generate Instant AI Meeting Blueprint')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
