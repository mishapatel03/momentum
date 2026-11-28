import type { LocalDay } from "./day";
import { eachDay } from "./day";
import type { JobPlatform, JobStatus } from "./jobs";
import type { TargetChange } from "./targets";
import { targetOn } from "./targets";

/** A pipeline job and every status it has ever been in (current one included). */
export type StatsJob = {
  platform: JobPlatform;
  appliedOn: LocalDay;
  reached: ReadonlySet<JobStatus>;
};

/** Any answer at all, including a rejection. Ghosting is not a reply. */
const REPLY_STATUSES: readonly JobStatus[] = ["response", "interview", "offer", "rejected"];
const INTERVIEW_STATUSES: readonly JobStatus[] = ["interview", "offer"];

const hasAny = (job: StatsJob, statuses: readonly JobStatus[]) =>
  statuses.some((status) => job.reached.has(status));

export type FunnelStage = {
  key: "applied" | "replied" | "interview" | "offer";
  label: string;
  count: number;
  /** % of the previous stage that made it here (null for the first stage or an empty previous). */
  conversion: number | null;
};

export function computeFunnel(jobs: readonly StatsJob[]): FunnelStage[] {
  const counts = [
    { key: "applied", label: "Applied", count: jobs.length },
    {
      key: "replied",
      label: "Got a reply",
      count: jobs.filter((j) => hasAny(j, REPLY_STATUSES)).length,
    },
    {
      key: "interview",
      label: "Interview",
      count: jobs.filter((j) => hasAny(j, INTERVIEW_STATUSES)).length,
    },
    { key: "offer", label: "Offer", count: jobs.filter((j) => j.reached.has("offer")).length },
  ] as const;

  return counts.map((stage, index) => {
    const previous = counts[index - 1];
    return {
      ...stage,
      conversion: previous && previous.count > 0 ? percent(stage.count, previous.count) : null,
    };
  });
}

export type PlatformRow = {
  platform: JobPlatform;
  applied: number;
  replies: number;
  /** null when nothing was applied there. */
  replyRate: number | null;
};

/** Per-platform applications and reply rate, busiest platform first. */
export function computePlatformStats(jobs: readonly StatsJob[]): PlatformRow[] {
  const rows = new Map<JobPlatform, { applied: number; replies: number }>();
  for (const job of jobs) {
    const row = rows.get(job.platform) ?? { applied: 0, replies: 0 };
    row.applied += 1;
    if (hasAny(job, REPLY_STATUSES)) row.replies += 1;
    rows.set(job.platform, row);
  }
  return [...rows.entries()]
    .map(([platform, { applied, replies }]) => ({
      platform,
      applied,
      replies,
      replyRate: applied > 0 ? percent(replies, applied) : null,
    }))
    .sort((a, b) => b.applied - a.applied || a.platform.localeCompare(b.platform));
}

export type DailyApplications = { day: LocalDay; count: number; target: number | null };

/** Applications per day from `from` to `to`, with the target that applied each day. */
export function computeDailyApplications(
  jobs: readonly StatsJob[],
  targets: readonly TargetChange[],
  from: LocalDay,
  to: LocalDay,
): DailyApplications[] {
  const counts = new Map<LocalDay, number>();
  for (const job of jobs) counts.set(job.appliedOn, (counts.get(job.appliedOn) ?? 0) + 1);
  return eachDay(from, to).map((day) => ({
    day,
    count: counts.get(day) ?? 0,
    target: targetOn(targets, day),
  }));
}

/** Whole-number percentage, rounded to nearest. */
function percent(part: number, whole: number): number {
  return Math.round((part / whole) * 100);
}
