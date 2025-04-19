
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type PromptCanvasProps = {
  problem: string;
  setProblem: (value: string) => void;
  metrics: string[];
  metricInput: string;
  setMetricInput: (value: string) => void;
  addMetric: () => void;
  constraints: string[];
  constraintInput: string;
  setConstraintInput: (value: string) => void;
  addConstraint: () => void;
  onGenerate: () => void;
  loading: boolean;
};

export function PromptCanvas({
  problem,
  setProblem,
  metrics,
  metricInput,
  setMetricInput,
  addMetric,
  constraints,
  constraintInput,
  setConstraintInput,
  addConstraint,
  onGenerate,
  loading,
}: PromptCanvasProps) {
  return (
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
        onClick={onGenerate}
        disabled={loading}
        className="mt-4 bg-primary text-white"
      >
        {loading ? "Generating…" : "Run"}
      </Button>
    </section>
  );
}
