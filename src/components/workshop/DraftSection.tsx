import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { SectionFeedback } from "@/hooks/useDraftWorkspace";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge as FeedbackBadge } from "@/components/ui/badge";

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
  addFeedback: (idx: number, text: string) => void;
  activeThread: number | null;
  setActiveThread: (section: number | null) => void;
  sectionFeedback: SectionFeedback[];
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
  sectionFeedback
}: DraftSectionProps) {
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

  return (
    <div className="mb-6 relative">
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
            className={`p-2 rounded ${
              isUserEditingSection(idx) && editingSection !== idx 
                ? "bg-yellow-50 border border-yellow-200" 
                : ""
            }`}
          >
            {isUserEditingSection(idx) && editingSection !== idx && (
              <Badge variant="outline" className="mb-1">
                {getEditingUserForSection(idx)?.name} is editing...
              </Badge>
            )}
            <div
              className={`${editingSection !== idx ? "cursor-pointer hover:bg-slate-50" : ""}`}
              onClick={() => editingSection === null && onEditStart(idx, para)}
              dangerouslySetInnerHTML={{
                __html: editingSessions[idx]
                  ? editingSessions[idx]
                  : highlightChanges(para, idx) as string
              }}
            />
          </div>
          <div className="flex items-center mt-2 gap-2">
            <TooltipProvider>
              <Tooltip disableHoverableContent={!(sectionFeedback.length > 0 && activeThread !== idx)}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7 px-2 rounded-full relative"
                    onClick={() => setActiveThread(activeThread === idx ? null : idx)}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    {activeThread === idx ? "Hide" : "Comment"}
                    {sectionFeedback.length > 0 && activeThread !== idx && (
                      <FeedbackBadge
                        variant="default"
                        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 text-[10px] h-4 px-1"
                      >
                        {sectionFeedback.length}
                      </FeedbackBadge>
                    )}
                  </Button>
                </TooltipTrigger>
                {sectionFeedback.length > 0 && activeThread !== idx && (
                  <TooltipContent side="top" className="max-w-xs">
                    <span className="block text-xs">
                      {firstFeedbackLine}
                      {sectionFeedback.length > 1 && (
                        <span className="text-muted-foreground ml-2">+{sectionFeedback.length - 1} more</span>
                      )}
                    </span>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
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
