
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkshopTitle } from "./WorkshopTitle";
import { WorkshopPeopleTime } from "./WorkshopPeopleTime";
import { WorkshopObjectives } from "./WorkshopObjectives";
import { WorkshopContext } from "./WorkshopContext";

interface SimplifiedWorkshopFormProps {
  workshopId: string | null;
  workshopName: string;
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
  setWorkshopName: (name: string) => void;
  loading: boolean;
  onGenerate: () => void;
}

export function SimplifiedWorkshopForm({
  workshopId,
  workshopName,
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
  setWorkshopName,
  loading,
  onGenerate
}: SimplifiedWorkshopFormProps) {
  // These states are used in this component only
  const [constraints, setConstraints] = useState<string[]>([]);
  const [constraintInput, setConstraintInput] = useState("");

  const addConstraint = () => {
    if (constraintInput.trim()) {
      setConstraints((c) => [...c, constraintInput.trim()]);
      setConstraintInput("");
    }
  };

  return (
    <div className="space-y-6">
      <WorkshopTitle 
        workshopName={workshopName}
        setWorkshopName={setWorkshopName}
      />

      <WorkshopPeopleTime
        duration={duration}
        setDuration={setDuration}
        workshopType={workshopType}
        setWorkshopType={setWorkshopType}
        workshopId={workshopId}
      />

      <WorkshopObjectives
        problem={problem}
        setProblem={setProblem}
        metrics={metrics}
        metricInput={metricInput}
        setMetricInput={setMetricInput}
        addMetric={addMetric}
      />

      <WorkshopContext
        constraints={constraints}
        constraintInput={constraintInput}
        setConstraintInput={setConstraintInput}
        addConstraint={addConstraint}
        loading={loading}
        onGenerate={onGenerate}
      />
    </div>
  );
}
