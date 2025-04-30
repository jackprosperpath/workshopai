
import { useState, useEffect } from "react";
import { Calendar, Check, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface CalendarInviteInfoProps {
  workshopId: string;
}

export function CalendarInviteInfo({ workshopId }: CalendarInviteInfoProps) {
  const [inviteData, setInviteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);

  useEffect(() => {
    async function loadInviteData() {
      try {
        const { data, error } = await supabase
          .from('workshops')
          .select(`
            id,
            name,
            problem,
            duration,
            inbound_invites!inner (
              id,
              organizer_email,
              summary,
              description,
              start_time,
              end_time,
              attendees,
              status
            )
          `)
          .eq('id', workshopId)
          .single();

        if (error) throw error;
        
        if (data && data.inbound_invites) {
          setInviteData({
            ...data,
            inviteDetails: data.inbound_invites
          });
        }
      } catch (error) {
        console.error("Error loading calendar invite data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (workshopId) {
      loadInviteData();
    }
  }, [workshopId]);

  const claimWorkshop = async () => {
    try {
      setClaimLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        toast.error("You need to be signed in to claim this workshop");
        return;
      }
      
      const { error } = await supabase
        .from('workshops')
        .update({
          owner_id: userData.user.id
        })
        .eq('id', workshopId);
        
      if (error) throw error;
      
      toast.success("Workshop claimed successfully");
      
      // Refresh the page to update UI
      window.location.reload();
    } catch (error) {
      console.error("Error claiming workshop:", error);
      toast.error("Failed to claim workshop");
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-dashed border-amber-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Calendar className="mr-2 h-5 w-5 animate-pulse" />
            <p>Loading calendar information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!inviteData) {
    return null;
  }
  
  const { inviteDetails } = inviteData;
  const startTime = inviteDetails?.start_time ? new Date(inviteDetails.start_time) : null;
  const endTime = inviteDetails?.end_time ? new Date(inviteDetails.end_time) : null;

  return (
    <Card className="border-amber-200 bg-amber-50 mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-amber-600" />
              Calendar-Generated Workshop
            </CardTitle>
            <CardDescription>
              {inviteDetails?.organizer_email && (
                <span>From: {inviteDetails.organizer_email}</span>
              )}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-amber-100">
            {inviteData.owner_id === 'calendar-invite' ? 'Unclaimed' : 'Claimed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {startTime && endTime && (
          <div className="flex items-center mb-3 text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            <span>{format(startTime, 'MMM d, yyyy h:mm a')} - {format(endTime, 'h:mm a')}</span>
          </div>
        )}
        
        {inviteDetails?.attendees && Array.isArray(inviteDetails.attendees) && inviteDetails.attendees.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Attendees:</p>
            <div className="flex flex-wrap gap-1">
              {inviteDetails.attendees.map((email: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {email}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {inviteData.owner_id === 'calendar-invite' && (
          <Button 
            onClick={claimWorkshop} 
            className="w-full mt-2"
            disabled={claimLoading}
          >
            {claimLoading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⟳</span> Claiming...
              </span>
            ) : (
              <span className="flex items-center">
                <Check className="mr-2 h-4 w-4" /> Claim This Workshop
              </span>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
