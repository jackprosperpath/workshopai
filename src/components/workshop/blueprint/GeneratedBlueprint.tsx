
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save } from "lucide-react";
import type { Blueprint, BlueprintStep } from "../types/workshop";

interface GeneratedBlueprintProps {
  blueprint: Blueprint;
  onBlueprintUpdate?: (updatedBlueprint: Blueprint) => Promise<void>;
}

export function GeneratedBlueprint({ blueprint: initialBlueprint, onBlueprintUpdate }: GeneratedBlueprintProps) {
  const [blueprint, setBlueprint] = useState<Blueprint>(initialBlueprint);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (onBlueprintUpdate) {
      setIsSaving(true);
      try {
        await onBlueprintUpdate(blueprint);
        toast.success("Blueprint saved successfully");
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving blueprint:", error);
        toast.error("Failed to save blueprint");
      } finally {
        setIsSaving(false);
      }
    } else {
      toast.success("Blueprint changes saved");
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setBlueprint(initialBlueprint);
    setIsEditing(false);
  };

  const updateTitle = (newTitle: string) => {
    setBlueprint(prev => ({ ...prev, title: newTitle }));
  };

  const updateDuration = (newDuration: string) => {
    setBlueprint(prev => ({ ...prev, totalDuration: newDuration }));
  };

  const updateStep = (index: number, field: keyof BlueprintStep, value: string) => {
    setBlueprint(prev => {
      const updatedSteps = [...(prev.steps || [])];
      updatedSteps[index] = { ...updatedSteps[index], [field]: value };
      return { ...prev, steps: updatedSteps };
    });
  };

  const addStep = () => {
    setBlueprint(prev => {
      const newStep: BlueprintStep = {
        name: "New Step",
        duration: "15",
        description: "Description for the new step",
        facilitation_notes: "Notes for facilitating this step"
      };
      return { ...prev, steps: [...(prev.steps || []), newStep] };
    });
  };

  const removeStep = (index: number) => {
    setBlueprint(prev => {
      const updatedSteps = [...(prev.steps || [])];
      updatedSteps.splice(index, 1);
      return { ...prev, steps: updatedSteps };
    });
  };

  const updateMaterial = (index: number, value: string) => {
    setBlueprint(prev => {
      const updatedMaterials = [...(prev.materials || [])];
      updatedMaterials[index] = value;
      return { ...prev, materials: updatedMaterials };
    });
  };

  const addMaterial = () => {
    setBlueprint(prev => {
      return { ...prev, materials: [...(prev.materials || []), "New material"] };
    });
  };

  const removeMaterial = (index: number) => {
    setBlueprint(prev => {
      const updatedMaterials = [...(prev.materials || [])];
      updatedMaterials.splice(index, 1);
      return { ...prev, materials: updatedMaterials };
    });
  };

  const updateFollowUp = (index: number, value: string) => {
    setBlueprint(prev => {
      const updatedFollowUp = [...(prev.follow_up || [])];
      updatedFollowUp[index] = value;
      return { ...prev, follow_up: updatedFollowUp };
    });
  };

  const addFollowUp = () => {
    setBlueprint(prev => {
      return { ...prev, follow_up: [...(prev.follow_up || []), "New follow-up action"] };
    });
  };

  const removeFollowUp = (index: number) => {
    setBlueprint(prev => {
      const updatedFollowUp = [...(prev.follow_up || [])];
      updatedFollowUp.splice(index, 1);
      return { ...prev, follow_up: updatedFollowUp };
    });
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="w-full">
            {isEditing ? (
              <Input 
                className="font-bold text-xl mb-2"
                value={blueprint.title}
                onChange={(e) => updateTitle(e.target.value)}
              />
            ) : (
              <CardTitle>{blueprint.title}</CardTitle>
            )}
            <CardDescription className="mt-2 flex items-center">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <span>Total Duration:</span>
                  <Input 
                    className="w-24" 
                    value={blueprint.totalDuration || blueprint.duration} 
                    onChange={(e) => updateDuration(e.target.value)}
                  />
                  <span>minutes</span>
                </div>
              ) : (
                <span>Total Duration: {blueprint.totalDuration || blueprint.duration}</span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Blueprint
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">Agenda</h3>
            {isEditing && (
              <Button onClick={addStep} size="sm" variant="outline">
                Add Step
              </Button>
            )}
          </div>
          <div className="space-y-6">
            {blueprint.steps && blueprint.steps.map((item, index) => (
              <Card key={index} className="border-muted">
                <CardHeader className="py-3 px-4">
                  <div className="flex justify-between items-center">
                    {isEditing ? (
                      <Input 
                        className="font-semibold"
                        value={item.name}
                        onChange={(e) => updateStep(index, "name", e.target.value)}
                      />
                    ) : (
                      <CardTitle className="text-md">{item.name}</CardTitle>
                    )}
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          className="w-16"
                          value={item.duration}
                          onChange={(e) => updateStep(index, "duration", e.target.value)}
                        />
                        <span>min</span>
                      </div>
                    ) : (
                      <Badge variant="outline">{item.duration} min</Badge>
                    )}
                  </div>
                  {isEditing ? (
                    <Textarea 
                      className="mt-2"
                      value={item.description}
                      onChange={(e) => updateStep(index, "description", e.target.value)}
                    />
                  ) : (
                    <CardDescription>{item.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-2">Facilitation Notes</h4>
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <Textarea 
                          value={item.facilitation_notes}
                          onChange={(e) => updateStep(index, "facilitation_notes", e.target.value)}
                        />
                        <div className="flex justify-end">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeStep(index)}
                          >
                            Remove Step
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm">
                        {item.facilitation_notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">Materials</h3>
            {isEditing && (
              <Button onClick={addMaterial} size="sm" variant="outline">
                Add Material
              </Button>
            )}
          </div>
          <ul className="space-y-2">
            {blueprint.materials && blueprint.materials.map((material, index) => (
              <li key={index} className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input 
                      value={material}
                      onChange={(e) => updateMaterial(index, e.target.value)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeMaterial(index)}
                      className="text-red-500"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <span>{material}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div>
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">Follow-up Actions</h3>
            {isEditing && (
              <Button onClick={addFollowUp} size="sm" variant="outline">
                Add Follow-up
              </Button>
            )}
          </div>
          <ul className="space-y-2">
            {blueprint.follow_up && blueprint.follow_up.map((action, index) => (
              <li key={index} className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input 
                      value={action}
                      onChange={(e) => updateFollowUp(index, e.target.value)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeFollowUp(index)}
                      className="text-red-500"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <span>{action}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
