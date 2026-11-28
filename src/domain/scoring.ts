import type { LocalDay } from "./day";
import { eachDay } from "./day";
import type { FollowUp, TrackedJob } from "./followups";
import { followUpsFor, isDoneOnTime, isOutstanding } from "./followups";
import { RULES } from "./rules";
import type { TargetChange } from "./targets";
import { targetOn } from "./targets";

/** Everything the engine needs, already converted to local days by the data layer. */
export type ScoringFacts = {
  targets: readonly TargetChange[];
  /** Jobs in the pipeline; each one's `appliedOn` counts as an application that day. */
  jobs: readonly TrackedJob[];
  checkInDays: ReadonlySet<LocalDay>;
};

export type DayResult = {
  day: LocalDay;
  target: number;
  applied: number;
  /** Follow-ups that came due this day (each counts once for the score, on its due day). */
  followUpsDue: number;
  followUpsDoneOnTime: number;
  /** Follow-ups still waiting at the end of this day, including older missed ones. */
  followUpsOutstanding: number;
  checkedIn: boolean;
  /** Tasks for the 95% score: target + follow-ups due + check-in. */
  tasksDue: number;
  /** Applying above target doesn't earn extra. */
  tasksDone: number;
  /** All three missions done: counts for the streak. */
  complete: boolean;
};

/** Scores every day from `from` to `to`, inclusive. */
export function scoreDays(from: LocalDay, to: LocalDay, facts: ScoringFacts): DayResult[] {
  const followUps = facts.jobs.flatMap(followUpsFor);
  const applicationsByDay = countBy(facts.jobs.map((job) => job.appliedOn));

  return eachDay(from, to).map((day) => scoreDay(day, facts, followUps, applicationsByDay));
}

function scoreDay(
  day: LocalDay,
  facts: ScoringFacts,
  followUps: readonly FollowUp[],
  applicationsByDay: ReadonlyMap<LocalDay, number>,
): DayResult {
  const target = targetOn(facts.targets, day) ?? RULES.defaultDailyTarget;
  const applied = applicationsByDay.get(day) ?? 0;
  const dueToday = followUps.filter((followUp) => followUp.dueOn === day);
  const followUpsDoneOnTime = dueToday.filter(isDoneOnTime).length;
  const followUpsOutstanding = followUps.filter((followUp) => isOutstanding(followUp, day)).length;
  const checkedIn = facts.checkInDays.has(day);

  return {
    day,
    target,
    applied,
    followUpsDue: dueToday.length,
    followUpsDoneOnTime,
    followUpsOutstanding,
    checkedIn,
    tasksDue: target + dueToday.length + 1,
    tasksDone: Math.min(applied, target) + followUpsDoneOnTime + (checkedIn ? 1 : 0),
    complete: applied >= target && followUpsOutstanding === 0 && checkedIn,
  };
}

function countBy(days: readonly LocalDay[]): Map<LocalDay, number> {
  const counts = new Map<LocalDay, number>();
  for (const day of days) counts.set(day, (counts.get(day) ?? 0) + 1);
  return counts;
}
