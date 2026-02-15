import { type ZodType, z } from "zod";

export enum EmailTemplate {
  WELCOME = "welcomeEmail",
}

export const EmailTemplatePropsSchemaMap = Object.freeze({
  [EmailTemplate.WELCOME]: z.object({
    name: z.string(),
    verificationUrl: z.url().nullish(),
  }),
} satisfies Record<EmailTemplate, ZodType>);

export type EmailTemplatePropsMap = Record<
  EmailTemplate,
  z.input<(typeof EmailTemplatePropsSchemaMap)[EmailTemplate]> & { plainText?: string }
>;
