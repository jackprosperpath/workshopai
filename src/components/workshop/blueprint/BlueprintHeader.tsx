
import { CardTitle, CardDescription } from "@/components/ui/card";

interface BlueprintHeaderProps {
  currentStep: number;
}

export function BlueprintHeader({ currentStep }: BlueprintHeaderProps) {
  return (
    <>
      <CardTitle>Create Workshop Blueprint</CardTitle>
      <CardDescription>
        Follow these 3 steps to create your AI-facilitated workshop
      </CardDescription>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1</div>
          <div className="h-0.5 w-12 bg-muted"></div>
          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</div>
          <div className="h-0.5 w-12 bg-muted"></div>
          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentStep === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3</div>
        </div>
        <div className="text-muted-foreground text-sm">
          {currentStep === 1 && "Objectives"}
          {currentStep === 2 && "People & Time"}
          {currentStep === 3 && "Context"}
        </div>
      </div>
    </>
  );
}
