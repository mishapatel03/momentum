import { Settings } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Missions } from "@/features/progress/components/missions";
import { getTodayProgress } from "@/features/progress/queries";

export const metadata: Metadata = {
  title: "Today · Momentum",
};

export default function TodayPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Suspense fallback={<PageHeader title="Today" description="Loading your missions…" />}>
        <TodayLoader />
      </Suspense>
    </div>
  );
}

async function TodayLoader() {
  const progress = await getTodayProgress();

  if (progress.kind === "needs-setup") {
    return (
      <>
        <PageHeader title="Today" />
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed p-6">
          <h2 className="font-semibold">Set up your challenge</h2>
          <p className="text-sm text-muted-foreground">
            Pick your timezone, start date and daily target, and your missions will appear here.
          </p>
          <Button asChild>
            <Link href="/settings">
              <Settings aria-hidden />
              Go to Settings
            </Link>
          </Button>
        </div>
      </>
    );
  }

  if (progress.kind === "not-started") {
    return (
      <PageHeader
        title="Today"
        description={`Your challenge starts on ${formatDay(progress.startDay)}. Rest up!`}
      />
    );
  }

  return (
    <>
      <PageHeader title="Today" description={formatDay(progress.today)} />
      <Missions
        day={progress.todayResult}
        checkIn={progress.checkIn}
        followUps={progress.followUps}
        ghostSuggestions={progress.ghostSuggestions}
      />
    </>
  );
}

/** Local days are plain calendar dates, so format them at UTC midnight to avoid shifting. */
function formatDay(day: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}
