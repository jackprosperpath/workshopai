
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, Check, Link } from "lucide-react";
import { useSharedWorkshop } from "@/hooks/useSharedWorkshop";
import { toast } from "@/components/ui/sonner";

type WorkshopSharingProps = {
  workshopData: {
    problem: string;
    metrics: string[];
    constraints: string[];
    selectedModel: string;
  };
};

export function WorkshopSharing({ workshopData }: WorkshopSharingProps) {
  const { isSharing, shareId, createShareableWorkshop, getShareLink, copyShareLink } = useSharedWorkshop();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCreateShare = async () => {
    try {
      const url = await createShareableWorkshop(workshopData);
      console.log("Created share URL:", url);
      if (url) {
        setShareUrl(url);
      }
    } catch (error) {
      console.error("Error in handleCreateShare:", error);
      toast.error("Failed to create share link");
    }
  };

  const handleCopyLink = () => {
    try {
      if (shareId) {
        copyShareLink();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else if (shareUrl) {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Error copying link:", error);
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 border rounded-lg shadow-sm bg-card">
      <h2 className="text-2xl font-bold mb-6">Share Your Workshop</h2>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Share with Executives and Stakeholders</h3>
          <p className="text-muted-foreground">
            Create a shareable link that you can send to executives and stakeholders to get their feedback and endorsement.
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full md:w-auto" 
              size="lg"
              onClick={() => {
                setOpen(true);
                if (!shareUrl && !shareId) {
                  handleCreateShare();
                }
              }}
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share Workshop
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Workshop</DialogTitle>
              <DialogDescription>
                Anyone with the link can access this workshop and provide feedback.
              </DialogDescription>
            </DialogHeader>
            
            {isSharing ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                <p>Creating share link...</p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {!shareUrl && !shareId ? (
                  <Button 
                    onClick={handleCreateShare} 
                    disabled={isSharing} 
                    className="w-full"
                  >
                    {isSharing ? "Creating share link..." : "Create Share Link"}
                  </Button>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">
                          Link
                        </Label>
                        <Input
                          id="link"
                          readOnly
                          value={shareUrl || getShareLink() || ''}
                          className="h-9"
                        />
                      </div>
                      <Button size="sm" variant="outline" onClick={handleCopyLink} className="px-3">
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy</span>
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        <span>Anyone with the link can view this workshop</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            <DialogFooter className="sm:justify-start">
              <DialogTrigger asChild>
                <Button variant="secondary">Close</Button>
              </DialogTrigger>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Why Share Your Workshop?</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="mr-2 h-5 w-5 bg-primary/20 rounded-full flex items-center justify-center text-primary">1</div>
              <p><span className="font-medium">Get stakeholder buy-in</span> - Share your workshop with key decision makers to gain their support</p>
            </li>
            <li className="flex items-start">
              <div className="mr-2 h-5 w-5 bg-primary/20 rounded-full flex items-center justify-center text-primary">2</div>
              <p><span className="font-medium">Gather feedback</span> - Collect valuable insights from across your organization</p>
            </li>
            <li className="flex items-start">
              <div className="mr-2 h-5 w-5 bg-primary/20 rounded-full flex items-center justify-center text-primary">3</div>
              <p><span className="font-medium">Collaborate asynchronously</span> - Let stakeholders review the workshop on their own time</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
