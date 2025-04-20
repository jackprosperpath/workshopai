import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, ChevronUp, ChevronDown } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { OUTPUT_FORMATS } from "@/types/OutputFormat";
import type { PredefinedFormat } from "@/types/OutputFormat";

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
  selectedFormat: { type: PredefinedFormat; customFormat?: string };
  updateFormat: (format: PredefinedFormat) => void;
  customFormat: string;
  setCustomFormat: (value: string) => void;
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
  selectedFormat,
  updateFormat,
  customFormat,
  setCustomFormat,
  onGenerate,
  loading,
}: PromptCanvasProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [showCustomFormat, setShowCustomFormat] = React.useState(false);

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
            <Label>Output Format</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="text-sm text-muted-foreground block">
                  Select the desired format for the generated solution
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                Choose a predefined format or create your own
              </TooltipContent>
            </Tooltip>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(OUTPUT_FORMATS).map(([key, format]) => (
                <button
                  key={key}
                  onClick={() => {
                    updateFormat(key as PredefinedFormat);
                    setShowCustomFormat(false);
                  }}
                  className={`p-4 rounded-lg border text-left transition-all hover:border-primary/50 ${
                    selectedFormat.type === key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent/5"
                  }`}
                >
                  <h3 className="font-medium mb-1">{format.description}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getFormatDescription(key as PredefinedFormat)}
                  </p>
                </button>
              ))}
              
              <button
                onClick={() => {
                  updateFormat('other');
                  setShowCustomFormat(true);
                }}
                className={`p-4 rounded-lg border text-left transition-all hover:border-primary/50 ${
                  selectedFormat.type === 'other'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent/5"
                }`}
              >
                <h3 className="font-medium mb-1">Custom Format</h3>
                <p className="text-sm text-muted-foreground">
                  Define your own custom output format
                </p>
              </button>
            </div>

            {showCustomFormat && (
              <Input
                placeholder="Define your format..."
                value={customFormat}
                onChange={(e) => {
                  setCustomFormat(e.target.value);
                  updateFormat('other');
                }}
                className="mt-4"
              />
            )}
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

function getFormatDescription(format: PredefinedFormat): string {
  switch (format) {
    case 'report':
      return 'Comprehensive document with findings and recommendations';
    case 'prd':
      return 'Technical specifications and requirements';
    case 'proposal':
      return 'Structured project plan and implementation details';
    case 'analysis':
      return 'Data-driven insights and conclusions';
    case 'strategy':
      return 'Strategic roadmap and execution plan';
    default:
      return '';
  }
}
