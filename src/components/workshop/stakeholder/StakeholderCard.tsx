
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type Stakeholder } from "@/hooks/useStakeholders";
import { UserX } from "lucide-react";

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  onUpdate: (updates: Partial<Omit<Stakeholder, "id">>) => void;
  onRemove: () => void;
}

export function StakeholderCard({ stakeholder, onUpdate, onRemove }: StakeholderCardProps) {
  const { role, status, email, comment } = stakeholder;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{role}</h3>
            <Badge variant={
              status === "yes" ? "default" :
              status === "no" ? "destructive" :
              "secondary"
            }>
              {status === "yes" ? "Approved" :
               status === "no" ? "Rejected" :
               "Pending"}
            </Badge>
          </div>
          {email && (
            <p className="text-sm text-muted-foreground mt-1">{email}</p>
          )}
          {comment && (
            <p className="text-sm mt-2">{comment}</p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="flex-shrink-0"
        >
          <UserX className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
