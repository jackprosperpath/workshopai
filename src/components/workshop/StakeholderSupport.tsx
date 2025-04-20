
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSharedWorkshop } from "@/hooks/useSharedWorkshop";
import type { Stakeholder } from "@/hooks/useStakeholders";
import { CheckCircle, XCircle, Trash2, Share, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type StakeholderSupportProps = {
  stakeholders: Stakeholder[];
  newRole: string;
  setNewRole: (role: string) => void;
  newEmail?: string;
  setNewEmail?: (email: string) => void;
  isInviting?: boolean;
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
  addStakeholder,
  updateStakeholder,
  removeStakeholder = () => {},
  inviteStakeholder = async () => {},
}: StakeholderSupportProps) {
  const { shareId, createShareableWorkshop } = useSharedWorkshop();
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Function to generate a share link if one doesn't exist
  const getShareLink = async () => {
    if (shareId) {
      return `${window.location.origin}${window.location.pathname}?share=${shareId}`;
    }
    
    // If no share ID exists, create one
    const workshopData = {
      problem: "Workshop content", // This would need to be passed from the parent
      metrics: [],
      constraints: [],
      selectedModel: "gpt-4"
    };
    
    const url = await createShareableWorkshop(workshopData);
    setShareUrl(url);
    return url;
  };

  const handleInviteStakeholder = async (id: number) => {
    const link = await getShareLink();
    if (link) {
      await inviteStakeholder(id, link);
    }
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
            <Button onClick={addStakeholder} variant="outline">
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
                {stakeholders.map((st) => (
                  <div key={st.id} className="border rounded-md p-3 bg-muted/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{st.role}</span>
                        {st.email && <span className="text-xs text-muted-foreground">{st.email}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {st.email && !st.inviteSent && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleInviteStakeholder(st.id)}
                            disabled={isInviting}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Invite
                          </Button>
                        )}
                        {st.inviteSent && (
                          <span className="text-xs text-muted-foreground">Invite sent</span>
                        )}
                        <div className="flex items-center border rounded-md overflow-hidden">
                          <button
                            className={`p-1 px-2 ${
                              st.status === "yes" ? "bg-green-100 text-green-600" : ""
                            }`}
                            onClick={() =>
                              updateStakeholder(st.id, { status: "yes" })
                            }
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            className={`p-1 px-2 ${
                              st.status === "no" ? "bg-red-100 text-red-600" : ""
                            }`}
                            onClick={() =>
                              updateStakeholder(st.id, { status: "no" })
                            }
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 px-2 hover:bg-muted"
                            onClick={() => removeStakeholder(st.id)}
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Add feedback or comments here..."
                      value={st.comment || ""}
                      onChange={(e) =>
                        updateStakeholder(st.id, { comment: e.target.value })
                      }
                      className="mt-2 min-h-[80px] text-sm"
                    />
                    <div className="mt-2 flex justify-end">
                      <div className="text-xs font-medium rounded-full px-2 py-1 inline-flex items-center gap-1">
                        {st.status === "pending" && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Pending</span>
                        )}
                        {st.status === "yes" && (
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Approved</span>
                        )}
                        {st.status === "no" && (
                          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Rejected</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Share with Additional Stakeholders</h2>
        
        <ShareWorkshopDialog getShareLink={getShareLink} />
      </div>
    </section>
  );
}

function ShareWorkshopDialog({ getShareLink }: { getShareLink: () => Promise<string | null> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const handleGetShareLink = async () => {
    setIsLoading(true);
    try {
      const url = await getShareLink();
      setShareUrl(url);
    } catch (error) {
      console.error("Error getting share link:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => {
          setIsOpen(true);
          handleGetShareLink();
        }} className="w-full sm:w-auto">
          <Share className="h-4 w-4 mr-2" />
          Share with Executives
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Workshop with Executives</DialogTitle>
          <DialogDescription>
            Share this link with executives or other stakeholders who need to review and endorse the solution.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-4">Loading share link...</div>
        ) : shareUrl ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyLink}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Anyone with this link can view the workshop content and provide feedback.
            </p>
          </div>
        ) : (
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Create a shareable link to send to executives and stakeholders.
            </p>
            <Button onClick={handleGetShareLink} disabled={isLoading}>
              Generate Share Link
            </Button>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
