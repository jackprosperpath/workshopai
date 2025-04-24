
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import type { Blueprint } from "../types/workshop";

interface GeneratedBlueprintProps {
  blueprint: Blueprint;
}

export function GeneratedBlueprint({ blueprint }: GeneratedBlueprintProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{blueprint.title}</CardTitle>
            <CardDescription className="mt-2">
              Total Duration: {blueprint.duration}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => {
            toast.success("Blueprint saved to workspace!");
          }}>
            Save Blueprint
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Agenda</h3>
          <div className="space-y-6">
            {blueprint.agenda.map((item, index) => (
              <Card key={index} className="border-muted">
                <CardHeader className="py-3 px-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-md">{item.name}</CardTitle>
                    <Badge variant="outline">{item.duration} min</Badge>
                  </div>
                  <CardDescription>{item.activity}</CardDescription>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <div className="text-sm">{item.description}</div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Facilitation Prompts</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {item.prompts.map((prompt, i) => (
                        <li key={i}>{prompt}</li>
                      ))}
                    </ul>
                  </div>

                  {item.materials && item.materials.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Materials Needed</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {item.materials.map((material, i) => (
                          <li key={i}>{material}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Expected Outcomes</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {item.expectedOutcomes.map((outcome, i) => (
                        <li key={i}>{outcome}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Facilitation Tips</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {item.facilitationTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Materials List</h3>
          <ul className="list-disc pl-5 space-y-1">
            {blueprint.materialsList.map((material, index) => (
              <li key={index}>{material}</li>
            ))}
          </ul>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Follow-up Actions</h3>
          <ul className="list-disc pl-5 space-y-1">
            {blueprint.followupActions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
