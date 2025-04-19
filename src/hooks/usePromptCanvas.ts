
import { useState } from "react";

export type AiModel = "gpt-4o-mini" | "gpt-4o";

export function usePromptCanvas() {
  const [problem, setProblem] = useState("");
  const [metrics, setMetrics] = useState<string[]>([]);
  const [metricInput, setMetricInput] = useState("");
  const [constraints, setConstraints] = useState<string[]>([]);
  const [constraintInput, setConstraintInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<AiModel>("gpt-4o-mini");

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

  return {
    problem,
    setProblem,
    metrics,
    setMetrics,
    metricInput,
    setMetricInput,
    constraints,
    setConstraints,
    constraintInput,
    setConstraintInput,
    selectedModel,
    setSelectedModel,
    addMetric,
    addConstraint,
  };
}
