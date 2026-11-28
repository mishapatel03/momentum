import { describe, expect, it } from "vitest";

import type { LocalDay } from "./day";
import type { DayResult } from "./scoring";
import { computeStreak } from "./streak";

/** Days from a pattern like "✓✓✗✓…", oldest first; the last one is today. */
function days(pattern: string): DayResult[] {
  return [...pattern].map((mark, i) => ({
    day: `2026-11-${String(i + 1).padStart(2, "0")}` as LocalDay,
    complete: mark === "✓",
    target: 1,
    applied: 0,
    followUpsDue: 0,
    followUpsDoneOnTime: 0,
    followUpsOutstanding: 0,
    checkedIn: false,
    tasksDue: 1,
    tasksDone: mark === "✓" ? 1 : 0,
  }));
}

describe("computeStreak", () => {
  it("counts today once it's complete", () => {
    expect(computeStreak(days("✗✓✓✓"))).toEqual({ current: 3, best: 3, todayComplete: true });
  });

  it("doesn't break the streak while today is still in progress", () => {
    expect(computeStreak(days("✗✓✓✗"))).toMatchObject({ current: 2, todayComplete: false });
  });

  it("resets after a missed day", () => {
    expect(computeStreak(days("✓✓✓✗✓✗"))).toMatchObject({ current: 1, best: 3 });
  });

  it("is zero on day one before finishing", () => {
    expect(computeStreak(days("✗"))).toEqual({ current: 0, best: 0, todayComplete: false });
  });
});
