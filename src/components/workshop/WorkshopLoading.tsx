
import { Loader2 } from "lucide-react";

interface WorkshopLoadingProps {
  message?: string;
}

export function WorkshopLoading({ message = "Loading..." }: WorkshopLoadingProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">{message}</span>
    </div>
  );
}
