
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SectionImproveActions from "./SectionImproveActions";
import { Loader2, MessageSquare } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Comment } from "./CommentsPanel";
import { format } from "date-fns";

type User = {
  id: string;
  name: string;
  section: number | null;
  content?: string;
};

type DraftSectionProps = {
  idx: number;
  para: string;
  currentDraftId: number;
  editable: boolean;
  editingSection: number | null;
  editingSessions: { [key: string]: string };
  setEditableContent: (v: string) => void;
  editableContent: string;
  editTextareaRef: React.RefObject<HTMLTextAreaElement>;
  onEditStart: (idx: number, content: string) => void;
  onEditCancel: () => void;
  onEditSave: (idx: number) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isSaving: boolean;
  isUserEditingSection: (sectionIdx: number) => boolean;
  getEditingUserForSection: (sectionIdx: number) => User | undefined;
  highlightChanges: (text: string, idx: number) => React.ReactNode;
  activeComment: string | null;
  setActiveComment: (id: string | null) => void;
  comments: Comment[];
  addComment: (sectionIdx: number, text: string, startOffset: number, endOffset: number, selectedText: string) => void;
  improveSection?: (
    type: "redraft" | "add_detail" | "simplify",
    idx: number,
    para: string
  ) => Promise<{ newText?: string; reasoning?: string }>;
  updateDraftSection?: (sectionIdx: number, content: string) => Promise<boolean>;
};

