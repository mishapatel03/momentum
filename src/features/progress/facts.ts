import type { LocalDay } from "@/domain/day";
import { toLocalDay } from "@/domain/day";
import type { TrackedJob } from "@/domain/followups";
import type { JobStatus } from "@/domain/jobs";
import type { ScoringFacts } from "@/domain/scoring";

/** Raw rows as they come from the database (timestamps in UTC). */
export type FactRows = {
  targets: readonly { daily_apply_target: number; effective_from: string }[];
  /** Pipeline jobs only. */
  jobs: readonly { id: string; status: JobStatus; applied_at: string }[];
  events: readonly {
    job_id: string;
    type: "status_change" | "follow_up_sent";
    from_status: JobStatus | null;
    occurred_at: string;
  }[];
  checkins: readonly { day: string }[];
};

/**
 * The one place where database timestamps become local days for the scoring engine.
 * Everything downstream works in the user's calendar days only.
 */
export function toScoringFacts(rows: FactRows, timeZone: string): ScoringFacts {
  const localDay = (timestamp: string) => toLocalDay(new Date(timestamp), timeZone);

  const leftApplied = new Map<string, LocalDay>();
  const followUps = new Map<string, LocalDay[]>();

  // Oldest first, so the first status change away from "applied" wins.
  const events = [...rows.events].sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));
  for (const event of events) {
    const day = localDay(event.occurred_at);
    if (event.type === "follow_up_sent") {
      followUps.set(event.job_id, [...(followUps.get(event.job_id) ?? []), day]);
    } else if (event.from_status === "applied" && !leftApplied.has(event.job_id)) {
      leftApplied.set(event.job_id, day);
    }
  }

  const jobs: TrackedJob[] = rows.jobs.map((job) => {
    const appliedOn = localDay(job.applied_at);
    return {
      id: job.id,
      appliedOn,
      // Safety net: a job no longer "applied" without a logged move is treated as answered.
      leftAppliedOn: leftApplied.get(job.id) ?? (job.status === "applied" ? null : appliedOn),
      followUpsSentOn: followUps.get(job.id) ?? [],
    };
  });

  return {
    targets: rows.targets.map((row) => ({
      dailyApplyTarget: row.daily_apply_target,
      effectiveFrom: row.effective_from as LocalDay,
    })),
    jobs,
    checkInDays: new Set(rows.checkins.map((row) => row.day as LocalDay)),
  };
}
