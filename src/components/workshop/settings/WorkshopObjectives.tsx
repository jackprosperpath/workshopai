
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ItemList } from "../ItemList";
import { TemplateSelector } from "./TemplateSelector";
import type { WorkshopTemplate } from "@/types/WorkshopTemplates";

interface WorkshopObjectivesProps {
  problem: string;
  setProblem: (value: string) => void;
  metrics: string[];
  metricInput: string;
  setMetricInput: (value: string) => void;
  addMetric: () => void;
}

export function WorkshopObjectives({
  problem,
  setProblem,
  metrics,
  metricInput,
  setMetricInput,
  addMetric,
}: WorkshopObjectivesProps) {
  const handleTemplateSelect = (template: WorkshopTemplate) => {
    setProblem(template.purpose);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Workshop Templates</Label>
        <TemplateSelector onSelectTemplate={handleTemplateSelect} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="problem" className="text-base font-medium">What do you need to achieve?</Label>
        <Textarea
          id="problem"
          placeholder="E.g., Align the team on Q3 OKRs, Conduct a product launch retrospective..."
          className="min-h-[100px] text-base"
          value={problem}
          onChange={e => setProblem(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">Be specific about the outcome you want from this workshop.</p>
      </div>

      <ItemList
        label="Success Metrics (Optional)"
        tooltipText="How will you know if this workshop was successful?"
        items={metrics}
        inputValue={metricInput}
        setInputValue={setMetricInput}
        onAdd={addMetric}
        placeholder="Add success metric..."
      />

      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <span className="text-primary">💡</span> 
          Workshop Tip
        </h4>
        <p className="text-sm text-muted-foreground">
          Clear objectives lead to better outcomes. Try to frame your workshop goal as a specific problem to solve or decision to make.
        </p>
      </div>
    </div>
  );
}
