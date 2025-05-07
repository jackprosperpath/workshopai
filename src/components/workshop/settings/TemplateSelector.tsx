
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { WORKSHOP_TEMPLATES, TEMPLATE_CATEGORIES } from "@/data/workshopTemplates";
import type { WorkshopTemplate } from "@/types/WorkshopTemplates";

interface TemplateSelectorProps {
  onSelectTemplate: (template: WorkshopTemplate) => void;
}

export function TemplateSelector({
  onSelectTemplate
}: TemplateSelectorProps) {
  return <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-8">
        {Object.entries(TEMPLATE_CATEGORIES).map(([category, templates]) => <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold capitalize">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => <Card key={template.id} className="relative hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                      
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">AI Features</h4>
                        <ul className="list-disc pl-4 text-sm space-y-1 text-muted-foreground">
                          {template.aiFeatures.map((feature, index) => <li key={index}>{feature}</li>)}
                        </ul>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {template.idealFor.map((role, index) => (
                          <Badge key={index} variant="outline">
                            {role}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full" onClick={() => onSelectTemplate(template)}>
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>)}
      </div>
    </ScrollArea>;
}
