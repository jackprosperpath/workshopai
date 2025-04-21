
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSharedWorkshop } from "@/hooks/useSharedWorkshop";
import type { Stakeholder } from "@/hooks/useStakeholders";
import { StakeholderCard } from "./stakeholder/StakeholderCard";
import { ApprovalProgressBar } from "../workshop/ApprovalProgressBar";
import { toast } from "@/components/ui/sonner";

type StakeholderSupportProps = {
  stakeholders: Stakeholder[];
  newRole: string;
  setNewRole: (role: string) => void;
  newEmail?: string;
  setNewEmail?: (email: string) => void;
  workshopId?: string | null;
  addStakeholder: () => void;
  updateStakeholder: (id: number, updates: Partial<Omit<Stakeholder, "id">>) => void;
  removeStakeholder?: (id: number) => void;
};

export function StakeholderSupport({
  stakeholders,
  newRole,
  setNewRole,
  newEmail = "",
  setNewEmail = () => {},
  workshopId = null,
  addStakeholder,
  updateStakeholder,
  removeStakeholder = () => {},
}: StakeholderSupportProps) {
  // Removed the useSharedWorkshop hook and related states as they're not needed anymore.

  // Gamified Approval Progress Bar
  const totalStakeholders = stakeholders.length;
  const approved = stakeholders.filter((s) => s.status === "yes").length;

  const handleAddStakeholder = () => {
    if (!newRole.trim()) {
      toast.error("Please enter a stakeholder role");
      return;
    }
    addStakeholder();
  };

  return (
    <section className="space-y-6">
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Stakeholder Endorsement</h2>
        <ApprovalProgressBar approved={approved} total={totalStakeholders} />
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Stakeholder role or title"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Email address (optional)"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1"
              type="email"
            />
            <Button 
              onClick={handleAddStakeholder} 
              variant="outline"
            >
              Add
            </Button>
          </div>
          <div className="mt-4">
            {stakeholders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No stakeholders added yet. Add stakeholders above to get their endorsements.
              </div>
            ) : (
              <div className="space-y-4">
                {stakeholders.map((stakeholder) => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onUpdate={(updates) => updateStakeholder(stakeholder.id, updates)}
                    onRemove={() => removeStakeholder(stakeholder.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

