
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Copy, Check, Link } from "lucide-react";
import { toast } from "@/components/ui/sonner";

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
      console.log("Requesting share link");
      const url = await getShareLink();
      console.log("Received share link:", url);
      setShareUrl(url);
      if (!url) {
        toast.error("Failed to generate share link");
      }
    } catch (error) {
      console.error("Error getting share link:", error);
      toast.error("Error generating share link");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyLink = () => {
    if (shareUrl) {
      try {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        toast.error("Failed to copy link");
      }
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => {
          setIsOpen(true);
          handleGetShareLink();
        }} className="w-full sm:w-auto">
          <Share2 className="h-4 w-4 mr-2" />
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
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
            Loading share link...
          </div>
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
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
              </Button>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Link className="h-4 w-4 mr-2" />
              Anyone with this link can view the workshop content and provide feedback.
            </div>
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
