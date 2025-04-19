
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export function useSharedWorkshop() {
  const [isSharing, setIsSharing] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract share ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('share');
    if (id) {
      setShareId(id);
      loadSharedWorkshop(id);
    }
  }, [location.search]);

  // Create a shareable workshop
  const createShareableWorkshop = async (workshopData: any) => {
    setIsSharing(true);
    try {
      const { data, error } = await supabase.functions.invoke('share-workshop', {
        body: {
          action: 'create',
          userId: 'anonymous', // Replace with actual user ID if you implement auth
          data: workshopData
        }
      });

      if (error) throw error;

      // Update URL with share ID without reloading
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${data.workshop.share_id}`;
      window.history.pushState({}, '', `${window.location.pathname}?share=${data.workshop.share_id}`);
      
      setShareId(data.workshop.share_id);
      toast.success("Workshop shared successfully!");
      
      // Return the shareable URL
      return shareUrl;
    } catch (error) {
      console.error("Error creating shareable workshop:", error);
      toast.error("Failed to share workshop");
      return null;
    } finally {
      setIsSharing(false);
    }
  };

  // Load a shared workshop
  const loadSharedWorkshop = async (id: string) => {
    setIsLoadingShared(true);
    try {
      const { data, error } = await supabase.functions.invoke('share-workshop', {
        body: {
          action: 'get',
          workshopId: id
        }
      });

      if (error) throw error;
      return data.workshop;
    } catch (error) {
      console.error("Error loading shared workshop:", error);
      toast.error("Failed to load shared workshop");
      return null;
    } finally {
      setIsLoadingShared(false);
    }
  };

  // Update a shared workshop
  const updateSharedWorkshop = async (workshopData: any) => {
    if (!shareId) return false;
    
    try {
      const { data, error } = await supabase.functions.invoke('share-workshop', {
        body: {
          action: 'update',
          workshopId: shareId,
          data: workshopData
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating shared workshop:", error);
      toast.error("Failed to update shared workshop");
      return false;
    }
  };

  // Copy the share link to clipboard
  const copyShareLink = () => {
    if (!shareId) return false;
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
    return true;
  };

  return {
    isSharing,
    shareId,
    isLoadingShared,
    createShareableWorkshop,
    loadSharedWorkshop,
    updateSharedWorkshop,
    copyShareLink
  };
}
