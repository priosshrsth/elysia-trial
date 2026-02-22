import { emailService } from "src/modules/emails/email.service";
import { EmailTemplate } from "types";

async function testEmail() {
  console.log("Testing email sending...");
  try {
    await emailService.enqueue({
      to: "test@example.com",
      subject: "Test Welcome Email",
      template: EmailTemplate.WELCOME,
      props: {
        name: "Test User",
        verificationUrl: "https://example.com/verify",
      },
    });
    console.log("Email enqueued successfully!");
  } catch (error) {
    console.error("Failed to enqueue email:", error);
  }
}

testEmail();
