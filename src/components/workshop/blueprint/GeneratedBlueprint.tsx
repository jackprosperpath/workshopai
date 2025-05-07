
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
              Total Duration: {blueprint.totalDuration || blueprint.duration}
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
            {blueprint.steps && blueprint.steps.map((item, index) => (
              <Card key={index} className="border-muted">
                <CardHeader className="py-3 px-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-md">{item.name}</CardTitle>
                    <Badge variant="outline">{item.duration} min</Badge>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Facilitation Notes</h4>
                    <div className="text-sm">
                      {item.facilitation_notes}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Materials</h3>
          <ul className="list-disc pl-5 space-y-1">
            {blueprint.materials && blueprint.materials.map((material, index) => (
              <li key={index}>{material}</li>
            ))}
          </ul>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Follow-up Actions</h3>
          <ul className="list-disc pl-5 space-y-1">
            {blueprint.follow_up && blueprint.follow_up.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
