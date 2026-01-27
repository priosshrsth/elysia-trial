import { Section } from "@react-email/components";
import { AppInfo } from "@repo/types";

export function EmailHeader() {
  if (!AppInfo.logoUrl) return null;

  return (
    <Section className="mb-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={AppInfo.appName} className="block rounded-lg" height="40" src={AppInfo.logoUrl} width="40" />
    </Section>
  );
}
