
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
  workshopUrl: string
): Promise<void> {
  try {
    // Generate agenda preview
    const agendaPreview = description.substring(0, 300) + (description.length > 300 ? '...' : '');
    
    // Extract host name from email
    const hostName = email.split('@')[0];
    
    console.log("Preparing to send email to:", email);
    console.log("Workshop URL:", workshopUrl);
    console.log("Agenda preview length:", agendaPreview.length);

    // Use the email template
    const emailHtml = agendaEmail({
      hostName,
      agendaPreview,
      editorUrl: workshopUrl
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
