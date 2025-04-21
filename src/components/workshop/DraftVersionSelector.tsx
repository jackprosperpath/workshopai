
import React from "react";
import type { DraftVersion } from "@/hooks/useDraftWorkspace";

interface DraftVersionSelectorProps {
  versions: DraftVersion[];
  currentDraftId: number;
  onSelect: (idx: number) => void;
}

export default function DraftVersionSelector({
  versions,
  currentDraftId,
  onSelect,
}: DraftVersionSelectorProps) {
  if (versions.length === 0) return null;
  return (
    <select
      value={currentDraftId}
      onChange={e =>
        onSelect(versions.findIndex((v) => v.id === +e.target.value))
      }
      className="text-sm border rounded p-1"
    >
      {versions.map((v) => (
        <option key={v.id} value={v.id}>
          v{v.id}
        </option>
      ))}
    </select>
  );
}