export default function DraftSection({
  idx,
  para,
  currentDraftId,
  editable,
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
}: DraftSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [improving, setImproving] = useState<null | "redraft" | "add_detail" | "simplify">(null);
  const [improveResult, setImproveResult] = useState<{ newText: string, reasoning?: string } | null>(null);
  const [applyingChanges, setApplyingChanges] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ start: number, end: number } | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const contentRef = React.useRef(editableContent);

  React.useEffect(() => {
    contentRef.current = editableContent;
  }, [editableContent]);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: editableContent,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setEditableContent(newContent);
    },
    editable: !!editable,
    editorProps: {
      attributes: {
        class: editable ? 'min-h-[120px] focus:outline-none' : 'hidden'
      }
    }
  });

  React.useEffect(() => {
    if (editor && editable) {
      if (editor.getHTML() !== contentRef.current) {
        editor.commands.setContent(contentRef.current);
      }
      editor.setEditable(true);
      editor.commands.focus('end');
    } else if (editor) {
      editor.setEditable(false);
    }
  }, [editable, editor]);

  // Handle text selection
  useEffect(() => {
    if (editingSection === idx) return; // Don't track selection when editing

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !sectionRef.current) {
        setSelectedText("");
        setSelectionRange(null);
        return;
      }
      
      const range = selection.getRangeAt(0);
      const sectionNode = sectionRef.current;
      
      // Only process selection if it's within this section
      if (!sectionNode.contains(range.commonAncestorContainer)) {
        setSelectedText("");
        setSelectionRange(null);
        return;
      }
      
      const selectedContent = range.toString().trim();
      if (selectedContent) {
        // Get the offsets relative to the section
        const sectionContent = sectionNode.textContent || "";
        const startOffset = findTextPosition(sectionNode, range.startContainer, range.startOffset);
        const endOffset = findTextPosition(sectionNode, range.endContainer, range.endOffset);
        
        setSelectedText(selectedContent);
        setSelectionRange({ start: startOffset, end: endOffset });
      } else {
        setSelectedText("");
        setSelectionRange(null);
      }
    };
    
    // Helper function to find position within the text content
    const findTextPosition = (
      rootNode: Node, 
      targetNode: Node, 
      targetOffset: number
    ): number => {
      let position = 0;
      
      function traverse(node: Node) {
        if (node === targetNode) {
          position += targetOffset;
          return true;
        }
        
        if (node.nodeType === Node.TEXT_NODE) {
          position += node.textContent?.length || 0;
        } else {
          for (let i = 0; i < node.childNodes.length; i++) {
            if (traverse(node.childNodes[i])) {
              return true;
            }
          }
        }
        return false;
      }
      
      traverse(rootNode);
      return position;
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [idx, editingSection]);

  // Focus the comment input when it appears
  useEffect(() => {
    if (showCommentInput && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [showCommentInput]);

  const handleAddComment = () => {
    if (selectionRange && commentText.trim()) {
      addComment(idx, commentText.trim(), selectionRange.start, selectionRange.end, selectedText);
      setCommentText("");
      setShowCommentInput(false);
      setSelectedText("");
      setSelectionRange(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleImprove = async (type: "redraft" | "add_detail" | "simplify") => {
    if (!improveSection) return;
    setImproving(type);
    setImproveResult(null);
    try {
      const { newText, reasoning } = await improveSection(type, idx, para);
      if (newText) {
        setImproveResult({ newText, reasoning });
      }
    } catch (e) {
      setImproving(null);
      setImproveResult(null);
    } finally {
      setImproving(null);
    }
  };

  const handleApplyChanges = async () => {
    if (!improveResult || !updateDraftSection) return;
    
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

  // Filter comments for this section
  const sectionComments = comments.filter(comment => comment.selection.sectionIndex === idx);

  // Highlight text with comments
  const renderContentWithCommentHighlights = () => {
    if (sectionComments.length === 0 || editingSection === idx) {
      return highlightChanges(para, idx);
    }

    let content = para;
    const parts: React.ReactNode[] = [];
    
    // Sort comments by their position to handle overlapping highlights
    const sortedComments = [...sectionComments].sort((a, b) => a.selection.startOffset - b.selection.startOffset);
    
    let lastIndex = 0;
    
    sortedComments.forEach((comment, i) => {
      const { startOffset, endOffset } = comment.selection;
      
      // Add text before the highlighted part
      if (startOffset > lastIndex) {
        parts.push(content.substring(lastIndex, startOffset));
      }
      
      // Add the highlighted part
      const highlightedText = content.substring(startOffset, endOffset);
      const isActive = activeComment === comment.id;
      
      parts.push(
        <span 
          key={`highlight-${comment.id}`}
          className={`relative cursor-pointer ${isActive ? 'bg-yellow-200' : 'bg-yellow-100'}`}
          onClick={() => setActiveComment(comment.id)}
        >
          {highlightedText}
        </span>
      );
      
      lastIndex = endOffset;
    });
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    
    return parts;
  };

  return (
    <div
      className="mb-6 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {editingSection === idx ? (
        <div className="space-y-2">
          <div className="border rounded min-h-[120px] bg-white py-2 px-3">
            <div className="mb-2 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={editor?.isActive('bold') ? "!bg-slate-200" : ""}
                type="button"
                aria-label="Bold"
              >
                <span className="font-bold">B</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={editor?.isActive('italic') ? "!bg-slate-200" : ""}
                type="button"
                aria-label="Italic"
              >
                <span className="italic">I</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={editor?.isActive('underline') ? "!bg-slate-200" : ""}
                type="button"
                aria-label="Underline"
              >
                <span className="underline">U</span>
              </Button>
            </div>
            <EditorContent editor={editor} />
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEditCancel}
            >
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
        </div>
      ) : (
        <>
          <div
            ref={sectionRef}
            className={`p-2 rounded relative transition ${
              isUserEditingSection(idx) && editingSection !== idx 
                ? "bg-yellow-50 border border-yellow-200" 
                : ""
            } group/section`}
            onClick={() => {
              if (editingSection === null && !selectedText) {
                onEditStart(idx, para);
              }
            }}
          >
            {renderContentWithCommentHighlights()}
          </div>
          
          {selectedText && selectionRange && (
            <div className="absolute right-0 mt-1 z-10">
              {showCommentInput ? (
                <div className="bg-white shadow-lg rounded-lg border p-2 w-64">
                  <textarea
                    ref={commentInputRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full border rounded-md p-2 text-sm mb-2 min-h-[80px]"
                    placeholder="Add your comment..."
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowCommentInput(false);
                      } else if (e.key === 'Enter' && e.ctrlKey) {
                        handleAddComment();
                      }
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowCommentInput(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                    >
                      Comment
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Tip: Press Ctrl+Enter to submit
                  </div>
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="rounded-full h-8 w-8 p-0"
                      onClick={() => setShowCommentInput(true)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="sr-only">Add Comment</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add comment</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
          
          {isHovered && !editingSection && !showCommentInput && (
            <SectionImproveActions
              disabled={!!improving}
              onRedraft={() => handleImprove("redraft")}
              onAddDetail={() => handleImprove("add_detail")}
              onSimplify={() => handleImprove("simplify")}
            />
          )}
          
          {improving && (
            <div className="absolute left-0 top-0 right-0 flex flex-col z-20 pointer-events-none">
              <div className="flex items-center gap-2 bg-[#1A1F2C] p-3 rounded-md text-xs text-white shadow border border-slate-700 mb-2 select-none pointer-events-auto">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Improving section with AI ({improving.replace("_", " ")}&hellip;)</span>
              </div>
            </div>
          )}
          
          {improveResult && (
            <div className="bg-slate-50 border border-slate-200 p-2 rounded mt-2 text-xs">
              <div className="mb-2 font-medium">AI Suggestion:</div>
              <div
                className="mb-1 text-gray-900"
                dangerouslySetInnerHTML={{ __html: improveResult.newText }}
              />
              {improveResult.reasoning && (
                <div className="text-gray-500 mt-1">
                  <em>Reasoning: {improveResult.reasoning}</em>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDiscardChanges}
                >
                  Discard
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleApplyChanges}
                  disabled={applyingChanges}
                >
                  {applyingChanges ? "Applying..." : "Apply Changes"}
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex items-center mt-2 gap-2">
            {sectionComments.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1 h-7 px-2">
                <MessageSquare className="h-3 w-3" />
                {sectionComments.length}
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-2 rounded-full"
              onClick={() => editingSection === null && onEditStart(idx, para)}
            >
              Edit
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
