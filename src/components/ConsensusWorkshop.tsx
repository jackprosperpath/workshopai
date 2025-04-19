import React, { useEffect } from "react";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { useDraftWorkspace } from "@/hooks/useDraftWorkspace";
import { useStakeholders } from "@/hooks/useStakeholders";
import { usePromptCanvasSync } from "@/hooks/usePromptCanvasSync";
import { PromptCanvas } from "@/components/workshop/PromptCanvas";
import { DraftWorkspace } from "@/components/workshop/DraftWorkspace";
import { StakeholderSupport } from "@/components/workshop/StakeholderSupport";
import { WorkshopSharing } from "@/components/workshop/WorkshopSharing";
import { TeamManagement } from "@/components/workshop/TeamManagement";
import { useSearchParams } from "react-router-dom";
import { WorkshopHeader } from "@/components/workshop/WorkshopHeader";

export default function ConsensusWorkshop() {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const promptCanvas = usePromptCanvas();
  const draftWorkspace = useDraftWorkspace();
  const stakeholderSupport = useStakeholders();
  
  // Setup synchronization of prompt canvas data
  const promptCanvasSync = usePromptCanvasSync(
    {
      problem: promptCanvas.problem,
      metrics: promptCanvas.metrics,
      constraints: promptCanvas.constraints,
      selectedModel: promptCanvas.selectedModel
    },
    (data) => {
      if (data.problem !== undefined) promptCanvas.setProblem(data.problem);
      if (data.metrics !== undefined) promptCanvas.setMetrics(data.metrics);
      if (data.constraints !== undefined) promptCanvas.setConstraints(data.constraints);
      if (data.selectedModel !== undefined) promptCanvas.setSelectedModel(data.selectedModel);
    }
  );

  // Sync data whenever it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      promptCanvasSync.syncData({
        problem: promptCanvas.problem,
        metrics: promptCanvas.metrics,
        constraints: promptCanvas.constraints,
        selectedModel: promptCanvas.selectedModel
      });
    }, 1000); // Debounce updates to reduce traffic
    
    return () => clearTimeout(timeoutId);
  }, [
    promptCanvas.problem,
    promptCanvas.metrics,
    promptCanvas.constraints,
    promptCanvas.selectedModel
  ]);

  const handleGenerate = () => {
    draftWorkspace.generateDraft(
      promptCanvas.problem,
      promptCanvas.metrics,
      promptCanvas.constraints,
      undefined,
      promptCanvas.selectedModel
    );
  };

  const handleRePrompt = () => {
    draftWorkspace.generateDraft(
      promptCanvas.problem,
      promptCanvas.metrics,
      promptCanvas.constraints,
      "Re‑prompt with feedback",
      promptCanvas.selectedModel
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <WorkshopHeader workshopId={workshopId} />
      
      {/* New Team Management section */}
      <TeamManagement />
      
      <PromptCanvas
        {...promptCanvas}
        onGenerate={handleGenerate}
        loading={draftWorkspace.loading}
      />

      <DraftWorkspace
        currentDraft={draftWorkspace.currentDraft}
        versions={draftWorkspace.versions}
        currentIdx={draftWorkspace.currentIdx}
        setCurrentIdx={draftWorkspace.setCurrentIdx}
        activeThread={draftWorkspace.activeThread}
        setActiveThread={draftWorkspace.setActiveThread}
        addFeedback={draftWorkspace.addFeedback}
        onRePrompt={handleRePrompt}
        loading={draftWorkspace.loading}
      />

      <StakeholderSupport {...stakeholderSupport} />
    </div>
  );
}
