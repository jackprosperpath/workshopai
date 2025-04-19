import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type SectionFeedback = {
  text: string;
  threadId: number;
};

type DraftVersion = {
  id: number;
  output: string[];
  reasoning: string;
  sectionFeedback: Record<number, SectionFeedback[]>;
};

type Stakeholder = {
  id: number;
  role: string;
  status: "pending" | "yes" | "no";
  comment?: string;
};

const models = ["stub"]; // placeholder – no real API integration

export default function ConsensusWorkshop() {
  /* Prompt canvas state */
  const [problem, setProblem] = useState("");
  const [metrics, setMetrics] = useState<string[]>([]);
  const [metricInput, setMetricInput] = useState("");

  const [constraints, setConstraints] = useState<string[]>([]);
  const [constraintInput, setConstraintInput] = useState("");

  /* Draft workspace */
  const [versions, setVersions] = useState<DraftVersion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  /* Inline feedback */
  const [activeThread, setActiveThread] = useState<number | null>(null);
  const threadCounter = useRef(1);

  /* Stakeholders */
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [newRole, setNewRole] = useState("");

  /* Helpers */
  const currentDraft = currentIdx !== null ? versions[currentIdx] : null;

  const addMetric = () => {
    if (metricInput.trim()) {
      setMetrics((m) => [...m, metricInput.trim()]);
      setMetricInput("");
    }
  };

  const addConstraint = () => {
    if (constraintInput.trim()) {
      setConstraints((c) => [...c, constraintInput.trim()]);
      setConstraintInput("");
    }
  };

  const generateDraft = async (feedback: string | null = null) => {
    if (!problem.trim()) {
      toast.error("Please provide a problem statement");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('workshop-ai', {
        body: {
          problem,
          metrics,
          constraints,
          feedback
        }
      });

      if (error) throw error;

      const next: DraftVersion = {
        id: versions.length + 1,
        output: data.output,
        reasoning: data.reasoning || feedback || "Initial generation",
        sectionFeedback: {}
      };

      setVersions((prev) => [...prev, next]);
      setCurrentIdx(versions.length);
      toast.success("New draft generated");
    } catch (error) {
      console.error('Error generating draft:', error);
      toast.error("Failed to generate draft");
    } finally {
      setLoading(false);
    }
  };

  const addFeedback = (sectionIdx: number, text: string) => {
    if (!currentDraft) return;
    const id = threadCounter.current++;
    const feedback: SectionFeedback = { text, threadId: id };

    setVersions((prev) =>
      prev.map((v) =>
        v.id === currentDraft.id
          ? {
              ...v,
              sectionFeedback: {
                ...v.sectionFeedback,
                [sectionIdx]: [
                  ...(v.sectionFeedback[sectionIdx] || []),
                  feedback
                ]
              }
            }
          : v
      )
    );
  };

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

  const highlightChanges = (text: string, idx: number) => {
    if (currentIdx === null || currentIdx === 0) return text;
    const prev = versions[currentIdx - 1];
    return prev.output[idx] !== text ? (
      <span className="bg-yellow-200">{text}</span>
    ) : (
      text
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Prompt Canvas */}
      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">Prompt Canvas</h2>
        <Textarea
          placeholder="Problem statement..."
          className="border w-full p-2 mb-2"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
        />
        <div className="flex gap-2 mb-2">
          <input
            placeholder="Add metric"
            className="border flex-1 p-2"
            value={metricInput}
            onChange={(e) => setMetricInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMetric()}
          />
          <Button onClick={addMetric} variant="outline">
            Add
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap mb-2">
          {metrics.map((m) => (
            <span key={m} className="bg-gray-200 px-2 rounded">
              {m}
            </span>
          ))}
        </div>
        <div className="flex gap-2 mb-2">
          <input
            placeholder="Add constraint"
            className="border flex-1 p-2"
            value={constraintInput}
            onChange={(e) => setConstraintInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addConstraint()}
          />
          <Button onClick={addConstraint} variant="outline">
            Add
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {constraints.map((c) => (
            <span key={c} className="bg-gray-200 px-2 rounded">
              {c}
            </span>
          ))}
        </div>
        <Button
          onClick={() => generateDraft()}
          disabled={loading}
          className="mt-4 bg-primary text-white"
        >
          {loading ? "Generating…" : "Run"}
        </Button>
      </section>

      {/* Draft Workspace */}
      {currentDraft && (
        <section className="border rounded p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">
              Draft v{currentDraft.id}
            </h2>
            <select
              value={currentDraft.id}
              onChange={(e) =>
                setCurrentIdx(
                  versions.findIndex((v) => v.id === +e.target.value)
                )
              }
            >
              {versions.map((v, i) => (
                <option key={v.id} value={v.id}>
                  v{v.id}
                </option>
              ))}
            </select>
          </div>

          {currentDraft.output.map((para, idx) => (
            <div key={idx} className="mb-6">
              <p>{highlightChanges(para, idx)}</p>

              <button
                className="text-xs text-blue-600 mt-1"
                onClick={() =>
                  setActiveThread(
                    activeThread === idx ? null : idx
                  )
                }
              >
                {activeThread === idx ? "Hide" : "Add"} comment
              </button>

              {activeThread === idx && (
                <div className="mt-2">
                  <textarea
                    className="border w-full p-2 mb-2 text-xs"
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

              {(currentDraft.sectionFeedback[idx] || []).map((fb) => (
                <div
                  key={fb.threadId}
                  className="text-xs bg-gray-100 p-2 rounded mb-1"
                >
                  {fb.text}
                </div>
              ))}
            </div>
          ))}

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => generateDraft("Re‑prompt with feedback")}
            disabled={loading}
          >
            {loading ? "Generating…" : "Re‑prompt"}
          </button>
        </section>
      )}

      {/* Stakeholder Support */}
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
          <div
            key={st.id}
            className="flex items-start gap-2 border-b py-2"
          >
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
    </div>
  );
}
