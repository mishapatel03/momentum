import { Settings } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { LevelBar } from "@/features/progress/components/level-bar";
import { Missions } from "@/features/progress/components/missions";
import { ProgressStats } from "@/features/progress/components/progress-stats";
import { getTodayProgress } from "@/features/progress/queries";
import { formatDay } from "@/lib/format";

export const metadata: Metadata = {
  title: "Today · Momentum",
};

export default function TodayPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
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
      <LevelBar level={progress.level} />
      <ProgressStats streak={progress.streak} challenge={progress.challenge} />
      <Missions
        day={progress.todayResult}
        checkIn={progress.checkIn}
        followUps={progress.followUps}
        ghostSuggestions={progress.ghostSuggestions}
      />
    </>
  );
}
