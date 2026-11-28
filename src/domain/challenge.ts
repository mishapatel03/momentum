import type { LocalDay } from "./day";
import { addDays, daysBetween } from "./day";
import { RULES } from "./rules";
import type { DayResult } from "./scoring";

export type ChallengeWindow = {
  /** 1 for the first 15 days, 2 for the next, … */
  number: number;
  start: LocalDay;
  /** Last day, including any 2-day extensions. */
  end: LocalDay;
  extensions: number;
  status: "passed" | "active";
  tasksDue: number;
  tasksDone: number;
  /** Rounded down, so 94.9% never shows as 95%. */
  percent: number;
  /**
   * For the active window: the score over finished days only (through yesterday), so the
   * number shown doesn't dip every morning while today's tasks are still at zero.
   * Null on the window's first day. Equal to `percent` for passed windows.
   */
  settledPercent: number | null;
};

export type ChallengeProgress = {
  /** "Day N of 30" (can go past 30: the challenge keeps going). */
  dayNumber: number;
  windows: ChallengeWindow[];
  /** The window today belongs to. */
  current: ChallengeWindow;
  /** Days left in the current window, counting today. */
  daysLeft: number;
};

/**
 * Splits the challenge into 15-day windows. A finished window that hits 95% passes
 * (celebration!); one that misses is extended by 2 days and re-scored, as often as needed.
 * The next window starts the day after the previous one closes.
 *
 * `days` must cover every day from `start` to `today`, in order.
 */
export function computeChallenge(
  start: LocalDay,
  today: LocalDay,
  days: readonly DayResult[],
): ChallengeProgress {
  if (today < start) throw new RangeError("The challenge hasn't started yet");
  const byDay = new Map(days.map((day) => [day.day, day]));

  const windows: ChallengeWindow[] = [];
  let windowStart = start;

  for (let number = 1; ; number++) {
    let end = addDays(windowStart, RULES.windowDays - 1);
    let extensions = 0;

    // A window is only judged once its last day is over.
    while (end < today && !passes(tally(windowStart, end, byDay))) {
      end = addDays(end, RULES.extensionDays);
      extensions++;
    }

    if (end >= today) {
      const current = window(number, windowStart, end, extensions, "active", byDay, today);
      const yesterday = addDays(today, -1);
      current.settledPercent =
        yesterday < windowStart ? null : percentOf(tally(windowStart, yesterday, byDay));
      windows.push(current);
      return {
        dayNumber: daysBetween(start, today) + 1,
        windows,
        current,
        daysLeft: daysBetween(today, end) + 1,
      };
    }

    windows.push(window(number, windowStart, end, extensions, "passed", byDay, end));
    windowStart = addDays(end, 1);
  }
}

function window(
  number: number,
  start: LocalDay,
  end: LocalDay,
  extensions: number,
  status: ChallengeWindow["status"],
  byDay: ReadonlyMap<LocalDay, DayResult>,
  scoredThrough: LocalDay,
): ChallengeWindow {
  const totals = tally(start, scoredThrough, byDay);
  const percent = percentOf(totals);
  return { number, start, end, extensions, status, ...totals, percent, settledPercent: percent };
}

function percentOf({ tasksDue, tasksDone }: { tasksDue: number; tasksDone: number }): number {
  return tasksDue === 0 ? 0 : Math.floor((tasksDone * 100) / tasksDue);
}

function tally(from: LocalDay, to: LocalDay, byDay: ReadonlyMap<LocalDay, DayResult>) {
  let tasksDue = 0;
  let tasksDone = 0;
  for (let day = from; day <= to; day = addDays(day, 1)) {
    const result = byDay.get(day);
    if (!result) throw new RangeError(`Missing score for ${day}`);
    tasksDue += result.tasksDue;
    tasksDone += result.tasksDone;
  }
  return { tasksDue, tasksDone };
}

/** Integer maths, so floating point can never round a 94.99% into a pass. */
function passes({ tasksDue, tasksDone }: { tasksDue: number; tasksDone: number }): boolean {
  return tasksDone * 100 >= tasksDue * RULES.passPercent;
}
