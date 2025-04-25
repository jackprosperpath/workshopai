
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { usePromptCanvasSync } from "@/hooks/usePromptCanvasSync";
import { useWorkshopPersistence } from "@/hooks/useWorkshopPersistence";
import { GeneratedBlueprint } from "./blueprint/GeneratedBlueprint";
import { BlueprintSteps } from "./blueprint/BlueprintSteps";
import { BlueprintHeader } from "./blueprint/BlueprintHeader";
import { BlueprintTabs } from "./blueprint/BlueprintTabs";
import type { Blueprint } from "./types/workshop";

export function BlueprintGenerator() {
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
  
  const { saveWorkshopData, saveGeneratedBlueprint } = useWorkshopPersistence();

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
        setBlueprint(data.blueprint);
        await saveGeneratedBlueprint(data.blueprint);
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
