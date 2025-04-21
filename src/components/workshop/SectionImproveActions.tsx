
import React from "react";
import { Button } from "@/components/ui/button";
import { WandSparkles, Edit, Type } from "lucide-react";

type SectionImproveActionsProps = {
  disabled?: boolean;
  onRedraft: () => void;
  onAddDetail: () => void;
  onSimplify: () => void;
};

const actionClass =
  "flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm text-xs hover:bg-slate-50 transition";

export function SectionImproveActions({
  disabled,
  onRedraft,
  onAddDetail,
  onSimplify,
}: SectionImproveActionsProps) {
  return (
    <div className="flex gap-2 absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Button
        variant="ghost"
        className={actionClass}
        size="sm"
        disabled={disabled}
        onClick={onRedraft}
        title="Re-draft (improves clarity and flow)"
      >
        <WandSparkles className="w-4 h-4" />
        Re-draft
      </Button>
      <Button
        variant="ghost"
        className={actionClass}
        size="sm"
        disabled={disabled}
        onClick={onAddDetail}
        title="Add Detail (expands section with more specifics/examples)"
      >
        <Edit className="w-4 h-4" />
        Add Detail
      </Button>
      <Button
        variant="ghost"
        className={actionClass}
        size="sm"
        disabled={disabled}
        onClick={onSimplify}
        title="Simplify (makes section shorter/easier)"
      >
        <Type className="w-4 h-4" />
        Simplify
      </Button>
    </div>
  );
}
export default SectionImproveActions;
