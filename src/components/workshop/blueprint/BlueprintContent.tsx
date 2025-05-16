
import { BlueprintTabs } from "./BlueprintTabs";
import { WorkshopSetupForm } from "./WorkshopSetupForm";
import { GeneratedBlueprint } from "./GeneratedBlueprint";
import { EmptyBlueprintState } from "./EmptyBlueprintState";
import type { Blueprint, Attendee } from "../types/workshop";

interface BlueprintContentProps {
  activeTab: "settings" | "blueprint"; // Changed from string
  setActiveTab: (tab: "settings" | "blueprint") => void; // Changed from (tab: string) => void
  blueprint: Blueprint | null;
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
  removeMetric: (index: number) => void;
  duration: number;
  setDuration: (value: number) => void;
  workshopType: 'online' | 'in-person';
  setWorkshopType: (type: 'online' | 'in-person') => void;
  loading: boolean;
  onGenerate: () => void;
  attendees?: Attendee[];
  updateAttendees?: (attendees: Attendee[]) => void;
  onBlueprintUpdate?: (updatedBlueprint: Blueprint) => Promise<void>;
}

export function BlueprintContent({
  activeTab,
  setActiveTab,
  blueprint,
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
  removeMetric,
  duration,
  setDuration,
  workshopType,
  setWorkshopType,
  loading,
  onGenerate,
  attendees = [],
  updateAttendees,
  onBlueprintUpdate
}: BlueprintContentProps) {
  return (
    <div className="w-full mb-6">
      <BlueprintTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        blueprint={blueprint}
      />
      
      <div className="mt-6">
        <div className={activeTab === "settings" ? "block" : "hidden"}>
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
            onGenerate={onGenerate}
            attendees={attendees}
            updateAttendees={updateAttendees}
          />
        </div>

        <div className={activeTab === "blueprint" ? "block" : "hidden"}>
          {blueprint ? (
            <GeneratedBlueprint 
              blueprint={blueprint}
              onBlueprintUpdate={onBlueprintUpdate}
            />
          ) : (
            <EmptyBlueprintState onNavigateToSettings={() => setActiveTab("settings")} />
          )}
        </div>
      </div>
    </div>
  );
}
