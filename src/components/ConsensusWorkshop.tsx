
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraftWorkspace } from "@/components/workshop/DraftWorkspace";
import { StakeholderSupport } from "@/components/workshop/StakeholderSupport";
import { WorkshopActions } from "@/components/workshop/WorkshopActions";
import { DraftLimitWrapper } from "@/components/workshop/DraftLimitWrapper";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { useDraftWorkspace } from "@/hooks/useDraftWorkspace";
import { useStakeholders } from "@/hooks/useStakeholders";
import { useWorkshopActions } from "@/hooks/useWorkshopActions";
import { LivePresenceLayer } from "./workshop/LivePresenceLayer";
import { BlueprintGenerator } from "./workshop/BlueprintGenerator";

export default function ConsensusWorkshop() {
  const [activeTab, setActiveTab] = useState("blueprint");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  
  const {
    problem,
    metrics,
    constraints,
    selectedFormat,
    selectedModel,
  } = usePromptCanvas();
  
  const {
    currentDraft,
    versions,
    currentIdx,
    setCurrentIdx,
    activeThread,
    setActiveThread,
    addFeedback,
    generateDraft,
    updateDraftSection,
  } = useDraftWorkspace();
  
  const {
    stakeholders,
    newRole,
    setNewRole,
    newEmail,
    setNewEmail,
    workshopId: stakeholderWorkshopId,
    addStakeholder,
    updateStakeholder,
    removeStakeholder
  } = useStakeholders();

  const { handleSaveWorkshop } = useWorkshopActions();

  const workspaceRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['blueprint', 'canvas', 'endorse'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  const handleGenerateSolution = async () => {
    setLoading(true);
    try {
      await generateDraft(
        problem, 
        metrics, 
        constraints, 
        selectedFormat,
        selectedModel
      );
      handleTabChange("canvas");
    } catch (error) {
      console.error("Error generating solution:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full space-y-4 relative">
      {workshopId && (
        <LivePresenceLayer workshopId={workshopId} workspaceRef={workspaceRef} />
      )}

      <div className="flex-1">
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="blueprint">Workshop Design</TabsTrigger>
            <TabsTrigger value="canvas">Solution Canvas</TabsTrigger>
            <TabsTrigger value="endorse">Endorsement</TabsTrigger>
          </TabsList>
          <TabsContent value="blueprint">
            <BlueprintGenerator />
          </TabsContent>
          <TabsContent value="canvas" className="overflow-hidden">
            <DraftLimitWrapper>
              <div className="relative min-h-[500px]" ref={workspaceRef}>
                <DraftWorkspace 
                  currentDraft={currentDraft}
                  versions={versions}
                  currentIdx={currentIdx}
                  setCurrentIdx={setCurrentIdx}
                  activeThread={activeThread}
                  setActiveThread={setActiveThread}
                  addFeedback={addFeedback}
                  onRePrompt={handleGenerateSolution}
                  loading={loading}
                  workshopId={workshopId}
                  updateDraftSection={updateDraftSection}
                />
              </div>
            </DraftLimitWrapper>
          </TabsContent>
          <TabsContent value="endorse">
            <StakeholderSupport 
              stakeholders={stakeholders}
              newRole={newRole}
              setNewRole={setNewRole}
              newEmail={newEmail}
              setNewEmail={setNewEmail}
              workshopId={stakeholderWorkshopId}
              addStakeholder={addStakeholder}
              updateStakeholder={updateStakeholder}
              removeStakeholder={removeStakeholder}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
