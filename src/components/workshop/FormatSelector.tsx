
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PredefinedFormat, OutputFormat } from "@/types/OutputFormat";
import { OUTPUT_FORMATS } from "@/types/OutputFormat";

type FormatSelectorProps = {
  selectedFormat: OutputFormat;
  updateFormat: (format: PredefinedFormat) => void;
  customFormat: string;
  setCustomFormat: (value: string) => void;
};

export function FormatSelector({
  selectedFormat,
  updateFormat,
  customFormat,
  setCustomFormat,
}: FormatSelectorProps) {
  const [showCustomFormat, setShowCustomFormat] = React.useState(selectedFormat.type === 'other');

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(OUTPUT_FORMATS).map(([key, format]) => (
          <button
            key={key}
            onClick={() => {
              updateFormat(key as PredefinedFormat);
              setShowCustomFormat(false);
            }}
            className={`p-4 rounded-lg border text-left transition-all hover:border-primary/50 h-full ${
              selectedFormat && selectedFormat.type === key
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
          className={`p-4 rounded-lg border text-left transition-all hover:border-primary/50 h-full ${
            selectedFormat && selectedFormat.type === 'other'
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
  );
}

function getFormatDescription(format: PredefinedFormat): string {
  switch (format) {
    case 'detailed-report':
      return 'Comprehensive document with findings and recommendations';
    case 'prd':
      return 'Technical specifications and requirements';
    case 'project-proposal':
      return 'Structured project plan and implementation details';
    case 'strategic-plan':
      return 'Strategic roadmap and execution plan';
    case 'business-case':
      return 'Comprehensive analysis of business opportunity';
    default:
      return '';
  }
}
