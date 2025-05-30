
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
          <h2 className="text-lg font-semibold">Blueprint Context</h2>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              Define your meeting's topic, success metrics, and any constraints to generate the blueprint.
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
            <Label>Deliverable</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="text-sm text-muted-foreground block">
                  Select the desired format for the generated blueprint
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
            <Label htmlFor="problem">Meeting Topic/Goal</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="text-sm text-muted-foreground block">
                  Clearly describe the main topic, objective, or problem this meeting aims to address.
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                Be specific and concise.
              </TooltipContent>
            </Tooltip>
            <Textarea
              id="problem"
              placeholder="E.g., Plan Q3 marketing strategy, Brainstorm new product features, Review project progress..."
              className="min-h-[100px]"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            />
          </div>

          <ItemList
            label="Success Metrics"
            tooltipText="How will you know if the meeting (and its blueprint) was successful?"
            items={metrics}
            inputValue={metricInput}
            setInputValue={setMetricInput}
            onAdd={addMetric}
            placeholder="Add success metric..."
          />

          <ItemList
            label="Constraints"
            tooltipText="List any limitations or requirements (e.g., budget, specific tools, non-negotiable attendees)."
            items={constraints}
            inputValue={constraintInput}
            setInputValue={setConstraintInput}
            onAdd={addConstraint}
            placeholder="Add constraint..."
          />

          <div className="space-y-2">
            <Label>Context Documents</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="text-sm text-muted-foreground block">
                  Upload documents to provide additional context for the blueprint generation
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                Supported formats: PDF, DOC, DOCX, TXT
              </TooltipContent>
            </Tooltip>
            <DocumentUpload onDocumentsUpdate={setDocuments} />
          </div>

          <Button
            onClick={() => onGenerate()}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Blueprint"}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

