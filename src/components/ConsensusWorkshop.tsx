import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraftWorkspace } from "@/components/workshop/DraftWorkspace";
import { StakeholderSupport } from "@/components/workshop/StakeholderSupport";
import { TeamManagement } from "@/components/workshop/TeamManagement";
import { WorkshopActions } from "@/components/workshop/WorkshopActions";
import { DraftLimitWrapper } from "@/components/workshop/DraftLimitWrapper";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { useDraftWorkspace } from "@/hooks/useDraftWorkspace";
import { useStakeholders } from "@/hooks/useStakeholders";
import { useWorkshopActions } from "@/hooks/useWorkshopActions";
import { LivePresenceLayer } from "./workshop/LivePresenceLayer";
import { BlueprintGenerator } from "./workshop/BlueprintGenerator";

export default function ConsensusWorkshop() {
  const [activeTab, setActiveTab] = useState("draft");
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
    if (hash && ['draft', 'blueprint', 'stakeholders', 'team'].includes(hash)) {
      setActiveTab(hash === 'stakeholders' ? 'endorsement' : hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value === 'endorsement' ? 'stakeholders' : value;
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
      handleTabChange("draft");
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="blueprint">Workshop Design</TabsTrigger>
            <TabsTrigger value="draft">Solution Canvas</TabsTrigger>
            <TabsTrigger value="endorsement">Endorsement</TabsTrigger>
          </TabsList>
          <TabsContent value="team">
            <TeamManagement />
          </TabsContent>
          <TabsContent value="blueprint">
            <BlueprintGenerator />
          </TabsContent>
          <TabsContent value="draft" className="overflow-hidden">
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
          <TabsContent value="endorsement">
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
