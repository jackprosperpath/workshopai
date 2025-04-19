
import { useState } from "react";

export type Stakeholder = {
  id: number;
  role: string;
  status: "pending" | "yes" | "no";
  comment?: string;
};

export function useStakeholders() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [newRole, setNewRole] = useState("");

  const addStakeholder = () => {
    if (newRole.trim()) {
      setStakeholders((s) => [
        ...s,
        {
          id: Date.now(),
          role: newRole.trim(),
          status: "pending"
        }
      ]);
      setNewRole("");
    }
  };

  const updateStakeholder = (
    id: number,
    updates: Partial<Omit<Stakeholder, "id">>
  ) => {
    setStakeholders((s) =>
      s.map((st) => (st.id === id ? { ...st, ...updates } : st))
    );
  };

  return {
    stakeholders,
    newRole,
    setNewRole,
    addStakeholder,
    updateStakeholder,
  };
}
