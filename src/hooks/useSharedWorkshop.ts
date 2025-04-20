
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
      console.log("Creating shareable workshop with data:", workshopData);
      
      // Get current user if available
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || 'anonymous';
      
      const { data, error } = await supabase.functions.invoke('share-workshop', {
        body: {
          action: 'create',
          userId,
          data: workshopData
        }
      });

      if (error) {
        console.error("Error response from function:", error);
        throw error;
      }

      if (!data || !data.workshop || !data.workshop.share_id) {
        throw new Error("Invalid response from server");
      }

      // Generate shareable URL
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${data.workshop.share_id}`;
      
      // Update URL without full page reload
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
      console.log("Loading shared workshop with ID:", id);
      const { data, error } = await supabase.functions.invoke('share-workshop', {
        body: {
          action: 'get',
          workshopId: id
        }
      });

      if (error) {
        console.error("Error loading shared workshop:", error);
        throw error;
      }
      
      if (!data || !data.workshop) {
        throw new Error("Invalid response from server");
      }
      
      console.log("Successfully loaded workshop:", data.workshop);
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
      console.log("Updating shared workshop with ID:", shareId);
      const { data, error } = await supabase.functions.invoke('share-workshop', {
        body: {
          action: 'update',
          workshopId: shareId,
          data: workshopData
        }
      });

      if (error) throw error;
      
      if (!data || !data.workshop) {
        throw new Error("Invalid response from server");
      }
      
      console.log("Successfully updated workshop:", data.workshop);
      return true;
    } catch (error) {
      console.error("Error updating shared workshop:", error);
      toast.error("Failed to update shared workshop");
      return false;
    }
  };

  // Get current share link
  const getShareLink = () => {
    if (!shareId) return null;
    return `${window.location.origin}${window.location.pathname}?share=${shareId}`;
  };

  // Copy the share link to clipboard
  const copyShareLink = () => {
    const link = getShareLink();
    if (!link) return false;
    
    try {
      navigator.clipboard.writeText(link);
      toast.success("Share link copied to clipboard!");
      return true;
    } catch (error) {
      console.error("Error copying share link:", error);
      toast.error("Failed to copy share link");
      return false;
    }
  };

  return {
    isSharing,
    shareId,
    isLoadingShared,
    createShareableWorkshop,
    loadSharedWorkshop,
    updateSharedWorkshop,
    getShareLink,
    copyShareLink
  };
}
