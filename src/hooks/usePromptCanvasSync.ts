
import { useState, useEffect } from "react";
import { useSharedWorkshop } from "./useSharedWorkshop";
import { supabase } from "@/integrations/supabase/client";
import type { AiModel } from "./usePromptCanvas";
import { toast } from "@/components/ui/sonner";
import type { PredefinedFormat } from "@/types/OutputFormat";

type PromptCanvasData = {
  problem: string;
  metrics: string[];
  constraints: string[];
  selectedModel: AiModel;
  selectedFormat?: {
    type: PredefinedFormat;
    customFormat?: string;
    description: string;
  };
  customFormat?: string;
};

export function usePromptCanvasSync(
  initialData: PromptCanvasData,
  setExternalData: (data: Partial<PromptCanvasData>) => void
) {
  const { shareId, isLoadingShared, updateSharedWorkshop } = useSharedWorkshop();
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [workshopId, setWorkshopId] = useState<string | null>(null);

  // Get workshop ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setWorkshopId(id);
    }
  }, []);

  // Initial load of shared data
  useEffect(() => {
    if (shareId) {
      const loadSharedData = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('share-workshop', {
            body: {
              action: 'get',
              workshopId: shareId
            }
          });
          
          if (error) throw error;
          
          if (data.workshop) {
            setExternalData({
              problem: data.workshop.problem,
              metrics: data.workshop.metrics,
              constraints: data.workshop.constraints,
              selectedModel: data.workshop.selected_model,
              selectedFormat: data.workshop.selected_format,
              customFormat: data.workshop.custom_format
            });
            setLastSynced(new Date());
          }
        } catch (error) {
          console.error("Error loading shared data:", error);
        }
      };
      
      loadSharedData();
    }
  }, [shareId, setExternalData]);

  // Set up real-time updates for workshop data
  useEffect(() => {
    if (!workshopId) return;

    const channel = supabase
      .channel(`workshop:${workshopId}`)
      .on('broadcast', { event: 'workshop_update' }, (payload) => {
        console.log('Received update:', payload);
        if (payload.payload) {
          const data = payload.payload as Partial<PromptCanvasData>;
          
          // Only update if we haven't just synced ourselves
          if (
            !lastSynced || 
            new Date().getTime() - lastSynced.getTime() > 2000
          ) {
            setExternalData(data);
            toast.info("Workshop updated by a collaborator");
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workshopId, lastSynced, setExternalData]);

  // Sync data to other users
  const syncData = async (data: PromptCanvasData) => {
    if (!workshopId) return;
    
    setIsSyncing(true);
    try {
      // Send real-time update to other users
      await supabase
        .channel(`workshop:${workshopId}`)
        .send({
          type: 'broadcast',
          event: 'workshop_update',
          payload: data
        });
      
      setLastSynced(new Date());
    } catch (error) {
      console.error("Error syncing data:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    syncData
  };
}
