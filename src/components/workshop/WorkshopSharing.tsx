
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share, Copy, Check, Link as LinkIcon } from "lucide-react";
import { useSharedWorkshop } from "@/hooks/useSharedWorkshop";

type WorkshopSharingProps = {
  workshopData: {
    problem: string;
    metrics: string[];
    constraints: string[];
    selectedModel: string;
  };
};

export function WorkshopSharing({ workshopData }: WorkshopSharingProps) {
  const { isSharing, shareId, createShareableWorkshop, copyShareLink } = useSharedWorkshop();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateShare = async () => {
    const url = await createShareableWorkshop(workshopData);
    if (url) {
      setShareUrl(url);
    }
  };

  const handleCopyLink = () => {
    if (shareId) {
      copyShareLink();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Share className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Workshop</DialogTitle>
          <DialogDescription>
            Share this workshop with others so they can collaborate in real-time.
          </DialogDescription>
        </DialogHeader>
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
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  readOnly
                  value={shareUrl || `${window.location.origin}${window.location.pathname}?share=${shareId}`}
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
          )}
          
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <span>Anyone with the link can access this workshop</span>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogTrigger asChild>
            <Button variant="secondary">Close</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
