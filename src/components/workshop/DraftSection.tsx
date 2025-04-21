
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { SectionFeedback } from "@/hooks/useDraftWorkspace";

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
  return (
    <div className="mb-6 relative">
      {editingSection === idx ? (
        <div className="space-y-2">
          <Textarea
            ref={editTextareaRef}
            value={editableContent}
            onChange={onContentChange}
            className="min-h-[120px] w-full"
          />
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
            <p 
              className={`${editingSection !== idx ? "cursor-pointer hover:bg-slate-50" : ""}`}
              onClick={() => editingSection === null && onEditStart(idx, para)}
            >
              {editingSessions[idx] ? editingSessions[idx] : highlightChanges(para, idx)}
            </p>
          </div>
          <div className="flex items-center mt-2 gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-2 rounded-full"
              onClick={() => setActiveThread(activeThread === idx ? null : idx)}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              {activeThread === idx ? "Hide" : "Comment"}
            </Button>
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
