import { BarChart3 } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { DailyChart } from "@/features/stats/components/daily-chart";
import { FunnelChart } from "@/features/stats/components/funnel-chart";
import { PlatformTable } from "@/features/stats/components/platform-table";
import { StatTiles } from "@/features/stats/components/stat-tiles";
import { CHART_DAYS, getStats } from "@/features/stats/queries";

export const metadata: Metadata = {
  title: "Stats · Momentum",
};

export default function StatsPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <PageHeader title="Stats" description="Is it working? Where do replies come from?" />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Crunching numbers…</p>}>
        <StatsLoader />
      </Suspense>
    </div>
  );
}

async function StatsLoader() {
  const stats = await getStats();

  if (stats.applied === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
        <BarChart3 className="size-6" aria-hidden />
        <p>Your stats appear after your first application. Go get it! 💪</p>
      </div>
    );
  }

  return (
    <>
      <StatTiles stats={stats} />
      <Section title={`Applications, last ${CHART_DAYS} days`}>
        <DailyChart days={stats.daily} />
      </Section>
      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Funnel" note="Each % is the share of the stage above.">
          <FunnelChart stages={stats.funnel} />
        </Section>
        <Section title="By platform" note="Where replies actually come from.">
          <PlatformTable rows={stats.platforms} />
        </Section>
      </div>
    </>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {note && <p className="text-sm text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  );
}
