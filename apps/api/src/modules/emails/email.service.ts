import { render } from "@react-email/render";
import { WelcomeEmail } from "@repo/emails";
import nodemailer from "nodemailer";
import { appConfig } from "src/config/app.config";
import { QueueableService } from "src/lib/queueable";
import { EmailTemplate, type EmailTemplatePropsMap } from "types";

export interface SendEmailOptions<T extends keyof EmailTemplatePropsMap = keyof EmailTemplatePropsMap> {
  to: string | string[];
  subject: string;
  template: T;
  props: EmailTemplatePropsMap[T];
}

class EmailService extends QueueableService<SendEmailOptions> {
  readonly jobName = "email";

  private transporter: nodemailer.Transporter;

  constructor() {
    super();
    this.transporter = nodemailer.createTransport({
      host: appConfig.SMTP_HOST,
      port: appConfig.SMTP_PORT,
      auth:
        appConfig.SMTP_USER && appConfig.SMTP_PASS
          ? {
              user: appConfig.SMTP_USER,
              pass: appConfig.SMTP_PASS,
            }
          : undefined,
    });
  }

  protected async execute({ to, subject, template, props }: SendEmailOptions): Promise<void> {
    const html = await this.renderTemplate(template, props);

    await this.transporter.sendMail({
      from: appConfig.EMAIL_FROM,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    });
  }

  private async renderTemplate<T extends keyof EmailTemplatePropsMap>(
    template: T,
    props: EmailTemplatePropsMap[T],
  ): Promise<string> {
    switch (template) {
      case EmailTemplate.WELCOME:
        return await render(WelcomeEmail(props));
      default:
        throw new Error(`Template ${String(template)} not found`);
    }
  }
}

export const emailService = new EmailService();
