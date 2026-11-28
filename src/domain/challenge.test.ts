import { describe, expect, it } from "vitest";

import { computeChallenge } from "./challenge";
import type { LocalDay } from "./day";
import { addDays, eachDay } from "./day";
import type { DayResult } from "./scoring";

const START = "2026-11-01" as LocalDay;

/**
 * One score per day from START; each day has 20 tasks. `done(n)` gives the tasks done on day n
 * (1-based). With 20 tasks a day, 19/20 is exactly 95%.
 */
function history(today: LocalDay, done: (dayNumber: number) => number): DayResult[] {
  return eachDay(START, today).map((day, i) => ({
    day,
    tasksDue: 20,
    tasksDone: done(i + 1),
    complete: false,
    target: 19,
    applied: 0,
    followUpsDue: 0,
    followUpsDoneOnTime: 0,
    followUpsOutstanding: 0,
    checkedIn: true,
  }));
}

const dayN = (n: number) => addDays(START, n - 1);

describe("computeChallenge", () => {
  it("starts on day 1 of window 1 with 15 days left", () => {
    const today = dayN(1);
    const progress = computeChallenge(
      START,
      today,
      history(today, () => 0),
    );
    expect(progress).toMatchObject({ dayNumber: 1, daysLeft: 15 });
    expect(progress.current).toMatchObject({ number: 1, end: dayN(15), status: "active" });
  });

  it("keeps window 1 active through its last day", () => {
    const today = dayN(15);
    const progress = computeChallenge(
      START,
      today,
      history(today, () => 0),
    );
    expect(progress.current).toMatchObject({ number: 1, extensions: 0 });
    expect(progress.daysLeft).toBe(1);
  });

  it("passes a window at exactly 95% and starts the next one", () => {
    const today = dayN(16);
    const progress = computeChallenge(
      START,
      today,
      history(today, () => 19),
    );
    expect(progress.windows[0]).toMatchObject({ status: "passed", percent: 95, end: dayN(15) });
    expect(progress.current).toMatchObject({ number: 2, start: dayN(16), end: dayN(30) });
  });

  it("extends a window by 2 days when it falls short", () => {
    // Days 1-15 at 18/20 = 90% → fails.
    const today = dayN(16);
    const progress = computeChallenge(
      START,
      today,
      history(today, () => 18),
    );
    expect(progress.windows).toHaveLength(1);
    expect(progress.current).toMatchObject({ number: 1, end: dayN(17), extensions: 1 });
  });

  it("passes after an extension when the extra days lift the score", () => {
    // Days 1-14 at 19/20, day 15 at 12/20 → 278/300 (92.6%), so it fails. Each 2-day
    // extension of perfect days adds 40/40: 93.5% → 94.2% → 94.7% → 95.2%, passing on day 23.
    const scores = (n: number) => (n <= 14 ? 19 : n === 15 ? 12 : 20);
    const today = dayN(26);
    const progress = computeChallenge(START, today, history(today, scores));
    expect(progress.windows[0]).toMatchObject({
      status: "passed",
      end: dayN(23),
      extensions: 4,
      percent: 95,
    });
    expect(progress.current).toMatchObject({ number: 2, start: dayN(24) });
  });

  it("never rounds 94.9% up to a pass", () => {
    // 299 of 315 = 94.92%
    const today = dayN(16);
    const days = history(today, () => 20).map((day, i) =>
      i < 15 ? { ...day, tasksDue: 21, tasksDone: i < 14 ? 20 : 19 } : day,
    );
    const progress = computeChallenge(START, today, days);
    expect(progress.current).toMatchObject({ number: 1, extensions: 1 });
  });

  it("reports the score so far for the active window", () => {
    const today = dayN(3);
    const progress = computeChallenge(
      START,
      today,
      history(today, () => 10),
    );
    expect(progress.current).toMatchObject({ tasksDue: 60, tasksDone: 30, percent: 50 });
  });

  it("counts days past 30 instead of stopping", () => {
    const today = dayN(31);
    expect(
      computeChallenge(
        START,
        today,
        history(today, () => 20),
      ).dayNumber,
    ).toBe(31);
  });

  it("rejects a date before the challenge starts", () => {
    expect(() => computeChallenge(START, addDays(START, -1), [])).toThrow(RangeError);
  });
});
