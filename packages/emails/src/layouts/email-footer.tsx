import { Hr, Link, Text } from "@react-email/components";
import { AppInfo } from "@repo/types";

export function EmailFooter() {
  return (
    <>
      <Hr className="my-5 border-slate-200" />

      <Text className="m-0 text-slate-600 text-xs leading-[18px]">
        Need help?{" "}
        {AppInfo.supportUrl ? (
          <Link className="text-blue-600 underline" href={AppInfo.supportUrl}>
            Contact support
          </Link>
        ) : (
          <>Reply to this email.</>
        )}
      </Text>

      <Text className="mt-2 text-slate-400 text-xs leading-[18px]">
        © {new Date().getFullYear()} {AppInfo.appName}. All rights reserved.
      </Text>
    </>
  );
}
