
import React from "react";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { useDraftWorkspace } from "@/hooks/useDraftWorkspace";
import { useStakeholders } from "@/hooks/useStakeholders";
import { PromptCanvas } from "@/components/workshop/PromptCanvas";
import { DraftWorkspace } from "@/components/workshop/DraftWorkspace";
import { StakeholderSupport } from "@/components/workshop/StakeholderSupport";

export default function ConsensusWorkshop() {
  const promptCanvas = usePromptCanvas();
  const draftWorkspace = useDraftWorkspace();
  const stakeholderSupport = useStakeholders();

  const handleGenerate = () => {
    draftWorkspace.generateDraft(
      promptCanvas.problem,
      promptCanvas.metrics,
      promptCanvas.constraints
    );
  };

  const handleRePrompt = () => {
    draftWorkspace.generateDraft(
      promptCanvas.problem,
      promptCanvas.metrics,
      promptCanvas.constraints,
      "Re‑prompt with feedback"
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
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
