import type { DayResult } from "./scoring";

export type Streak = {
  /** Consecutive complete days up to today (or up to yesterday while today is in progress). */
  current: number;
  best: number;
  todayComplete: boolean;
};

/**
 * `days` must be consecutive and end with today. Today never breaks the streak:
 * until midnight it's still in progress, so an incomplete today just doesn't add to it.
 */
export function computeStreak(days: readonly DayResult[]): Streak {
  const today = days.at(-1);
  const todayComplete = today?.complete ?? false;

  let current = 0;
  for (let i = days.length - (todayComplete ? 1 : 2); i >= 0 && days[i]?.complete; i--) {
    current++;
  }

  let best = 0;
  let run = 0;
  for (const day of days) {
    run = day.complete ? run + 1 : 0;
    best = Math.max(best, run);
  }

  return { current, best, todayComplete };
}
