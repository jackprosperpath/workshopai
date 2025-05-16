
import { useState, useEffect, useCallback } from 'react';
import type { Attendee } from '@/components/workshop/types/workshop';

interface UseWorkshopFormStateProps {
  initialName?: string;
  initialProblem?: string;
  initialDuration?: number;
  initialAttendees?: Attendee[];
  initialMetrics?: string[];
  onWorkshopNameChange?: (name: string) => void;
}

export function useWorkshopFormState({
  initialName = "",
  initialProblem = "",
  initialDuration = 60,
  initialAttendees = [],
  initialMetrics = [],
  onWorkshopNameChange,
}: UseWorkshopFormStateProps) {
  const [workshopName, setWorkshopNameState] = useState(initialName);
  const [problem, setProblem] = useState(initialProblem);
  const [metrics, setMetricsState] = useState<string[]>(initialMetrics);
  const [metricInput, setMetricInput] = useState("");
  const [duration, setDuration] = useState(initialDuration);
  const [workshopType, setWorkshopType] = useState<'online' | 'in-person'>('online');
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);

  useEffect(() => {
    setWorkshopNameState(initialName);
  }, [initialName]);

  useEffect(() => {
    setProblem(initialProblem);
  }, [initialProblem]);

  useEffect(() => {
    setDuration(initialDuration);
  }, [initialDuration]);

  useEffect(() => {
    setAttendees(initialAttendees);
  }, [initialAttendees]);

  useEffect(() => {
    setMetricsState(initialMetrics);
  }, [initialMetrics]);

  const setWorkshopName = useCallback((name: string) => {
    setWorkshopNameState(name);
    if (onWorkshopNameChange) {
      onWorkshopNameChange(name);
    }
  }, [onWorkshopNameChange]);
  
  const addMetric = () => {
    if (metricInput.trim()) {
      setMetricsState(prevMetrics => [...prevMetrics, metricInput.trim()]);
      setMetricInput("");
    }
  };

  const removeMetric = (index: number) => {
    setMetricsState(prevMetrics => {
      const updatedMetrics = [...prevMetrics];
      updatedMetrics.splice(index, 1);
      return updatedMetrics;
    });
  };

  // Function to set all form states at once, useful for initialization
  const setFormStates = useCallback((data: {
    name?: string;
    problem?: string;
    metrics?: string[];
    duration?: number;
    workshopType?: 'online' | 'in-person';
    attendees?: Attendee[];
  }) => {
    if (data.name !== undefined) setWorkshopName(data.name); // uses the wrapped setter
    if (data.problem !== undefined) setProblem(data.problem);
    if (data.metrics !== undefined) setMetricsState(data.metrics);
    if (data.duration !== undefined) setDuration(data.duration);
    if (data.workshopType !== undefined) setWorkshopType(data.workshopType);
    if (data.attendees !== undefined) setAttendees(data.attendees);
  }, [setWorkshopName]);


  return {
    workshopName, setWorkshopName,
    problem, setProblem,
    metrics, setMetrics: setMetricsState, // expose direct setter for loader
    metricInput, setMetricInput,
    duration, setDuration,
    workshopType, setWorkshopType,
    attendees, setAttendees,
    addMetric, removeMetric,
    setFormStates, // Expose this for the loader hook
  };
}
