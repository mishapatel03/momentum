import "server-only";

import type { LocalDay } from "@/domain/day";
import { addDays, toLocalDay } from "@/domain/day";
import type { JobStatus } from "@/domain/jobs";
import type { DailyApplications, FunnelStage, PlatformRow, StatsJob } from "@/domain/stats";
import { computeDailyApplications, computeFunnel, computePlatformStats } from "@/domain/stats";
import { requireUser } from "@/features/auth/session";
import { requestTime } from "@/lib/request-time";
import { createClient } from "@/lib/supabase/server";

export const CHART_DAYS = 30;

export type Stats = {
  applied: number;
  replyRate: number | null;
  interviews: number;
  offers: number;
  funnel: FunnelStage[];
  platforms: PlatformRow[];
  daily: DailyApplications[];
};

export async function getStats(): Promise<Stats> {
  const now = await requestTime();
  const user = await requireUser();
  const supabase = await createClient();

  const [settings, targets, jobs, events] = await Promise.all([
    supabase.from("settings").select("timezone").eq("user_id", user.id).maybeSingle(),
    supabase.from("targets").select("daily_apply_target, effective_from").eq("user_id", user.id),
    supabase
      .from("jobs")
      .select("id, platform, status, applied_at")
      .eq("user_id", user.id)
      .neq("status", "inbox"),
    supabase
      .from("job_events")
      .select("job_id, to_status")
      .eq("user_id", user.id)
      .eq("type", "status_change"),
  ]);
  for (const result of [settings, targets, jobs, events]) {
    if (result.error) throw result.error;
  }

  const timeZone = settings.data?.timezone ?? "UTC";
  const reachedByJob = new Map<string, Set<JobStatus>>();
  for (const event of events.data ?? []) {
    if (!event.to_status) continue;
    const reached = reachedByJob.get(event.job_id) ?? new Set<JobStatus>();
    reached.add(event.to_status);
    reachedByJob.set(event.job_id, reached);
  }

  const statsJobs: StatsJob[] = (jobs.data ?? []).flatMap((job) => {
    if (!job.applied_at) return [];
    const reached = new Set(reachedByJob.get(job.id));
    reached.add("applied");
    reached.add(job.status);
    return [
      {
        platform: job.platform,
        appliedOn: toLocalDay(new Date(job.applied_at), timeZone),
        reached,
      },
    ];
  });

  const funnel = computeFunnel(statsJobs);
  const today = toLocalDay(now, timeZone);
  const replied = funnel.find((stage) => stage.key === "replied")?.count ?? 0;

  return {
    applied: statsJobs.length,
    replyRate: statsJobs.length > 0 ? Math.round((replied / statsJobs.length) * 100) : null,
    interviews: funnel.find((stage) => stage.key === "interview")?.count ?? 0,
    offers: funnel.find((stage) => stage.key === "offer")?.count ?? 0,
    funnel,
    platforms: computePlatformStats(statsJobs),
    daily: computeDailyApplications(
      statsJobs,
      (targets.data ?? []).map((row) => ({
        dailyApplyTarget: row.daily_apply_target,
        effectiveFrom: row.effective_from as LocalDay,
      })),
      addDays(today, -(CHART_DAYS - 1)),
      today,
    ),
  };
}
