import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { toLocalDay } from "@/domain/day";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { getSettings } from "@/features/settings/queries";
import { DAILY_TARGET } from "@/features/settings/schema";

export const metadata: Metadata = {
  title: "Settings · Momentum",
};

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Set up your challenge." />
      <div className="max-w-lg">
        <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
          <SettingsLoader />
        </Suspense>
      </div>
      {/* On desktop, logout lives in the sidebar. */}
      <div className="border-t pt-6 md:hidden">
        <LogoutButton className="w-full" />
      </div>
    </>
  );
}

async function SettingsLoader() {
  const settings = await getSettings();
  const timezone = settings?.timezone ?? null;
  const today = toLocalDay(new Date(), timezone ?? "UTC");

  // Built on the server so the option list is identical on server and client.
  const timezones = withUtc(Intl.supportedValuesOf("timeZone"), timezone);

  return (
    <SettingsForm
      timezone={timezone}
      challengeStartDate={settings?.challengeStartDate ?? today}
      dailyApplyTarget={settings?.dailyApplyTarget ?? DAILY_TARGET.default}
      today={today}
      timezones={timezones}
    />
  );
}

function withUtc(zones: string[], saved: string | null): string[] {
  const all = new Set(zones);
  all.add("UTC");
  if (saved) all.add(saved);
  return [...all].sort();
}
