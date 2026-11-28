import type { ChallengeProgress } from "@/domain/challenge";
import type { JobStatus } from "@/domain/jobs";
import type { DayResult } from "@/domain/scoring";
import type { XpSources } from "@/domain/xp";

type XpRows = {
  pipelineJobCount: number;
  events: readonly { job_id: string; type: string; to_status: JobStatus | null }[];
  checkInCount: number;
  days: readonly DayResult[];
  challenge: ChallengeProgress;
};

/** Counts every XP source from the user's history. Milestones count once per job. */
export function countXpSources(rows: XpRows): XpSources {
  const reached = (status: JobStatus) =>
    new Set(
      rows.events
        .filter((event) => event.type === "status_change" && event.to_status === status)
        .map((event) => event.job_id),
    ).size;

  return {
    applications: rows.pipelineJobCount,
    followUps: rows.events.filter((event) => event.type === "follow_up_sent").length,
    checkIns: rows.checkInCount,
    completeDays: rows.days.filter((day) => day.complete).length,
    responses: reached("response"),
    interviews: reached("interview"),
    offers: reached("offer"),
    celebrations: rows.challenge.windows.filter((window) => window.status === "passed").length,
  };
}
