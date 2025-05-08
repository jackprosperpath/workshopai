
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WhiteboardCanvas } from "./WhiteboardCanvas";
import { Separator } from "@/components/ui/separator";
import type { Blueprint } from "../types/workshop";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WhiteboardViewProps {
  blueprint?: Blueprint | null;
}

export function WhiteboardView({ blueprint }: WhiteboardViewProps) {
  const [activeTab, setActiveTab] = useState<string>("main");
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  
  // Get list of steps from blueprint
  const steps = blueprint?.steps || [];
  const activeStep = steps[activeStepIndex];
  
  const handleNextStep = () => {
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    }
  };
  
  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="main">Main Whiteboard</TabsTrigger>
          {blueprint && <TabsTrigger value="blueprint">Blueprint Activities</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="main" className="mt-4">
          <div className="bg-white rounded-lg p-4 border shadow-sm mb-4">
            <h2 className="text-xl font-bold mb-2">Main Workshop Whiteboard</h2>
            <p className="text-muted-foreground">
              This is a collaborative workspace for the entire workshop. Use the tools below to brainstorm, plan, and collaborate.
            </p>
          </div>
          <WhiteboardCanvas />
        </TabsContent>
        
        <TabsContent value="blueprint" className="mt-4">
          {blueprint && steps.length > 0 ? (
            <div>
              <div className="bg-white rounded-lg p-4 border shadow-sm mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">{activeStep?.name || "Activity"}</h2>
                    <p className="text-muted-foreground">
                      {activeStep?.duration} minutes - Step {activeStepIndex + 1} of {steps.length}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handlePrevStep}
                      disabled={activeStepIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleNextStep}
                      disabled={activeStepIndex === steps.length - 1}
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="rounded-md bg-slate-50 p-4">
                  <h3 className="font-medium mb-2">Activity Description:</h3>
                  <p>{activeStep?.description}</p>
                  
                  {activeStep?.facilitation_notes && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Facilitation Notes:</h3>
                      <p>{activeStep?.facilitation_notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <WhiteboardCanvas blueprintId={`step-${activeStepIndex}`} />
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-lg border">
              <h3 className="text-xl font-bold">No Blueprint Activities</h3>
              <p className="text-muted-foreground mt-2">
                Generate a blueprint first to access activity-specific whiteboards.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
