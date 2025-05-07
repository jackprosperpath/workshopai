
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
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  const handleTemplateSelect = (template: WorkshopTemplate) => {
    setProblem(template.purpose);
    setIsTemplatesOpen(false);
  };

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
        placeholder="Add success metric..."
      />

      <Collapsible 
        open={isTemplatesOpen} 
        onOpenChange={setIsTemplatesOpen}
        className="border rounded-md mt-4 overflow-hidden"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-accent/20 transition-colors">
          <span className="font-medium">Or Choose from Workshop Templates</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isTemplatesOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 border-t bg-muted/10">
          <TemplateSelector onSelectTemplate={handleTemplateSelect} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
