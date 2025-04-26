
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { usePromptCanvasSync } from "@/hooks/usePromptCanvasSync";
import { useWorkshopPersistence } from "@/hooks/useWorkshopPersistence";
import { useSearchParams } from "react-router-dom";
import { GeneratedBlueprint } from "./blueprint/GeneratedBlueprint";
import { BlueprintSteps } from "./blueprint/BlueprintSteps";
import { BlueprintHeader } from "./blueprint/BlueprintHeader";
import { BlueprintTabs } from "./blueprint/BlueprintTabs";
import type { Blueprint } from "./types/workshop";

export function BlueprintGenerator() {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');

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

  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [activeTab, setActiveTab] = useState<string>("settings");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [duration, setDuration] = useState(120);
  const [isFromCalendar, setIsFromCalendar] = useState(false);
  
  const { saveWorkshopData, saveGeneratedBlueprint } = useWorkshopPersistence();

  // Check if this workshop was created from a calendar invite
  useEffect(() => {
    async function checkCalendarSource() {
      if (!workshopId) return;

      try {
        const { data, error } = await supabase
          .from('workshops')
          .select(`
            invitation_source_id,
            problem,
            duration,
            workshop_type
          `)
          .eq('id', workshopId)
          .single();

        if (error) throw error;
        
        if (data && data.invitation_source_id) {
          setIsFromCalendar(true);
          
          // Pre-fill form with data from calendar invite
          if (data.problem) setProblem(data.problem);
          if (data.duration) setDuration(data.duration);
          if (data.workshop_type) setWorkshopType(data.workshop_type as 'online' | 'in-person');
        }
      } catch (error) {
        console.error("Error checking calendar source:", error);
      }
    }

    checkCalendarSource();
  }, [workshopId]);

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
  }, [workshopId]);

  const generateBlueprint = async () => {
    if (!problem) {
      toast.error("Please specify a workshop objective");
      return;
    }

    await saveWorkshopData({
      problem,
      metrics,
      constraints,
      selectedModel,
      selectedFormat,
      customFormat,
      duration,
      workshopType,
    });
    
    syncData({ problem, metrics, constraints, selectedModel, selectedFormat, customFormat });
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-workshop-blueprint", {
        body: {
          context: problem,
          objective: problem,
          duration,
          constraints: constraints.join(", "),
          workshopType,
        }
      });

      if (error) throw error;

      if (data.blueprint) {
        // Properly type-cast the blueprint data
        const blueprintData = data.blueprint as Blueprint;
        setBlueprint(blueprintData);
        await saveGeneratedBlueprint(blueprintData);
        toast.success("Workshop blueprint generated successfully");
        setActiveTab("blueprint");
      } else {
        throw new Error("No blueprint data received");
      }
    } catch (error) {
      console.error("Error generating blueprint:", error);
      toast.error("Failed to generate workshop blueprint");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !problem) {
      toast.error("Please specify a workshop objective");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="space-y-8 pb-10">
      {isFromCalendar && (
        <Card className="bg-accent/10 border-accent mb-4">
          <CardContent className="p-4 flex items-center">
            <InfoIcon className="h-5 w-5 mr-3 text-accent" />
            <div className="text-sm">
              This workshop was created from a calendar invitation. Some fields have been pre-filled based on the meeting details.
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="w-full">
        <div className={activeTab === "settings" ? "block" : "hidden"}>
          <Card>
            <CardHeader>
              <BlueprintHeader currentStep={currentStep} />
            </CardHeader>
            <CardContent>
              <BlueprintSteps 
                currentStep={currentStep}
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
                constraints={constraints}
                constraintInput={constraintInput}
                setConstraintInput={setConstraintInput}
                addConstraint={addConstraint}
                loading={loading}
                onGenerate={generateBlueprint}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            </CardContent>
          </Card>
        </div>

        <div className={activeTab === "blueprint" ? "block" : "hidden"}>
          {blueprint ? (
            <GeneratedBlueprint blueprint={blueprint} />
          ) : (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-center">No Blueprint Generated Yet</h3>
                <p className="text-muted-foreground text-center mt-2 max-w-md">
                  Configure your workshop setup, then click "Generate Workshop Blueprint" to create your workshop agenda.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("settings")} 
                  className="mt-4"
                >
                  Go to Workshop Setup
                </Button>
              </CardContent>
            </Card>
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
