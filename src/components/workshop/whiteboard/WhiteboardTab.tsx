
import { useState } from "react";
import { WhiteboardView } from "./WhiteboardView";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { Blueprint } from "../types/workshop";

interface WhiteboardTabProps {
  blueprint: Blueprint | null;
}

export function WhiteboardTab({ blueprint }: WhiteboardTabProps) {
  const [showInfo, setShowInfo] = useState(true);
  
  return (
    <div className="space-y-4">
      {showInfo && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="flex justify-between items-center">
            <span>
              This whiteboard is collaborative. Other workshop participants can see your cursor and changes in real-time.
            </span>
            <button 
              onClick={() => setShowInfo(false)}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}
      
      <WhiteboardView blueprint={blueprint} />
    </div>
  );
}
