import { describe, expect, it } from "vitest";

import type { LocalDay } from "./day";
import type { TrackedJob } from "./followups";
import type { ScoringFacts } from "./scoring";
import { scoreDays } from "./scoring";

const d = (value: string) => value as LocalDay;

function applications(day: string, count: number, prefix = day): TrackedJob[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i}`,
    appliedOn: d(day),
    leftAppliedOn: d(day), // got a reply the same day, so no follow-ups to worry about
    followUpsSentOn: [],
  }));
}

function facts(overrides: Partial<ScoringFacts> = {}): ScoringFacts {
  return {
    targets: [{ dailyApplyTarget: 3, effectiveFrom: d("2026-11-01") }],
    jobs: [],
    checkInDays: new Set(),
    ...overrides,
  };
}

function scoreOne(day: string, input: ScoringFacts) {
  return scoreDays(d(day), d(day), input)[0]!;
}

describe("scoreDays", () => {
  it("completes a day with the target met, no follow-ups waiting and a check-in", () => {
    const day = scoreOne(
      "2026-11-01",
      facts({ jobs: applications("2026-11-01", 3), checkInDays: new Set([d("2026-11-01")]) }),
    );
    expect(day).toMatchObject({ applied: 3, target: 3, tasksDue: 4, tasksDone: 4, complete: true });
  });

  it("isn't complete without the check-in", () => {
    const day = scoreOne("2026-11-01", facts({ jobs: applications("2026-11-01", 3) }));
    expect(day).toMatchObject({ complete: false, tasksDone: 3 });
  });

  it("isn't complete when short of the target", () => {
    const day = scoreOne(
      "2026-11-01",
      facts({ jobs: applications("2026-11-01", 2), checkInDays: new Set([d("2026-11-01")]) }),
    );
    expect(day).toMatchObject({ complete: false, tasksDone: 3, tasksDue: 4 });
  });

  it("doesn't award extra score for applying above target", () => {
    const day = scoreOne("2026-11-01", facts({ jobs: applications("2026-11-01", 9) }));
    expect(day.tasksDone).toBe(3);
  });

  it("uses the target that applied on each day", () => {
    const days = scoreDays(
      d("2026-11-01"),
      d("2026-11-02"),
      facts({
        targets: [
          { dailyApplyTarget: 3, effectiveFrom: d("2026-11-01") },
          { dailyApplyTarget: 8, effectiveFrom: d("2026-11-02") },
        ],
      }),
    );
    expect(days.map((day) => day.target)).toEqual([3, 8]);
  });

  describe("with a follow-up due", () => {
    const waiting: TrackedJob = {
      id: "waiting",
      appliedOn: d("2026-10-25"), // first follow-up due Nov 1
      leftAppliedOn: null,
      followUpsSentOn: [],
    };
    const doneDay = (sent: string[] = []) =>
      facts({
        jobs: [...applications("2026-11-01", 3), { ...waiting, followUpsSentOn: sent.map(d) }],
        checkInDays: new Set([d("2026-11-01"), d("2026-11-02")]),
      });

    it("adds it to the day's tasks and blocks completion until it's done", () => {
      expect(scoreOne("2026-11-01", doneDay())).toMatchObject({
        followUpsDue: 1,
        followUpsOutstanding: 1,
        tasksDue: 5,
        complete: false,
      });
      expect(scoreOne("2026-11-01", doneDay(["2026-11-01"]))).toMatchObject({
        followUpsDoneOnTime: 1,
        tasksDone: 5,
        complete: true,
      });
    });

    it("keeps a missed follow-up outstanding (blocking later days) but counts it only once", () => {
      const [due, next] = scoreDays(d("2026-11-01"), d("2026-11-02"), doneDay());
      expect(due).toMatchObject({ followUpsDue: 1, followUpsOutstanding: 1 });
      expect(next).toMatchObject({ followUpsDue: 0, followUpsOutstanding: 1, complete: false });
    });

    it("a late follow-up unblocks the day it's done but doesn't score on time", () => {
      const [due, next] = scoreDays(d("2026-11-01"), d("2026-11-02"), doneDay(["2026-11-02"]));
      expect(due).toMatchObject({ followUpsDoneOnTime: 0 });
      expect(next).toMatchObject({ followUpsOutstanding: 0 });
    });
  });
});
