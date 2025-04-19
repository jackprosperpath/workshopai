import React, { useState, useEffect, useRef } from "react";

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

  /* Stubbed draft generator */
  const generateDraft = async (feedback: string | null = null) => {
    setLoading(true);

    /* Simulate latency */
    await new Promise((res) => setTimeout(res, 1500));

    const fakeParagraphs = [
      "This is section 1 of the draft solution...",
      "This is section 2 explaining the key approach...",
      "This is section 3 covering next steps..."
    ];

    const next: DraftVersion = {
      id: versions.length + 1,
      output: fakeParagraphs,
      reasoning: feedback ?? "Initial generation",
      sectionFeedback: {}
    };

    setVersions((prev) => [...prev, next]);
    setCurrentIdx(versions.length); // point to new version
    setLoading(false);
  };

  /* Feedback handlers */
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

  /* Stakeholder handlers */
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

  /* Diff helper */
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
        <textarea
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
          />
          <button onClick={addMetric} className="border px-3">
            +
          </button>
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
          />
          <button onClick={addConstraint} className="border px-3">
            +
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {constraints.map((c) => (
            <span key={c} className="bg-gray-200 px-2 rounded">
              {c}
            </span>
          ))}
        </div>
        <button
          onClick={() => generateDraft()}
          disabled={loading}
          className="mt-4 bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Generating…" : "Run"}
        </button>
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

              {/* Existing feedback */}
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
          <button onClick={addStakeholder} className="border px-3">
            +
          </button>
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
