import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { usePromptCanvasSync } from "@/hooks/usePromptCanvasSync";
import { useWorkshopPersistence } from "@/hooks/useWorkshopPersistence";
import { WorkshopSettingsForm } from "./settings/WorkshopSettingsForm";
import { GeneratedBlueprint } from "./blueprint/GeneratedBlueprint";
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
  const [duration, setDuration] = useState(120);
  
  const { saveWorkshopData, saveGeneratedBlueprint } = useWorkshopPersistence();

  const generateBlueprint = async () => {
    if (!problem) {
      toast.error("Please specify a workshop scope statement");
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

  return (
    <div className="space-y-8 pb-10">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">Workshop Design</TabsTrigger>
          <TabsTrigger value="blueprint">Generated Blueprint</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Workshop Design</CardTitle>
              <CardDescription>Configure the context and settings for your workshop</CardDescription>
            </CardHeader>

            <CardContent>
              <WorkshopSettingsForm
                problem={problem}
                setProblem={setProblem}
                metrics={metrics}
                setMetrics={setMetrics}
                metricInput={metricInput}
                setMetricInput={setMetricInput}
                addMetric={addMetric}
                constraints={constraints}
                constraintInput={constraintInput}
                setConstraintInput={setConstraintInput}
                addConstraint={addConstraint}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                selectedFormat={selectedFormat}
                updateFormat={updateFormat}
                customFormat={customFormat}
                setCustomFormat={setCustomFormat}
                duration={duration}
                setDuration={setDuration}
                onGenerate={generateBlueprint}
                loading={loading}
                workshopType={workshopType}
                setWorkshopType={setWorkshopType}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blueprint" className="mt-4">
          {blueprint ? (
            <GeneratedBlueprint blueprint={blueprint} />
          ) : (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-center">No Blueprint Generated Yet</h3>
                <p className="text-muted-foreground text-center mt-2 max-w-md">
                  Fill in the workshop design settings, then click "Generate Workshop Blueprint" to create your workshop agenda.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("settings")} 
                  className="mt-4"
                >
                  Go to Workshop Design
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
