
import { Resend } from "npm:resend@3.1.0";
import { agendaEmail } from "../../_shared/emailTemplates.ts";

/**
 * Send confirmation email
 */
export async function sendConfirmationEmail(
  resend: Resend,
  email: string,
  summary: string,
  description: string,
  workshopUrl: string,
  blueprint: any = {}
): Promise<void> {
  try {
    // Generate agenda preview
    const agendaPreview = description.substring(0, 300) + (description.length > 300 ? '...' : '');
    
    // Extract host name from email
    const hostName = email.split('@')[0];
    
    console.log("Preparing to send email to:", email);
    console.log("Workshop URL:", workshopUrl);
    console.log("Agenda preview length:", agendaPreview.length);

    // Prepare blueprint preview data
    const blueprintPreview = {
      title: summary,
      totalDuration: blueprint.totalDuration || blueprint.duration || "60-90",
      steps: blueprint.steps ? blueprint.steps.slice(0, 2) : [], // Just preview first 2 agenda items
      materials: blueprint.materials ? blueprint.materials.slice(0, 3) : [] // Just preview first 3 materials
    };

    // Use the email template
    const emailHtml = agendaEmail({
      hostName,
      agendaPreview,
      editorUrl: workshopUrl,
      blueprintPreview
    });
    
    const emailResult = await resend.emails.send({
      from: "Teho AI <noreply@teho.ai>",
      to: [email],
      reply_to: email, // Add reply-to header to avoid spam filters
      subject: `Workshop Created: ${summary}`,
      html: emailHtml,
    });
    
    console.log("Email send result:", JSON.stringify(emailResult));
    console.log("Confirmation email sent to:", email);
  } catch (emailError) {
    console.error("Error sending confirmation email:", emailError);
    console.error("Error details:", JSON.stringify(emailError, null, 2));
    // Continue even if email fails
  }
}
