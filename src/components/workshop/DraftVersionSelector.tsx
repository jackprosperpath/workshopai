
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, GitCompare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DraftVersion } from "@/hooks/useDraftWorkspace";

interface DraftVersionSelectorProps {
  versions: DraftVersion[];
  currentIdx: number | null;
  setCurrentIdx: (idx: number) => void;
  onCompare?: (oldIdx: number, newIdx: number) => void;
}

export default function DraftVersionSelector({
  versions,
  currentIdx,
  setCurrentIdx,
  onCompare,
}: DraftVersionSelectorProps) {
  if (versions.length === 0) return null;
  
  const currentDraftId = currentIdx !== null && versions[currentIdx] ? versions[currentIdx].id : null;
  
  return (
    <div className="flex items-center gap-2">
      {versions.length > 1 && onCompare && currentIdx !== null && currentIdx > 0 && (
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 text-xs"
          onClick={() => onCompare(currentIdx - 1, currentIdx)}
        >
          <GitCompare className="h-3 w-3" />
          Compare with Previous
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            {currentDraftId ? `v${currentDraftId}` : 'Select Version'}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {versions.map((v, idx) => (
            <DropdownMenuItem key={v.id} onClick={() => setCurrentIdx(idx)}>
              {currentIdx === idx ? (
                <strong>v{v.id} (Current)</strong>
              ) : (
                `v${v.id}`
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
