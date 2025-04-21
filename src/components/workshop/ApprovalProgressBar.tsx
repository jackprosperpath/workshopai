
import React from "react";
import { Progress } from "@/components/ui/progress";
import { CircleCheck } from "lucide-react";

type ApprovalProgressBarProps = {
  total: number;
  approved: number;
};

export function ApprovalProgressBar({ total, approved }: ApprovalProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((approved / total) * 100);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-purple-700">
          {approved}/{total} approvals – {approved === total ? "Hero Mode: Ship it!" : "Be the hero to ship!"}
        </span>
        {approved === total && <CircleCheck className="text-green-600 h-5 w-5 ml-1" />}
      </div>
      <Progress
        value={percent}
        className="h-3 bg-purple-100 [&>div]:bg-[#8B5CF6] rounded-full"
      />
    </div>
  );
}
