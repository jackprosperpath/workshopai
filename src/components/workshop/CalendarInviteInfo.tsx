
import { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface CalendarInviteProps {
  workshopId: string;
}

export function CalendarInviteInfo({ workshopId }: CalendarInviteProps) {
  const [inviteData, setInviteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInviteData = async () => {
      try {
        // First we need to determine if this is a UUID or a share_id
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workshopId);
        
        let workshopQuery = supabase
          .from('workshops')
          .select('id, name, invitation_source_id');
        
        if (isUuid) {
          workshopQuery = workshopQuery.eq('id', workshopId);
        } else {
          workshopQuery = workshopQuery.eq('share_id', workshopId);
        }

        const { data: workshop, error: workshopError } = await workshopQuery.single();

        if (workshopError) {
          console.error("Error loading workshop:", workshopError);
          setError("Could not load workshop data");
          setLoading(false);
          return;
        }

        if (!workshop?.invitation_source_id) {
          // This workshop wasn't created from a calendar invite
          setLoading(false);
          return;
        }

        // Now fetch the invite data
        const { data: invite, error: inviteError } = await supabase
          .from('inbound_invites')
          .select('*')
          .eq('id', workshop.invitation_source_id)
          .single();

        if (inviteError) {
          console.error("Error loading calendar invite data:", inviteError);
          setError("Could not load calendar invite data");
          setLoading(false);
          return;
        }

        setInviteData(invite);
        setLoading(false);
      } catch (err) {
        console.error("Error loading calendar invite data:", err);
        setError("Failed to load calendar information");
        setLoading(false);
      }
    };

    if (workshopId) {
      fetchInviteData();
    }
  }, [workshopId]);

  if (loading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-[80px] w-full rounded-md" />
      </div>
    );
  }

  if (error || !inviteData) {
    // Don't show anything if there's no calendar data
    return null;
  }

  const startDate = new Date(inviteData.start_time);
  const endDate = new Date(inviteData.end_time);
  
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Alert className="mb-6">
      <Calendar className="h-5 w-5" />
      <AlertTitle className="font-medium">Calendar Invite</AlertTitle>
      <AlertDescription>
        <div className="mt-2">
          <div><span className="font-semibold">When:</span> {formatDate(startDate)} to {formatDate(endDate)}</div>
          {inviteData.organizer_email && (
            <div className="mt-1">
              <span className="font-semibold">Organizer:</span> {inviteData.organizer_email}
            </div>
          )}
          {inviteData.attendees && inviteData.attendees.length > 0 && (
            <div className="mt-1">
              <span className="font-semibold">Attendees:</span> {inviteData.attendees.join(', ')}
            </div>
          )}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>Workshop agenda generated from calendar invite</span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
