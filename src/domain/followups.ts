import type { LocalDay } from "./day";
import { addDays, daysBetween } from "./day";
import { RULES } from "./rules";

/** What the engine needs to know about a job in the pipeline. All dates are local days. */
export type TrackedJob = {
  id: string;
  appliedOn: LocalDay;
  /** The day it first left "applied" (a reply, rejection, ghosted…), or null if still waiting. */
  leftAppliedOn: LocalDay | null;
  /** Days a follow-up was sent, in any order. */
  followUpsSentOn: readonly LocalDay[];
};

export type FollowUp = {
  jobId: string;
  /** 1 for the first reminder, 2 for the second. */
  number: number;
  dueOn: LocalDay;
  /** When the matching follow-up was sent (can be before it was due), or null. */
  doneOn: LocalDay | null;
  /** When it stopped being needed because the job left "applied" before it was done. */
  cancelledOn: LocalDay | null;
};

/**
 * The follow-ups a job needs: one per entry in RULES.followUpAfterDays, as long as
 * the job is still waiting for a reply on the due day. The nth follow-up sent
 * satisfies the nth reminder, even if it was sent early.
 */
export function followUpsFor(job: TrackedJob): FollowUp[] {
  const sent = [...job.followUpsSentOn].sort();
  const followUps: FollowUp[] = [];

  RULES.followUpAfterDays.forEach((afterDays, index) => {
    const dueOn = addDays(job.appliedOn, afterDays);
    // A reply on or before the due day means no follow-up is needed.
    if (job.leftAppliedOn !== null && job.leftAppliedOn <= dueOn) return;

    const doneOn = sent[index] ?? null;
    const cancelledOn =
      job.leftAppliedOn !== null && (doneOn === null || doneOn > job.leftAppliedOn)
        ? job.leftAppliedOn
        : null;

    followUps.push({ jobId: job.id, number: index + 1, dueOn, doneOn, cancelledOn });
  });

  return followUps;
}

/** Still waiting to be done at the end of `day`. Missed follow-ups stay outstanding until done. */
export function isOutstanding(followUp: FollowUp, day: LocalDay): boolean {
  return (
    followUp.dueOn <= day &&
    (followUp.doneOn === null || followUp.doneOn > day) &&
    (followUp.cancelledOn === null || followUp.cancelledOn > day)
  );
}

/** Done by the end of its due day (early counts too). Used for the 95% score. */
export function isDoneOnTime(followUp: FollowUp): boolean {
  return followUp.doneOn !== null && followUp.doneOn <= followUp.dueOn;
}

/** Still no reply after RULES.suggestGhostedAfterDays: suggest (never force) marking it ghosted. */
export function shouldSuggestGhosted(job: TrackedJob, today: LocalDay): boolean {
  return (
    job.leftAppliedOn === null && daysBetween(job.appliedOn, today) >= RULES.suggestGhostedAfterDays
  );
}

/** Every follow-up still waiting at the end of `day`, oldest due first. */
export function outstandingFollowUps(jobs: readonly TrackedJob[], day: LocalDay): FollowUp[] {
  return jobs
    .flatMap(followUpsFor)
    .filter((followUp) => isOutstanding(followUp, day))
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn));
}
