
import { Resend } from "npm:resend@3.1.0";
import { agendaEmail } from "../../../_shared/emailTemplates.ts";
import type { Blueprint } from "../types/workshop.ts";

/**
 * Send a confirmation email to the workshop organizer
 */
export async function sendConfirmationEmail(
  resend: Resend,
  email: string,
  subject: string,
  description: string,
  workshopUrl: string,
  blueprint: Blueprint | null
): Promise<void> {
  try {
    // Format the blueprint preview
    const blueprintPreview = blueprint ? {
      title: blueprint.title,
      totalDuration: blueprint.totalDuration,
      steps: blueprint.steps.slice(0, 3), // Get first 3 steps only
      materials: blueprint.materials
    } : null;

    console.log("Workshop URL:", workshopUrl);
    console.log("Agenda preview length:", description.length);
    console.log("Preparing to send email to:", email);

    // Send the email
    const { data, error } = await resend.emails.send({
      from: "Teho Agenda Assistant <agenda@teho.ai>",
      to: email,
      subject: `Workshop Created: ${subject}`,
      html: agendaEmail({
        hostName: email.split('@')[0],
        agendaPreview: description,
        editorUrl: workshopUrl,
        blueprintPreview
      })
    });

    console.log("Email send result:", JSON.stringify({ data, error }));

    if (error) {
      throw error;
    }

    console.log("Confirmation email sent to:", email);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  }
}
