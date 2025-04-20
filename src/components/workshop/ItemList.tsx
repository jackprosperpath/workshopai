
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ItemListProps = {
  label: string;
  tooltipText: string;
  items: string[];
  inputValue: string;
  setInputValue: (value: string) => void;
  onAdd: () => void;
  placeholder: string;
};

export function ItemList({
  label,
  tooltipText,
  items,
  inputValue,
  setInputValue,
  onAdd,
  placeholder,
}: ItemListProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
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
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="text-sm">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
