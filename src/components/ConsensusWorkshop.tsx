
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraftWorkspace } from "@/components/workshop/DraftWorkspace";
import { PromptCanvas } from "@/components/workshop/PromptCanvas";
import { StakeholderSupport } from "@/components/workshop/StakeholderSupport";
import { TeamManagement } from "@/components/workshop/TeamManagement";
import { WorkshopSharing } from "@/components/workshop/WorkshopSharing";
import { WorkshopActions } from "@/components/workshop/WorkshopActions";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { useDraftWorkspace } from "@/hooks/useDraftWorkspace";
import { useStakeholders } from "@/hooks/useStakeholders";
import { useWorkshopActions } from "@/hooks/useWorkshopActions";

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

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['draft', 'prompt', 'stakeholders', 'team', 'share'].includes(hash)) {
      setActiveTab(hash === 'stakeholders' ? 'endorsement' : hash);
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
      handleTabChange("draft");
    } catch (error) {
      console.error("Error generating solution:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <WorkshopActions />
      
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="prompt">Context</TabsTrigger>
          <TabsTrigger value="draft">Solution Canvas</TabsTrigger>
          <TabsTrigger value="endorsement">Endorsement</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
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
          />
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
        <TabsContent value="share">
          <WorkshopSharing 
            workshopData={{
              problem,
              metrics,
              constraints,
              selectedModel
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
