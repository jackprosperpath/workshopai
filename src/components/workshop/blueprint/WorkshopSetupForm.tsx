
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SimplifiedWorkshopForm } from "../settings/SimplifiedWorkshopForm";
import { ErrorMessage } from "./ErrorMessage";

interface WorkshopSetupFormProps {
  errorMessage: string | null;
  workshopId: string | null;
  workshopName: string;
  setWorkshopName: (name: string) => void;
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
  loading: boolean;
  onGenerate: () => void;
}

export function WorkshopSetupForm({
  errorMessage,
  workshopId,
  workshopName,
  setWorkshopName,
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
  loading,
  onGenerate
}: WorkshopSetupFormProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Workshop Design</h3>
      </CardHeader>
      <CardContent>
        <ErrorMessage errorMessage={errorMessage} />
        <SimplifiedWorkshopForm 
          workshopId={workshopId}
          workshopName={workshopName}
          setWorkshopName={setWorkshopName}
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
          loading={loading}
          onGenerate={onGenerate}
        />
      </CardContent>
    </Card>
  );
}
