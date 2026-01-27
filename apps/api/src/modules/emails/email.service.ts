import { render } from "@react-email/render";
import { WelcomeEmail } from "@repo/emails";
import nodemailer from "nodemailer";
import { appConfig } from "src/config/app.config";
import { EmailTemplate, type EmailTemplatePropsMap } from "types";

interface SendEmailOptions<T extends keyof EmailTemplatePropsMap> {
  to: string | string[];
  subject: string;
  template: T;
  props: EmailTemplatePropsMap[T];
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
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

  async sendEmail<T extends keyof EmailTemplatePropsMap>({ to, subject, template, props }: SendEmailOptions<T>) {
    const html = await this.renderTemplate(template, props);

    const info = await this.transporter.sendMail({
      from: appConfig.EMAIL_FROM,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    });

    return info;
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
