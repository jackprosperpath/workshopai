
import { EventData } from "./parseIcs.ts";

/**
 * Store invitation in the database
 */
export async function storeInvitation(
  supabase: any, 
  rawIcs: string, 
  parsedIcs: any, 
  email: string, 
  eventData: EventData
): Promise<string> {
  const { data: inviteData, error: inviteError } = await supabase
    .from('inbound_invites')
    .insert({
      raw_ics: rawIcs,
      parsed_data: parsedIcs,
      organizer_email: email,
      summary: eventData.summary,
      description: eventData.description,
      start_time: eventData.startTime.toISOString(),
      end_time: eventData.endTime.toISOString(),
      attendees: eventData.attendees,
      status: eventData.status || 'pending'
    })
    .select('id')
    .single();
  
  if (inviteError) {
    console.error('Error storing invitation:', inviteError);
    throw inviteError;
  }

  console.log("Invite stored with ID:", inviteData.id);
  return inviteData.id;
}

/**
 * Create a workshop from invitation
 */
export async function createWorkshopFromInvite(
  supabase: any,
  ownerId: string | null,
  summary: string,
  description: string,
  durationMinutes: number,
  inviteId: string
): Promise<{ id: string; share_id: string }> {
  // If no ownerId was found, use a special identifier for calendar-based workshops
  const effectiveOwnerId = ownerId || 'calendar-invite';
  
  const { data: workshopData, error: workshopError } = await supabase
    .from('workshops')
    .insert({
      owner_id: effectiveOwnerId,
      share_id: crypto.randomUUID().substring(0, 8),
      name: summary,
      problem: description,
      duration: durationMinutes,
      invitation_source_id: inviteId,
      workshop_type: 'online'  // Default to online
    })
    .select('id, share_id')
    .single();
  
  if (workshopError) {
    console.error('Error creating workshop:', workshopError);
    throw workshopError;
  }
  
  console.log("Workshop created with ID:", workshopData.id, "share_id:", workshopData.share_id, "and owner_id:", effectiveOwnerId);
  return workshopData;
}

/**
 * Update invitation with workshop ID
 */
export async function updateInvitationWithWorkshop(
  supabase: any, 
  inviteId: string, 
  workshopId: string
): Promise<void> {
  await supabase
    .from('inbound_invites')
    .update({ 
      workshop_id: workshopId,
      status: 'processed',
      processed_at: new Date().toISOString()
    })
    .eq('id', inviteId);
}
