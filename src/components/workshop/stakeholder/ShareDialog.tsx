
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share } from "lucide-react";

interface ShareDialogProps {
  getShareLink: () => Promise<string | null>;
}

export function ShareDialog({ getShareLink }: ShareDialogProps) {
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
