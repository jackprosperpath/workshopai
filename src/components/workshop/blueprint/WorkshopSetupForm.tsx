
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SimplifiedWorkshopForm } from "../settings/SimplifiedWorkshopForm";
import { ErrorMessage } from "./ErrorMessage";
import type { Attendee } from "../types/workshop";

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
  attendees?: Attendee[];
  updateAttendees?: (attendees: Attendee[]) => void;
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
  onGenerate,
  attendees,
  updateAttendees
}: WorkshopSetupFormProps) {
  return (
    <div>
      {errorMessage && (
        <div className="mb-6">
          <ErrorMessage message={errorMessage} />
        </div>
      )}

      <Alert className="mb-6 bg-primary/5">
        <AlertDescription>
          Fill in the workshop details below to generate a workshop agenda optimized for your needs.
        </AlertDescription>
      </Alert>

      <SimplifiedWorkshopForm
        workshopId={workshopId}
        workshopName={workshopName}
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
        setWorkshopName={setWorkshopName}
        loading={loading}
        onGenerate={onGenerate}
        attendees={attendees}
        updateAttendees={updateAttendees}
      />
    </div>
  );
}
