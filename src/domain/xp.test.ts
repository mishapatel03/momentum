import { describe, expect, it } from "vitest";

import type { XpSources } from "./xp";
import { computeXp, LEVELS, levelFor } from "./xp";

const none: XpSources = {
  applications: 0,
  followUps: 0,
  checkIns: 0,
  completeDays: 0,
  responses: 0,
  interviews: 0,
  offers: 0,
  celebrations: 0,
};

describe("computeXp", () => {
  it("is zero with no activity", () => {
    expect(computeXp(none)).toBe(0);
  });

  it("adds up a typical complete day: 5 applications, check-in, day bonus", () => {
    expect(computeXp({ ...none, applications: 5, checkIns: 1, completeDays: 1 })).toBe(75);
  });

  it("rewards the big moments", () => {
    expect(computeXp({ ...none, responses: 1, interviews: 1, offers: 1, celebrations: 1 })).toBe(
      375,
    );
  });
});

describe("levelFor", () => {
  it("starts at level 1", () => {
    expect(levelFor(0)).toMatchObject({ number: 1, name: "Job Seeker", progress: 0 });
  });

  it("levels up exactly at the threshold", () => {
    expect(levelFor(99).number).toBe(1);
    expect(levelFor(100)).toMatchObject({ number: 2, name: "Go-Getter", progress: 0 });
  });

  it("reports progress towards the next level", () => {
    expect(levelFor(200)).toMatchObject({ number: 2, progress: 50, next: { minXp: 300 } });
  });

  it("caps at the top level", () => {
    const top = levelFor(99_999);
    expect(top).toMatchObject({ number: LEVELS.length, next: null, progress: 100 });
  });

  it("keeps level thresholds increasing, with growing gaps", () => {
    const gaps = LEVELS.slice(1).map((level, i) => level.minXp - LEVELS[i]!.minXp);
    expect(gaps.every((gap, i) => i === 0 || gap > gaps[i - 1]!)).toBe(true);
  });
});
