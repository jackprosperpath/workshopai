import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SectionFeedbackButton from "./SectionFeedbackButton";
import SectionImproveActions from "./SectionImproveActions";

type User = {
  id: string;
  name: string;
  section: number | null;
  content?: string;
};

type SectionFeedback = {
  text: string;
  threadId: number;
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
  addFeedback: (idx: number, text: string) => void;
  activeThread: number | null;
  setActiveThread: (section: number | null) => void;
  sectionFeedback: SectionFeedback[];
  improveSection?: (
    type: "redraft" | "add_detail" | "simplify",
    idx: number,
    para: string
  ) => Promise<{ newText?: string; reasoning?: string }>;
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
  addFeedback,
  activeThread,
  setActiveThread,
  sectionFeedback,
  improveSection,
}: DraftSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [improving, setImproving] = useState<null | "redraft" | "add_detail" | "simplify">(null);
  const [improveResult, setImproveResult] = useState<{ newText: string, reasoning?: string } | null>(null);

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

  const firstFeedbackLine =
    sectionFeedback && sectionFeedback.length > 0
      ? sectionFeedback[0].text.split('\n')[0].slice(0, 60)
      : "";

  const handleImprove = async (type: "redraft" | "add_detail" | "simplify") => {
    if (!improveSection) return;
    setImproving(type);
    setImproveResult(null);
    try {
      const { newText, reasoning } = await improveSection(type, idx, para);
      if (newText) {
        setImproveResult({ newText, reasoning });
        setTimeout(() => {
          setImproveResult(null);
          setImproving(null);
        }, 3000);
      }
    } catch (e) {
      setImproving(null);
      setImproveResult(null);
    }
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
            className={`p-2 rounded relative transition ${
              isUserEditingSection(idx) && editingSection !== idx 
                ? "bg-yellow-50 border border-yellow-200" 
                : ""
            } group/section`}
            onClick={() => editingSection === null && onEditStart(idx, para)}
            dangerouslySetInnerHTML={{
              __html: editingSessions[idx]
                ? editingSessions[idx]
                : highlightChanges(para, idx) as string
            }}
            style={{ cursor: editingSection !== idx ? "pointer" : undefined }}
          />
          {isHovered && !editingSection && (
            <SectionImproveActions
              disabled={!!improving}
              onRedraft={() => handleImprove("redraft")}
              onAddDetail={() => handleImprove("add_detail")}
              onSimplify={() => handleImprove("simplify")}
            />
          )}
          {improving && (
            <div className="absolute left-0 top-0 right-0 flex flex-col z-20 pointer-events-none">
              <div className="bg-gradient-to-br from-slate-50/90 to-slate-100/90 p-3 rounded-md text-xs text-slate-900 shadow border border-slate-200 animate-pulse mb-2">
                Improving section with AI ({improving.replace("_", " ")}&hellip;)
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
            </div>
          )}
          <div className="flex items-center mt-2 gap-2">
            <SectionFeedbackButton
              idx={idx}
              sectionFeedback={sectionFeedback}
              activeThread={activeThread}
              onClick={() => setActiveThread(activeThread === idx ? null : idx)}
            />
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-2 rounded-full"
              onClick={() => editingSection === null && onEditStart(idx, para)}
            >
              Edit
            </Button>
          </div>
          {activeThread === idx && (
            <div className="mt-2">
              <textarea
                className="border w-full p-2 mb-2 text-xs rounded-md"
                placeholder="Leave feedback…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const val = (e.target as HTMLTextAreaElement).value;
                    if (val.trim()) addFeedback(idx, val.trim());
                    (e.target as HTMLTextAreaElement).value = "";
                    setActiveThread(null);
                  }
                }}
              />
            </div>
          )}
          {(sectionFeedback || []).map((fb) => (
            <div
              key={`feedback-${idx}-${fb.threadId}`}
              className="text-xs bg-gray-100 p-2 rounded mb-1 mt-1"
            >
              {fb.text}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
