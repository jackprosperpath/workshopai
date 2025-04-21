
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "lucide-react";
import domtoimage from "dom-to-image";
import { toast } from "@/components/ui/sonner";

type OGCardShareButtonProps = {
  captureSelector: string;
  remixUrl: string;
};

export function OGCardShareButton({ captureSelector, remixUrl }: OGCardShareButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCaptureAndShare = async (platform: "linkedin" | "x") => {
    setLoading(true);
    try {
      const node = document.querySelector(captureSelector) as HTMLElement;
      if (!node) {
        toast.error("Could not find Solution Canvas!");
        setLoading(false);
        return;
      }
      const dataUrl = await domtoimage.toPng(node, { quality: 1 });
      // Upload to a temporary anonymous image hosting, or open the image in new tab
      // For demo purposes, just open the image directly and show share instructions
      window.open(dataUrl, "_blank");

      let shareUrl = "";
      if (platform === "linkedin") {
        shareUrl =
          "https://www.linkedin.com/sharing/share-offsite/?url=" +
          encodeURIComponent(remixUrl);
      } else if (platform === "x") {
        shareUrl =
          "https://twitter.com/intent/tweet?text=" +
          encodeURIComponent(
            `Check out this AI-powered solution from WorkshopAI! Remix or collaborate: ${remixUrl}`
          );
      }
      window.open(shareUrl, "_blank");
      toast.success("Image previewed. Continue to share your recap!");
    } catch (e) {
      toast.error("Failed to generate share image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Button
        onClick={() => handleCaptureAndShare("linkedin")}
        disabled={loading}
        variant="outline"
        title="Share solution recap to LinkedIn"
      >
        <ProgressBar className="h-4 w-4 mr-1" />
        Publish Recap (LinkedIn)
      </Button>
      <Button
        onClick={() => handleCaptureAndShare("x")}
        disabled={loading}
        variant="outline"
        title="Share solution recap to X"
      >
        <ProgressBar className="h-4 w-4 mr-1" />
        Publish Recap (X)
      </Button>
      <a
        href={remixUrl}
        className="ml-2 px-2 py-1 text-xs rounded bg-primary text-white hover:bg-primary/90"
        target="_blank"
        rel="noopener"
        title="Remix in WorkshopAI"
      >
        Remix in WorkshopAI
      </a>
    </div>
  );
}
