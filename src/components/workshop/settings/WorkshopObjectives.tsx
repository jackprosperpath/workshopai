
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ItemList } from "../ItemList";
import { TemplateSelector } from "./TemplateSelector";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type { WorkshopTemplate } from "@/types/WorkshopTemplates";
import { useState } from "react";

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
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(true);

  const handleTemplateSelect = (template: WorkshopTemplate) => {
    setProblem(template.purpose);
    setIsTemplatesOpen(false);
  };

  return (
    <div className="space-y-6">
      <Collapsible 
        open={isTemplatesOpen} 
        onOpenChange={setIsTemplatesOpen}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Workshop Templates</Label>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className={`h-4 w-4 transform transition-transform ${isTemplatesOpen ? '' : '-rotate-90'}`} />
              <span className="sr-only">Toggle templates</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <TemplateSelector onSelectTemplate={handleTemplateSelect} />
        </CollapsibleContent>
      </Collapsible>

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
