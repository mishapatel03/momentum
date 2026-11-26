import { describe, expect, it } from "vitest";

import type { LocalDay } from "./day";
import type { TargetChange } from "./targets";
import { targetOn } from "./targets";

const day = (value: string) => value as LocalDay;

const history: TargetChange[] = [
  { dailyApplyTarget: 8, effectiveFrom: day("2026-12-05") },
  { dailyApplyTarget: 5, effectiveFrom: day("2026-11-26") },
];

describe("targetOn", () => {
  it("returns null when there is no target yet", () => {
    expect(targetOn([], day("2026-11-26"))).toBeNull();
  });

  it("uses the target in effect on that day", () => {
    expect(targetOn(history, day("2026-11-26"))).toBe(5);
    expect(targetOn(history, day("2026-12-04"))).toBe(5);
  });

  it("switches on the day a change takes effect", () => {
    expect(targetOn(history, day("2026-12-05"))).toBe(8);
    expect(targetOn(history, day("2026-12-20"))).toBe(8);
  });

  it("falls back to the first target for days before any change", () => {
    expect(targetOn(history, day("2026-11-20"))).toBe(5);
  });
});
