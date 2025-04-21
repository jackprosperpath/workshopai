
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraftWorkspace } from "@/components/workshop/DraftWorkspace";
import { PromptCanvas } from "@/components/workshop/PromptCanvas";
import { StakeholderSupport } from "@/components/workshop/StakeholderSupport";
import { TeamManagement } from "@/components/workshop/TeamManagement";
import { WorkshopActions } from "@/components/workshop/WorkshopActions";
import { DraftLimitWrapper } from "@/components/workshop/DraftLimitWrapper";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { useDraftWorkspace } from "@/hooks/useDraftWorkspace";
import { useStakeholders } from "@/hooks/useStakeholders";
import { useWorkshopActions } from "@/hooks/useWorkshopActions";
import { LivePresenceLayer } from "./workshop/LivePresenceLayer";
import { useRef } from "react";
// (No more import { DiscussionPanel } ... )

export default function ConsensusWorkshop() {
  const [activeTab, setActiveTab] = useState("draft");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  
  const {
    problem,
    setProblem,
    metrics,
    setMetrics,
    metricInput,
    setMetricInput,
    constraints,
    setConstraints,
    constraintInput,
    setConstraintInput,
    selectedFormat,
    updateFormat,
    customFormat,
    setCustomFormat,
    selectedModel,
    setSelectedModel,
    addMetric,
    addConstraint,
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
    loadDrafts,
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

  // Remove useDiscussionPrompts/global section prompts here
  
  const [discussionCollapsed, setDiscussionCollapsed] = useState(false);

  useEffect(() => {
    // Remove generatePrompts
    // AI discussion handled in DraftWorkspace sidebar now
  }, [currentDraft]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['draft', 'prompt', 'stakeholders', 'team'].includes(hash)) {
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

  const navigateToTeamTab = () => {
    handleTabChange("team");
  };

  return (
    <div className="w-full space-y-4 relative flex">
      <WorkshopActions />
      {workshopId && (
        <LivePresenceLayer workshopId={workshopId} workspaceRef={workspaceRef} />
      )}

      {/* No more DiscussionPanel */}

      {/* --- Main Workshop Tabs/Content --- */}
      <div className="flex-1">
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="prompt">Context</TabsTrigger>
            <TabsTrigger value="draft">Solution Canvas</TabsTrigger>
            <TabsTrigger value="endorsement">Endorsement</TabsTrigger>
          </TabsList>
          <TabsContent value="team">
            <TeamManagement />
          </TabsContent>
          <TabsContent value="prompt">
            <PromptCanvas 
              problem={problem}
              setProblem={setProblem}
              metrics={metrics}
              metricInput={metricInput}
              setMetricInput={setMetricInput}
              addMetric={addMetric}
              constraints={constraints}
              constraintInput={constraintInput}
              setConstraintInput={setConstraintInput}
              addConstraint={addConstraint}
              selectedFormat={selectedFormat}
              updateFormat={updateFormat}
              customFormat={customFormat}
              setCustomFormat={setCustomFormat}
              onGenerate={handleGenerateSolution}
              loading={loading}
            />
          </TabsContent>
          <TabsContent value="draft">
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
                  // No need to pass sectionPrompts as prop, will load inside workspace
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
