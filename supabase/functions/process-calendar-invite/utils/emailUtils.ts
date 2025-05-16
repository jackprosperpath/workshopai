
import { Resend } from "npm:resend@3.1.0";
import { sendBlueprintReadyEmail } from "../../_shared/emailTemplates.ts";
import type { ConciseBlueprint } from "../types/workshop.ts"; // Ensure this path is correct

export async function sendConfirmationEmail(
  resend: Resend,
  recipientEmail: string,
  meetingSummary: string, // Original meeting summary
  meetingDescription: string, // Original meeting description (can be long)
  blueprintShareUrl: string,
  blueprintContent: ConciseBlueprint // Updated to use ConciseBlueprint
): Promise<void> {
  console.log(`Sending confirmation email to: ${recipientEmail}`);
  console.log(`Blueprint share URL: ${blueprintShareUrl}`);
  // console.log("Blueprint content for email:", blueprintContent);

  // Adapt content for the email template
  const workshopTitle = blueprintContent.workshopTitle || meetingSummary || "Your Meeting Blueprint";
  
  // Construct a description from the concise blueprint's objectives or agenda
  let workshopDescriptionForEmail = `Objectives: ${blueprintContent.objectives.join("; ")}.`;
  if (blueprintContent.agendaItems && blueprintContent.agendaItems.length > 0) {
    workshopDescriptionForEmail += ` Key agenda items include: ${blueprintContent.agendaItems.slice(0, 2).join("; ")}...`;
  }
  if (!blueprintContent.objectives || blueprintContent.objectives.length === 0) {
    // Fallback if objectives are empty for some reason
    workshopDescriptionForEmail = blueprintContent.meetingContext || meetingDescription.substring(0, 150) + (meetingDescription.length > 150 ? "..." : "");
  }


  try {
    await sendBlueprintReadyEmail(
      resend,
      recipientEmail,
      workshopTitle,
      workshopDescriptionForEmail, // Use the adapted description
      blueprintShareUrl
    );
    console.log(`Confirmation email successfully sent to ${recipientEmail}`);
  } catch (error) {
    console.error(`Error sending confirmation email to ${recipientEmail}:`, error);
    // Decide if this error should throw and fail the whole process or just log
    // For now, logging, as blueprint generation is the primary success.
  }
}
