import type { Metadata } from "next";
import { Suspense } from "react";

import { toLocalDay } from "@/domain/day";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { getSettings } from "@/features/settings/queries";
import { DAILY_TARGET } from "@/features/settings/schema";

export const metadata: Metadata = {
  title: "Settings · Momentum",
};

export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-4 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Set up your challenge.</p>
      </div>
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <SettingsLoader />
      </Suspense>
    </main>
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
