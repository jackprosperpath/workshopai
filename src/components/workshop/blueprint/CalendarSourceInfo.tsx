
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface CalendarSourceInfoProps { // Exporting the interface for clarity, though not strictly necessary if only used here
  workshopId: string;
}

export function CalendarSourceInfo({ workshopId }: CalendarSourceInfoProps) {
  const [source, setSource] = useState<{ summary: string | null, organizer_email: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSource = async () => {
      if (!workshopId) return;
      setLoading(true);
      try {
        const { data: workshopData, error: workshopError } = await supabase
          .from('workshops')
          .select('invitation_source_id')
          .eq('id', workshopId)
          .single();

        if (workshopError || !workshopData || !workshopData.invitation_source_id) {
          setLoading(false);
          return;
        }

        const { data: inviteData, error: inviteError } = await supabase
          .from('inbound_invites')
          .select('summary, organizer_email')
          .eq('id', workshopData.invitation_source_id)
          .single();
        
        if (inviteError) throw inviteError;

        if (inviteData) {
          setSource({ summary: inviteData.summary, organizer_email: inviteData.organizer_email });
        }
      } catch (err) {
        console.error("Error fetching calendar source:", err);
        // Not setting source to null here to avoid flicker if already set
      } finally {
        setLoading(false);
      }
    };

    fetchSource();
  }, [workshopId]);

  if (loading) {
    return (
      <Alert className="bg-blue-50 border-blue-200 text-blue-700 mt-4">
        <Info className="h-4 w-4 !text-blue-700" />
        <AlertTitle className="font-medium">Checking Calendar Link</AlertTitle>
        <AlertDescription>
          Loading details about the original calendar event...
        </AlertDescription>
      </Alert>
    );
  }

  if (!source || (!source.summary && !source.organizer_email)) {
    return null; // Don't render if no source or not enough info
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Alert className="bg-green-50 border-green-200 text-green-700 mt-4 cursor-help">
            <CalendarDays className="h-4 w-4 !text-green-700" />
            <AlertTitle className="font-medium">Linked to Calendar Event</AlertTitle>
            <AlertDescription>
              {source.summary ? `Based on: "${source.summary}"` : "This workshop originated from a calendar invitation."}
            </AlertDescription>
          </Alert>
        </TooltipTrigger>
        <TooltipContent className="w-auto max-w-xs p-2 text-sm bg-background shadow-lg rounded-md border">
          <p className="font-semibold">Original Calendar Event:</p>
          {source.summary && <p><strong>Title:</strong> {source.summary}</p>}
          {source.organizer_email && <p><strong>Organizer:</strong> {source.organizer_email}</p>}
          <p className="text-xs text-muted-foreground mt-1">This workshop was created from an imported calendar event.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
