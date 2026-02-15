import { emailService } from "src/modules/emails/email.service";
import { EmailTemplate } from "types";

async function testEmail() {
  console.log("Testing email sending...");
  try {
    const info = await emailService.sendEmail({
      to: "test@example.com",
      subject: "Test Welcome Email",
      template: EmailTemplate.WELCOME,
      props: {
        name: "Test User",
        verificationUrl: "https://example.com/verify",
      },
    });
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

testEmail();
