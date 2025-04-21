
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import SectionImproveActions from "./SectionImproveActions";
import { SectionAIActions } from "./SectionAIActions";
import { InlineCommentInput } from "./InlineCommentInput";
import { DraftSectionContent } from "./DraftSectionContent";
import { Comment } from "./CommentsPanel";

interface DraftSectionProps {
  idx: number;
  para: string;
  currentDraftId: number;
  editable: boolean;
  editingSection: number | null;
  editingSessions: { [key: string]: string };
  editableContent: string;
  setEditableContent: (content: string) => void;
  editTextareaRef: React.RefObject<HTMLTextAreaElement>;
  onEditStart: (idx: number, content: string) => void;
  onEditCancel: () => void;
  onEditSave: (idx: number) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isSaving: boolean;
  isUserEditingSection: (sectionIdx: number) => boolean;
  getEditingUserForSection: (sectionIdx: number) => any;
  highlightChanges: (text: string, idx: number) => React.ReactNode;
  activeComment: string | null;
  setActiveComment: (id: string | null) => void;
  comments: Comment[];
  addComment: (sectionIdx: number, text: string, startOffset: number, endOffset: number, selectedText: string) => void;
  improveSection: (type: "redraft" | "add_detail" | "simplify", idx: number, para: string) => Promise<{ newText?: string; reasoning?: string }>;
  updateDraftSection: (sectionIdx: number, content: string) => Promise<boolean>;
}

const DraftSection: React.FC<DraftSectionProps> = ({
  idx,
  para,
  currentDraftId,
  editable,
  editingSection,
  editingSessions,
  editableContent,
  setEditableContent,
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
  updateDraftSection
}) => {
  const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [improving, setImproving] = useState<null | "redraft" | "add_detail" | "simplify">(null);
  const [improveResult, setImproveResult] = useState<{ newText: string; reasoning?: string } | null>(null);
  const [applyingChanges, setApplyingChanges] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const handleSectionClick = () => {
    if (editingSection === null) {
      onEditStart(idx, para);
    }
  };

  const handleTextSelection = () => {
    if (editable) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === "") {
      setSelection(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const sectionNode = sectionRef.current;

    if (sectionNode && sectionNode.contains(range.commonAncestorContainer)) {
      // Get text content of the section
      const sectionText = sectionNode.textContent || "";

      // Calculate offsets
      let startOffset = 0;
      let endOffset = 0;

      // This is a simplified approach - in a real app you'd need more sophisticated
      // handling for HTML content with nested elements
      try {
        startOffset = range.startOffset;
        endOffset = range.endOffset;

        // Adjust for parent node positioning if needed
        if (range.startContainer !== sectionNode) {
          // This is a simplification - real implementation would be more complex
          // to handle nested DOM elements
          const nodeContent = range.startContainer.textContent || "";
          const nodeIndex = sectionText.indexOf(nodeContent);
          if (nodeIndex >= 0) {
            startOffset += nodeIndex;
            endOffset += nodeIndex;
          }
        }

        setSelection({
          start: startOffset,
          end: endOffset,
          text: selection.toString().trim()
        });
      } catch (e) {
        console.error("Error calculating selection position:", e);
      }
    }
  };

  const handleAddComment = () => {
    if (selection && selection.text) {
      setShowCommentInput(true);
      setTimeout(() => {
        if (commentInputRef.current) {
          commentInputRef.current.focus();
        }
      }, 0);
    }
  };

  const handleSaveComment = () => {
    if (selection && commentText.trim()) {
      addComment(
        idx,
        commentText.trim(),
        selection.start,
        selection.end,
        selection.text
      );
      setCommentText("");
      setShowCommentInput(false);
      setSelection(null);
    }
  };

  const handleCancelComment = () => {
    setCommentText("");
    setShowCommentInput(false);
  };

  const handleImproveSection = async (type: "redraft" | "add_detail" | "simplify") => {
    setImproving(type);
    setImproveResult(null);
    
    try {
      const result = await improveSection(type, idx, para);
      
      if (result.newText) {
        setImproveResult({
          newText: result.newText,
          reasoning: result.reasoning
        });
      }
    } catch (error) {
      console.error(`Error ${type} section:`, error);
    } finally {
      setImproving(null);
    }
  };

  const handleApplyChanges = async () => {
    if (!improveResult) return;
    
    setApplyingChanges(true);
    try {
      const success = await updateDraftSection(idx, improveResult.newText);
      if (success) {
        setImproveResult(null);
      }
    } catch (error) {
      console.error("Error applying changes:", error);
    } finally {
      setApplyingChanges(false);
    }
  };

  const handleDiscardChanges = () => {
    setImproveResult(null);
  };

  const showHoverActions = !editable && editingSection === null && !isUserEditingSection(idx);
  
  return (
    <div 
      className="relative group mb-4"
      onMouseUp={handleTextSelection}
    >
      {editable ? (
        <div className="border rounded p-2">
          <textarea
            ref={editTextareaRef}
            value={editableContent}
            onChange={onContentChange}
            className="w-full min-h-[100px] p-2 rounded focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onEditCancel();
              if (e.key === 'Enter' && e.ctrlKey) onEditSave(idx);
            }}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={onEditCancel}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={() => onEditSave(idx)}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Press Ctrl+Enter to save, Esc to cancel
          </div>
        </div>
      ) : (
        <div className="border rounded p-2 hover:border-primary transition-colors">
          {showHoverActions && (
            <SectionImproveActions 
              onRedraft={() => handleImproveSection("redraft")}
              onAddDetail={() => handleImproveSection("add_detail")}
              onSimplify={() => handleImproveSection("simplify")}
              disabled={!!improving || !!improveResult}
            />
          )}
          
          <SectionAIActions
            improveResult={improveResult}
            improving={improving}
            onDiscard={handleDiscardChanges}
            onApply={handleApplyChanges}
            applyingChanges={applyingChanges}
          />

          <DraftSectionContent
            para={para}
            idx={idx}
            editingSection={editingSection}
            isUserEditingSection={isUserEditingSection}
            highlightChanges={highlightChanges}
            comments={comments}
            activeComment={activeComment}
            setActiveComment={setActiveComment}
            sectionRef={sectionRef}
            onEditStart={onEditStart}
          />
          
          {selection && selection.text && !showCommentInput && (
            <div className="absolute top-0 right-0 p-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white shadow-md border"
                onClick={handleAddComment}
              >
                Add Comment
              </Button>
            </div>
          )}
          
          {showCommentInput && (
            <div className="absolute top-0 right-0 mt-2 mr-2 z-10">
              <InlineCommentInput
                commentText={commentText}
                onCommentTextChange={setCommentText}
                onCancel={handleCancelComment}
                onAdd={handleSaveComment}
                commentInputRef={commentInputRef}
                disabled={!commentText.trim()}
              />
            </div>
          )}
          
          {isUserEditingSection(idx) && editingSection !== idx && (
            <div className="absolute inset-0 bg-yellow-50/50 pointer-events-none flex items-center justify-center">
              <div className="bg-white p-2 rounded shadow border border-yellow-200 text-sm">
                <span className="font-medium">
                  {getEditingUserForSection(idx)?.name || "Someone"}
                </span>{" "}
                is editing this section
              </div>
            </div>
          )}
          
          {editingSessions[idx] && editingSection !== idx && (
            <div className="border-t mt-2 pt-2 text-sm text-muted-foreground">
              <div className="font-medium text-xs">Unsaved changes by {getEditingUserForSection(idx)?.name}:</div>
              <div className="mt-1 text-xs bg-muted/30 p-1 rounded">{editingSessions[idx]}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DraftSection;
