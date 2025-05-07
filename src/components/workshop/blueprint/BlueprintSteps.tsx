
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkshopObjectives } from "../settings/WorkshopObjectives";
import { WorkshopPeopleTime } from "../settings/WorkshopPeopleTime";
import { WorkshopContext } from "../settings/WorkshopContext";
import { toast } from "@/components/ui/sonner";

interface BlueprintStepsProps {
  currentStep: number;
  problem: string;
  setProblem: (value: string) => void;
  metrics: string[];
  metricInput: string;
  setMetricInput: (value: string) => void;
  addMetric: () => void;
  duration: number;
  setDuration: (value: number) => void;
  workshopType: 'online' | 'in-person';
  setWorkshopType: (type: 'online' | 'in-person') => void;
  constraints: string[];
  constraintInput: string;
  setConstraintInput: (value: string) => void;
  addConstraint: () => void;
  loading: boolean;
  onGenerate: () => void;
  nextStep: () => void;
  prevStep: () => void;
  workshopId: string | null; // Add the missing required prop
}

export function BlueprintSteps({
  currentStep,
  problem,
  setProblem,
  metrics,
  metricInput,
  setMetricInput,
  addMetric,
  duration,
  setDuration,
  workshopType,
  setWorkshopType,
  constraints,
  constraintInput,
  setConstraintInput,
  addConstraint,
  loading,
  onGenerate,
  nextStep,
  prevStep,
  workshopId, // Pass it to the components that need it
}: BlueprintStepsProps) {
  return (
    <>
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
          workshopId={workshopId}
        />
      )}
      
      {currentStep === 3 && (
        <WorkshopContext
          constraints={constraints}
          constraintInput={constraintInput}
          setConstraintInput={setConstraintInput}
          addConstraint={addConstraint}
          loading={loading}
          onGenerate={onGenerate}
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
            onClick={onGenerate} 
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
    </>
  );
}
