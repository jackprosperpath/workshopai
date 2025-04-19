import { useState } from "react";
import type { OutputFormat, PredefinedFormat } from "@/types/OutputFormat";

export function usePromptCanvas() {
  const [problem, setProblem] = useState("");
  const [metrics, setMetrics] = useState<string[]>([]);
  const [metricInput, setMetricInput] = useState("");
  const [constraints, setConstraints] = useState<string[]>([]);
  const [constraintInput, setConstraintInput] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>(OUTPUT_FORMATS.report);
  const [customFormat, setCustomFormat] = useState("");

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

  const updateFormat = (formatType: PredefinedFormat) => {
    if (formatType === 'other') {
      setSelectedFormat({
        type: 'other',
        customFormat: customFormat || 'Custom format',
        description: 'User-defined format'
      });
    } else {
      setSelectedFormat(OUTPUT_FORMATS[formatType]);
      setCustomFormat("");
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
    selectedFormat,
    updateFormat,
    customFormat,
    setCustomFormat,
    addMetric,
    addConstraint,
  };
}
