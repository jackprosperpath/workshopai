
import React from "react";
import { Card } from "@/components/ui/card";
import DraftSection from "./DraftSection";
import { DraftFeedbackDiscussion } from "./DraftFeedbackDiscussion";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function DraftMainContent({
  currentDraft,
  editingDraft,
  editingSection,
  editingSessions,
  setEditableContent,
  editableContent,
  editTextareaRef,
  onEditStart,
  onEditCancel,
  onEditSave,
  onContentChange,
  isSaving,
  isUserEditingSection,
  getEditingUserForSection,
  highlightChanges,
  activeComment,
  setActiveComment,
  comments,
  addComment,
  improveSection,
  updateDraftSection,
  handleSubmitPromptFeedback,
  onRePrompt,
  loading,
  sectionPrompts = {},
}: any) {
  return (
    <Card className="p-6 m-4 bg-card rounded-xl shadow-sm">
      {currentDraft?.output.map((para: string, idx: number) => (
        <DraftSection
          key={`section-${idx}`}
          idx={idx}
          para={para}
          currentDraftId={currentDraft.id}
          editable={editingDraft && editingSection === idx}
          editingSection={editingSection}
          editingSessions={editingSessions}
          setEditableContent={setEditableContent}
          editableContent={editableContent}
          editTextareaRef={editTextareaRef}
          onEditStart={onEditStart}
          onEditCancel={onEditCancel}
          onEditSave={onEditSave}
          onContentChange={onContentChange}
          isSaving={isSaving}
          isUserEditingSection={isUserEditingSection}
          getEditingUserForSection={getEditingUserForSection}
          highlightChanges={highlightChanges}
          activeComment={activeComment}
          setActiveComment={setActiveComment}
          comments={comments}
          addComment={addComment}
          improveSection={improveSection}
          updateDraftSection={updateDraftSection}
        />
      ))}
      <DraftFeedbackDiscussion
        sectionPrompts={sectionPrompts || {}}
        handleSubmitPromptFeedback={handleSubmitPromptFeedback}
      />
      <div className="flex gap-2 mt-4">
        <Button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={onRePrompt}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Generating…" : "Re‑prompt"}
        </Button>
      </div>
    </Card>
  );
}
