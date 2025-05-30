
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DiffEditor } from "@monaco-editor/react";

interface DiffViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oldContent: string[];
  newContent: string[];
  versionNumbers: { old: number; new: number };
}

export function DiffViewer({ 
  open, 
  onOpenChange, 
  oldContent, 
  newContent, 
  versionNumbers 
}: DiffViewerProps) {
  const combinedOldContent = oldContent.join('\n\n');
  const combinedNewContent = newContent.join('\n\n');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Compare Changes</DialogTitle>
          <DialogDescription>
            Comparing Version {versionNumbers.old} with Version {versionNumbers.new}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden rounded border h-[calc(100%-4rem)]">
          <DiffEditor
            height="100%"
            language="markdown"
            originalModelPath="file://original.md"
            modifiedModelPath="file://modified.md"
            original={combinedOldContent}
            modified={combinedNewContent}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              renderSideBySide: true
            }}
            theme="vs-light"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
