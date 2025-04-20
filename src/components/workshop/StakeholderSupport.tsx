
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSharedWorkshop } from "@/hooks/useSharedWorkshop";
import type { Stakeholder } from "@/hooks/useStakeholders";
import { ShareDialog } from "./stakeholder/ShareDialog";
import { StakeholderCard } from "./stakeholder/StakeholderCard";
import { toast } from "@/components/ui/sonner";

type StakeholderSupportProps = {
  stakeholders: Stakeholder[];
  newRole: string;
  setNewRole: (role: string) => void;
  newEmail?: string;
  setNewEmail?: (email: string) => void;
  isInviting?: boolean;
  workshopId?: string | null;
  addStakeholder: () => void;
  updateStakeholder: (id: number, updates: Partial<Omit<Stakeholder, "id">>) => void;
  removeStakeholder?: (id: number) => void;
  inviteStakeholder?: (id: number, workshopShareLink: string) => Promise<void>;
};

export function StakeholderSupport({
  stakeholders,
  newRole,
  setNewRole,
  newEmail = "",
  setNewEmail = () => {},
  isInviting = false,
  workshopId = null,
  addStakeholder,
  updateStakeholder,
  removeStakeholder = () => {},
  inviteStakeholder = async () => {},
}: StakeholderSupportProps) {
  const { shareId, createShareableWorkshop } = useSharedWorkshop();
  const [shareUrl, setShareUrl] = React.useState<string | null>(null);
  const [isGettingShareLink, setIsGettingShareLink] = React.useState(false);

  const getShareLink = async () => {
    setIsGettingShareLink(true);
    try {
      if (shareId) {
        const url = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
        setShareUrl(url);
        return url;
      }
      
      const workshopData = {
        problem: "Workshop content",
        metrics: [],
        constraints: [],
        selectedModel: "gpt-4"
      };
      
      const url = await createShareableWorkshop(workshopData);
      setShareUrl(url);
      return url;
    } catch (error) {
      console.error("Error getting share link:", error);
      toast.error("Failed to create shareable link");
      throw error;
    } finally {
      setIsGettingShareLink(false);
    }
  };

  const handleInviteStakeholder = async (id: number) => {
    if (isInviting) {
      toast.info("Another invitation is already in progress");
      return;
    }
    
    try {
      const link = await getShareLink();
      if (link) {
        await inviteStakeholder(id, link);
      }
    } catch (error) {
      console.error("Error inviting stakeholder:", error);
      toast.error("Failed to invite stakeholder: " + (error.message || "Unknown error"));
    }
  };

  const handleAddStakeholder = () => {
    if (!newRole.trim()) {
      toast.error("Please enter a stakeholder role");
      return;
    }
    
    addStakeholder();
  };

  return (
    <section className="space-y-6">
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Stakeholder Endorsement</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Stakeholder role or title"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Email address (optional)"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1"
              type="email"
            />
            <Button 
              onClick={handleAddStakeholder} 
              variant="outline"
            >
              Add
            </Button>
          </div>
          
          <div className="mt-4">
            {stakeholders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No stakeholders added yet. Add stakeholders above to get their endorsements.
              </div>
            ) : (
              <div className="space-y-4">
                {stakeholders.map((stakeholder) => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    isInviting={isInviting || isGettingShareLink}
                    onUpdate={(updates) => updateStakeholder(stakeholder.id, updates)}
                    onRemove={() => removeStakeholder(stakeholder.id)}
                    onInvite={() => handleInviteStakeholder(stakeholder.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Share with Additional Stakeholders</h2>
        <ShareDialog getShareLink={getShareLink} />
      </div>
    </section>
  );
}
