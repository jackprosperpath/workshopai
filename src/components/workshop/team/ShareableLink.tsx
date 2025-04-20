
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Share } from "lucide-react";
import { useShareableLink } from "@/hooks/team/useShareableLink";

export function ShareableLink() {
  const { generateShareableLink, copyLinkSuccess, workshopId } = useShareableLink();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Generate a link that you can share with anyone to invite them to this workshop
      </p>
      <Button onClick={generateShareableLink} variant="outline" className="w-full">
        {copyLinkSuccess ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Link Copied!
          </>
        ) : (
          <>
            <Share className="mr-2 h-4 w-4" />
            Generate Shareable Link
          </>
        )}
      </Button>
      {workshopId && (
        <div className="mt-2 p-2 bg-muted rounded-md text-xs font-mono break-all">
          {`${window.location.origin}/workshop?id=${workshopId}`}
        </div>
      )}
    </div>
  );
}
