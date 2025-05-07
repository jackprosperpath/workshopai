
import { BlueprintTabs } from "./BlueprintTabs";
import { WorkshopSetupForm } from "./WorkshopSetupForm";
import { GeneratedBlueprint } from "./GeneratedBlueprint";
import { EmptyBlueprintState } from "./EmptyBlueprintState";
import type { Blueprint } from "../types/workshop";

interface BlueprintContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
  duration: number;
  setDuration: (value: number) => void;
  workshopType: 'online' | 'in-person';
  setWorkshopType: (type: 'online' | 'in-person') => void;
  loading: boolean;
  onGenerate: () => void;
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
  duration,
  setDuration,
  workshopType,
  setWorkshopType,
  loading,
  onGenerate
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
            duration={duration}
            setDuration={setDuration}
            workshopType={workshopType}
            setWorkshopType={setWorkshopType}
            loading={loading}
            onGenerate={onGenerate}
          />
        </div>

        <div className={activeTab === "blueprint" ? "block" : "hidden"}>
          {blueprint ? (
            <GeneratedBlueprint blueprint={blueprint} />
          ) : (
            <EmptyBlueprintState onNavigateToSettings={() => setActiveTab("settings")} />
          )}
        </div>
      </div>
    </div>
  );
}
