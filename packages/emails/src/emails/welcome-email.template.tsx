import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import type { JSX } from "react";

interface Props {
  name?: string;
  appName: string;
  requiresVerification: boolean;
  verificationUrl?: string;
  oauthProviderName?: string;
  appUrl?: string;
  supportUrl?: string;
  logoUrl?: string;
}

export const PreviewProps: Props = {
  name: "Prios",
  appName: "Elysia Trial",
  requiresVerification: true,
  verificationUrl: "https://yourapp.com/verify?token=example-token",
  oauthProviderName: "Google",
  appUrl: "https://yourapp.com/app",
  supportUrl: "https://yourapp.com/support",
  logoUrl: "https://placehold.co/80x80/png",
};

export default function WelcomeEmail({
  name,
  appName,
  requiresVerification,
  verificationUrl,
  oauthProviderName,
  appUrl,
  supportUrl,
  logoUrl,
}: Props) {
  const greetingName = name?.trim() ? `, ${name.trim()}` : "";
  const previewText = requiresVerification
    ? `Welcome to ${appName} — verify your email to get started.`
    : `Welcome to ${appName} — your account is ready.`;

  const primaryHref = requiresVerification ? verificationUrl : appUrl;
  const primaryLabel = requiresVerification ? "Verify email address" : "Go to your account";

  const isOAuthSignup = !requiresVerification && Boolean(oauthProviderName);

  let introMessage: JSX.Element;
  if (requiresVerification) {
    introMessage = <>To keep your account secure, please verify your email address.</>;
  } else if (isOAuthSignup) {
    introMessage = (
      <>
        You signed up with <strong>{oauthProviderName}</strong>, so you’re already verified.
      </>
    );
  } else {
    introMessage = <>Your account is ready to use.</>;
  }

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>

      <Tailwind>
        <Body className="m-0 bg-slate-50 py-6 font-sans">
          <Container className="mx-auto w-full max-w-[520px] rounded-xl border border-slate-200 bg-white p-6">
            {logoUrl ? (
              <Section className="mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={appName} className="block rounded-lg" height="40" src={logoUrl} width="40" />
              </Section>
            ) : null}

            <Heading className="my-2 text-[22px] text-slate-900 leading-7">
              Welcome to {appName}
              {greetingName} 👋
            </Heading>

            <Text className="mb-4 text-slate-700 text-sm leading-[22px]">
              We’re excited to have you here. {introMessage}
            </Text>

            {requiresVerification ? (
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
                {appUrl ? (
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

            <Hr className="my-5 border-slate-200" />

            <Text className="m-0 text-slate-600 text-xs leading-[18px]">
              Need help?{" "}
              {supportUrl ? (
                <Link className="text-blue-600 underline" href={supportUrl}>
                  Contact support
                </Link>
              ) : (
                <>Reply to this email.</>
              )}
            </Text>

            <Text className="mt-2 text-slate-400 text-xs leading-[18px]">
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Used by the React Email preview UI (when supported by your setup)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
WelcomeEmail.PreviewProps = PreviewProps;
