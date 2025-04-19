import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AiModel } from "@/hooks/usePromptCanvas";

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
  selectedModel: AiModel;
  setSelectedModel: (value: AiModel) => void;
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
  selectedModel,
  setSelectedModel,
  onGenerate,
  loading,
}: PromptCanvasProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="border rounded-lg bg-card shadow-sm transition-all duration-200"
    >
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Prompt Canvas</h2>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              Define your problem, success metrics, and constraints to generate solutions
            </TooltipContent>
          </Tooltip>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <Label>AI Model</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="text-sm text-muted-foreground block">
                  Select which AI model to use for generation
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>GPT-4o-mini is faster but less powerful</p>
                <p>GPT-4o is more powerful but slower</p>
              </TooltipContent>
            </Tooltip>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">GPT-4o-mini (Fast)</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o (Powerful)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem">Problem Statement</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="text-sm text-muted-foreground block">
                  Clearly describe the challenge or issue that needs to be addressed
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                Be specific and concise in describing your problem
              </TooltipContent>
            </Tooltip>
            <Textarea
              id="problem"
              placeholder="Describe the problem you want to solve..."
              className="min-h-[100px]"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Success Metrics</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="text-sm text-muted-foreground block">
                  Define how success will be measured
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                Add quantifiable metrics to measure success
              </TooltipContent>
            </Tooltip>
            <div className="flex gap-2">
              <Input
                placeholder="Add success metric..."
                value={metricInput}
                onChange={(e) => setMetricInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMetric()}
              />
              <Button onClick={addMetric} variant="outline">Add</Button>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {metrics.map((m) => (
                <Badge key={m} variant="secondary" className="text-sm">
                  {m}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Constraints</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="text-sm text-muted-foreground block">
                  List any limitations or requirements
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                Add any technical, business, or resource constraints
              </TooltipContent>
            </Tooltip>
            <div className="flex gap-2">
              <Input
                placeholder="Add constraint..."
                value={constraintInput}
                onChange={(e) => setConstraintInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addConstraint()}
              />
              <Button onClick={addConstraint} variant="outline">Add</Button>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {constraints.map((c) => (
                <Badge key={c} variant="secondary" className="text-sm">
                  {c}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            onClick={onGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Solution"}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
