import { Body, Container, Head, Html, Preview } from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import type { ReactNode } from "react";
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";

interface EmailLayoutProps {
  children: ReactNode;
  previewText?: string;
}

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      {previewText && <Preview>{previewText}</Preview>}
      <Tailwind>
        <Body className="m-0 bg-slate-50 py-6 font-sans">
          <Container className="mx-auto w-full max-w-[520px] rounded-xl border border-slate-200 bg-white p-6">
            <EmailHeader />
            {children}
            <EmailFooter />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
