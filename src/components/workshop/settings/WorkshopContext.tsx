
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
        <Label>Context Documents</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="text-sm text-muted-foreground block">
              Upload documents to provide additional context for the workshop
            </Label>
          </TooltipTrigger>
          <TooltipContent>
            Supported formats: PDF, DOC, DOCX, TXT
          </TooltipContent>
        </Tooltip>
        <DocumentUpload onDocumentsUpdate={setDocuments} />
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <span className="text-primary">💡</span> 
          Workshop Tip
        </h4>
        <p className="text-sm text-muted-foreground">
          Adding relevant context documents helps the AI create a more targeted workshop experience. Consider including project briefs, relevant data, or previous workshop outputs.
        </p>
      </div>
    </div>
  );
}
