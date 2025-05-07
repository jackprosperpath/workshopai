
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ItemList } from "../ItemList";
import { DocumentUpload } from "../DocumentUpload";
import { Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";

interface WorkshopContextProps {
  constraints: string[];
  constraintInput: string;
  setConstraintInput: (value: string) => void;
  addConstraint: () => void;
  loading: boolean;
  onGenerate: () => void;
}

export function WorkshopContext({
  constraints,
  constraintInput,
  setConstraintInput,
  addConstraint,
  loading,
  onGenerate,
}: WorkshopContextProps) {
  const [documents, setDocuments] = useState<{
    name: string;
    path: string;
    size: number;
  }[]>([]);

  return (
    <div className="space-y-6">
      <ItemList
        label="Workshop Constraints"
        tooltipText="List any limitations or requirements the workshop should consider"
        items={constraints}
        inputValue={constraintInput}
        setInputValue={setConstraintInput}
        onAdd={addConstraint}
        placeholder="Add constraint..."
      />

      <div className="space-y-2">
        <Label className="text-base font-medium flex items-center gap-2">
          <span>Context Documents (Optional)</span>
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm text-muted-foreground">
              Upload documents to provide additional context for the workshop
            </p>
          </TooltipTrigger>
          <TooltipContent>
            Supported formats: PDF, DOC, DOCX, TXT
          </TooltipContent>
        </Tooltip>
        <DocumentUpload onDocumentsUpdate={setDocuments} />
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={onGenerate} 
          disabled={loading}
          className="flex items-center"
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Generating...
            </>
          ) : (
            <>
              Generate Blueprint <CheckCircle className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
