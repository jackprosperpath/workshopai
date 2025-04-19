import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraftWorkspace } from "@/components/workshop/DraftWorkspace";
import { PromptCanvas } from "@/components/workshop/PromptCanvas";
import { StakeholderSupport } from "@/components/workshop/StakeholderSupport";
import { TeamManagement } from "@/components/workshop/TeamManagement";
import { WorkshopSharing } from "@/components/workshop/WorkshopSharing";
import { usePromptCanvas, AiModel } from "@/hooks/usePromptCanvas";
import { useDraftWorkspace } from "@/hooks/useDraftWorkspace";
import { useStakeholders } from "@/hooks/useStakeholders";

export default function ConsensusWorkshop() {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState("draft");
  const [loading, setLoading] = useState(false);
  
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
    generateDraft
  } = useDraftWorkspace();
  
  const {
    stakeholders,
    newRole,
    setNewRole,
    addStakeholder,
    updateStakeholder
  } = useStakeholders();

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['draft', 'prompt', 'stakeholders', 'team', 'share'].includes(hash)) {
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
      await generateDraft(problem, metrics, constraints, selectedModel);
    } catch (error) {
      console.error("Error generating solution:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="prompt">Topic</TabsTrigger>
          <TabsTrigger value="draft">Solution Canvas</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
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
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
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
          />
        </TabsContent>
        <TabsContent value="stakeholders">
          <StakeholderSupport 
            stakeholders={stakeholders}
            newRole={newRole}
            setNewRole={setNewRole}
            addStakeholder={addStakeholder}
            updateStakeholder={updateStakeholder}
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
