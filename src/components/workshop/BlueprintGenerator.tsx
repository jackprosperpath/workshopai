
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { usePromptCanvasSync } from "@/hooks/usePromptCanvasSync";
import { useWorkshopPersistence } from "@/hooks/useWorkshopPersistence";
import { GeneratedBlueprint } from "./blueprint/GeneratedBlueprint";
import type { Blueprint } from "./types/workshop";
import { WorkshopObjectives } from "./settings/WorkshopObjectives";
import { WorkshopPeopleTime } from "./settings/WorkshopPeopleTime";
import { WorkshopContext } from "./settings/WorkshopContext";

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
              <CardTitle>Create Workshop Blueprint</CardTitle>
              <CardDescription>
                Follow these 3 steps to create your AI-facilitated workshop
              </CardDescription>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                  <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1</div>
                  <div className="h-0.5 w-12 bg-muted"></div>
                  <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</div>
                  <div className="h-0.5 w-12 bg-muted"></div>
                  <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentStep === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3</div>
                </div>
                <div className="text-muted-foreground text-sm">
                  {currentStep === 1 && "Objectives"}
                  {currentStep === 2 && "People & Time"}
                  {currentStep === 3 && "Context"}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {currentStep === 1 && (
                <WorkshopObjectives 
                  problem={problem}
                  setProblem={setProblem}
                  metrics={metrics}
                  metricInput={metricInput}
                  setMetricInput={setMetricInput}
                  addMetric={addMetric}
                />
              )}
              
              {currentStep === 2 && (
                <WorkshopPeopleTime
                  duration={duration}
                  setDuration={setDuration}
                  workshopType={workshopType}
                  setWorkshopType={setWorkshopType}
                />
              )}
              
              {currentStep === 3 && (
                <WorkshopContext
                  constraints={constraints}
                  constraintInput={constraintInput}
                  setConstraintInput={setConstraintInput}
                  addConstraint={addConstraint}
                  loading={loading}
                  onGenerate={generateBlueprint}
                />
              )}
              
              <div className="flex justify-between mt-6">
                {currentStep > 1 ? (
                  <Button onClick={prevStep} variant="outline">
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}
                {currentStep < 3 ? (
                  <Button onClick={nextStep}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={generateBlueprint} 
                    disabled={loading || !problem}
                    className="flex items-center"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Blueprint <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
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

        <div className="flex justify-center gap-4 mt-6">
          <Button 
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
          >
            Workshop Setup
          </Button>
          <Button 
            variant={activeTab === "blueprint" ? "default" : "outline"}
            onClick={() => setActiveTab("blueprint")}
            disabled={!blueprint}
          >
            Generated Blueprint
          </Button>
        </div>
      </div>
    </div>
  );
}
