
import React from "react";
import { Button } from "@/components/ui/button";
import type { Stakeholder } from "@/hooks/useStakeholders";

type StakeholderSupportProps = {
  stakeholders: Stakeholder[];
  newRole: string;
  setNewRole: (role: string) => void;
  addStakeholder: () => void;
  updateStakeholder: (id: number, updates: Partial<Omit<Stakeholder, "id">>) => void;
};

export function StakeholderSupport({
  stakeholders,
  newRole,
  setNewRole,
  addStakeholder,
  updateStakeholder,
}: StakeholderSupportProps) {
  return (
    <section className="border rounded p-4">
      <h2 className="font-semibold mb-2">Stakeholder Support</h2>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Add role"
          className="border flex-1 p-2"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        />
        <Button onClick={addStakeholder} variant="outline">
          Add
        </Button>
      </div>

      {stakeholders.map((st) => (
        <div key={st.id} className="flex items-start gap-2 border-b py-2">
          <span className="flex-1">{st.role}</span>
          <select
            value={st.status}
            onChange={(e) =>
              updateStakeholder(st.id, {
                status: e.target.value as Stakeholder["status"]
              })
            }
            className="border px-1 text-xs"
          >
            <option value="pending">–</option>
            <option value="yes">👍</option>
            <option value="no">👎</option>
          </select>
          <input
            className="border flex-1 text-xs p-1"
            placeholder="Comment"
            value={st.comment || ""}
            onChange={(e) =>
              updateStakeholder(st.id, { comment: e.target.value })
            }
          />
        </div>
      ))}
    </section>
  );
}
