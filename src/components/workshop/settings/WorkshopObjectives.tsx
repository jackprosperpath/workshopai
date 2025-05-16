
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ItemList } from "../ItemList";
// import { TemplateSelector } from "./TemplateSelector";
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// import { ChevronDown } from "lucide-react";
// import type { WorkshopTemplate } from "@/types/WorkshopTemplates";

interface WorkshopObjectivesProps {
  problem: string;
  setProblem: (value: string) => void;
  metrics: string[];
  metricInput: string;
  setMetricInput: (value: string) => void;
  addMetric: () => void;
  removeMetric: (index: number) => void; // This prop is already here
}

export function WorkshopObjectives({
  problem,
  setProblem,
  metrics,
  metricInput,
  setMetricInput,
  addMetric,
  removeMetric, // This prop is already here
}: WorkshopObjectivesProps) {
  // const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  // const handleTemplateSelect = (template: WorkshopTemplate) => {
  //   setProblem(template.purpose);
  //   setIsTemplatesOpen(false);
  // };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="problem" className="text-base font-medium">Workshop Objective</Label>
        <Textarea
          id="problem"
          placeholder="What do you need to achieve in this workshop?"
          className="min-h-[100px] text-base"
          value={problem}
          onChange={e => setProblem(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">Be specific about what you want to achieve.</p>
      </div>

      <ItemList
        label="Success Metrics (Optional)"
        tooltipText="How will you know if this workshop was successful?"
        items={metrics}
        inputValue={metricInput}
        setInputValue={setMetricInput}
        onAdd={addMetric}
        onRemove={removeMetric} // Pass removeMetric as onRemove
        placeholder="Add success metric..."
      />

      {/* Commenting out the template selector section */}
    </div>
  );
}

