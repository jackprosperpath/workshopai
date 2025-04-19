
import React from "react";
import type { DraftVersion } from "@/hooks/useDraftWorkspace";

type DraftWorkspaceProps = {
  currentDraft: DraftVersion | null;
  versions: DraftVersion[];
  currentIdx: number | null;
  setCurrentIdx: (idx: number) => void;
  activeThread: number | null;
  setActiveThread: (idx: number | null) => void;
  addFeedback: (sectionIdx: number, text: string) => void;
  onRePrompt: () => void;
  loading: boolean;
};

export function DraftWorkspace({
  currentDraft,
  versions,
  currentIdx,
  setCurrentIdx,
  activeThread,
  setActiveThread,
  addFeedback,
  onRePrompt,
  loading,
}: DraftWorkspaceProps) {
  if (!currentDraft) return null;

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
    <section className="border rounded p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Draft v{currentDraft.id}</h2>
        <select
          value={currentDraft.id}
          onChange={(e) =>
            setCurrentIdx(versions.findIndex((v) => v.id === +e.target.value))
          }
        >
          {versions.map((v) => (
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
            onClick={() => setActiveThread(activeThread === idx ? null : idx)}
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
        onClick={onRePrompt}
        disabled={loading}
      >
        {loading ? "Generating…" : "Re‑prompt"}
      </button>
    </section>
  );
}
