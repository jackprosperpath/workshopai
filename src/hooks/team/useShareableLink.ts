
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { useTeamInvites } from "./useTeamInvites";

export function useShareableLink() {
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);
  const { workshopId } = useTeamInvites();

  const generateShareableLink = () => {
    if (!workshopId) {
      toast.error("Workshop ID not available");
      return "";
    }
    
    const link = `${window.location.origin}/workshop?id=${workshopId}`;
    
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopyLinkSuccess(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopyLinkSuccess(false), 3000);
      })
      .catch(err => {
        console.error("Could not copy link: ", err);
        toast.error("Failed to copy link");
      });
      
    return link;
  };

  return {
    generateShareableLink,
    copyLinkSuccess,
    workshopId
  };
}
