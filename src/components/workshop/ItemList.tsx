
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react"; // Import X icon for removal
import {
  Tooltip,
  TooltipContent,
  TooltipProvider, // Added TooltipProvider for proper tooltip functionality
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ItemListProps = {
  label: string;
  tooltipText: string;
  items: string[];
  inputValue: string;
  setInputValue: (value: string) => void;
  onAdd: () => void;
  onRemove?: (index: number) => void; // Added onRemove prop
  placeholder: string;
};

export function ItemList({
  label,
  tooltipText,
  items,
  inputValue,
  setInputValue,
  onAdd,
  onRemove, // Added
  placeholder,
}: ItemListProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <TooltipProvider> {/* Added TooltipProvider */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="text-sm text-muted-foreground block">
              {tooltipText}
            </Label>
          </TooltipTrigger>
          <TooltipContent>
            Add items to the list
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        />
        <Button onClick={onAdd} variant="outline">Add</Button>
      </div>
      <div className="flex gap-2 flex-wrap mt-2">
        {items.map((item, index) => (
          <Badge key={`${item}-${index}`} variant="secondary" className="text-sm flex items-center">
            {item}
            {onRemove && (
              <button
                onClick={() => onRemove(index)}
                className="ml-2 p-0.5 rounded-full hover:bg-muted-foreground/20"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
}

