import { EmailLayout } from "@emails/layouts/email-layout";
import { Button, Heading, Hr, Link, Section, Text } from "@react-email/components";
import { AppInfo, type EmailTemplate, type EmailTemplatePropsMap } from "@repo/types";
import type { JSX } from "react";

interface Props {
  name?: string;
  verificationUrl?: string;
}

export const PreviewProps: Props = {
  name: "Prios",
  verificationUrl: "https://elysia.dev/verify?token=example-token",
};

export default function WelcomeEmail({ name, verificationUrl }: EmailTemplatePropsMap[EmailTemplate.WELCOME]) {
  const greetingName = name?.trim() ? `, ${name.trim()}` : "";
  const previewText = verificationUrl
    ? `Welcome to ${AppInfo.appName} — verify your email to get started.`
    : `Welcome to ${AppInfo.appName} — your account is ready.`;

  const primaryHref = verificationUrl ?? AppInfo.appUrl;
  const primaryLabel = verificationUrl ? "Verify email address" : "Go to your account";

  let introMessage: JSX.Element;
  if (verificationUrl) {
    introMessage = <>To keep your account secure, please verify your email address.</>;
  } else {
    introMessage = <>Your account is ready to use.</>;
  }

  return (
    <EmailLayout previewText={previewText}>
      <Heading className="my-2 text-[22px] text-slate-900 leading-7">
        Welcome to {AppInfo.appName}
        {greetingName} 👋
      </Heading>

      <Text className="mb-4 text-slate-700 text-sm leading-[22px]">We’re excited to have you here. {introMessage}</Text>

      {verificationUrl ? (
        <>
          <Section className="my-4">
            <Button
              className="inline-block rounded-xl bg-slate-900 px-4 py-3 font-semibold text-sm text-white no-underline"
              href={primaryHref ?? "#"}
            >
              {primaryLabel}
            </Button>
          </Section>

          <Text className="mt-2 text-slate-600 text-xs leading-[18px]">
            This link will verify your email and activate your account.
          </Text>

          <Text className="mt-3 text-slate-500 text-xs leading-[18px]">
            If the button doesn’t work, copy and paste this link into your browser:
          </Text>

          <Text className="mt-2 break-all text-xs leading-[18px]">
            <Link className="text-blue-600 underline" href={verificationUrl ?? "#"}>
              {verificationUrl ?? "(missing verificationUrl)"}
            </Link>
          </Text>

          <Hr className="my-5 border-slate-200" />

          <Text className="mt-3 text-slate-500 text-xs leading-[18px]">
            If you didn’t create an account, you can ignore this email.
          </Text>
        </>
      ) : (
        <>
          {AppInfo.appUrl ? (
            <Section className="my-4">
              <Button
                className="inline-block rounded-xl bg-slate-900 px-4 py-3 font-semibold text-sm text-white no-underline"
                href={primaryHref}
              >
                {primaryLabel}
              </Button>
            </Section>
          ) : null}

          <Hr className="my-5 border-slate-200" />

          <Text className="mt-3 text-slate-500 text-xs leading-[18px]">
            Tip: If you ever run into issues signing in, try using the same provider you used to register.
          </Text>
        </>
      )}
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = PreviewProps;
