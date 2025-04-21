
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
  currentDraftId: number;
  onSelect: (idx: number) => void;
  onCompare?: (oldIdx: number, newIdx: number) => void;
}

export default function DraftVersionSelector({
  versions,
  currentDraftId,
  onSelect,
  onCompare,
}: DraftVersionSelectorProps) {
  if (versions.length === 0) return null;
  
  const currentIdx = versions.findIndex((v) => v.id === currentDraftId);
  
  return (
    <div className="flex items-center gap-2">
      {versions.length > 1 && onCompare && currentIdx > 0 && (
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
            v{currentDraftId}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {versions.map((v, idx) => (
            <DropdownMenuItem key={v.id} onClick={() => onSelect(idx)}>
              {v.id === currentDraftId ? (
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
