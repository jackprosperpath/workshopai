import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Info, ChevronUp, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { PredefinedFormat } from "@/types/OutputFormat";
import { FormatSelector } from "./FormatSelector";
import { ItemList } from "./ItemList";
import { DocumentUpload } from "./DocumentUpload";

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
  selectedFormat: { type: PredefinedFormat; customFormat?: string; description: string };
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
  const [documents, setDocuments] = React.useState<{ name: string; path: string; size: number; }[]>([]);

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
            
            <FormatSelector
              selectedFormat={selectedFormat}
              updateFormat={updateFormat}
              customFormat={customFormat}
              setCustomFormat={setCustomFormat}
            />
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
            <Label>Context Documents</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="text-sm text-muted-foreground block">
                  Upload documents to provide additional context for the solution generation
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                Supported formats: PDF, DOC, DOCX, TXT
              </TooltipContent>
            </Tooltip>
            <DocumentUpload onDocumentsUpdate={setDocuments} />
          </div>

          <ItemList
            label="Success Metrics"
            tooltipText="Define how success will be measured"
            items={metrics}
            inputValue={metricInput}
            setInputValue={setMetricInput}
            onAdd={addMetric}
            placeholder="Add success metric..."
          />

          <ItemList
            label="Constraints"
            tooltipText="List any limitations or requirements"
            items={constraints}
            inputValue={constraintInput}
            setInputValue={setConstraintInput}
            onAdd={addConstraint}
            placeholder="Add constraint..."
          />

          <Button
            onClick={() => onGenerate()}
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
