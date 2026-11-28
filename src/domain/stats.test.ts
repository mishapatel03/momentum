import { describe, expect, it } from "vitest";

import type { LocalDay } from "./day";
import type { JobPlatform, JobStatus } from "./jobs";
import type { StatsJob } from "./stats";
import { computeDailyApplications, computeFunnel, computePlatformStats } from "./stats";

const d = (value: string) => value as LocalDay;
const job = (platform: JobPlatform, reached: JobStatus[], appliedOn = "2026-11-26"): StatsJob => ({
  platform,
  appliedOn: d(appliedOn),
  reached: new Set<JobStatus>(["applied", ...reached]),
});

describe("computeFunnel", () => {
  const jobs = [
    job("linkedin", []),
    job("linkedin", ["ghosted"]),
    job("linkedin", ["rejected"]),
    job("indeed", ["response", "interview", "rejected"]),
    job("indeed", ["response", "interview", "offer"]),
  ];

  it("counts each stage, counting a rejection as a reply but not ghosting", () => {
    expect(computeFunnel(jobs).map((s) => [s.key, s.count])).toEqual([
      ["applied", 5],
      ["replied", 3],
      ["interview", 2],
      ["offer", 1],
    ]);
  });

  it("gives the conversion from the previous stage", () => {
    expect(computeFunnel(jobs).map((s) => s.conversion)).toEqual([null, 60, 67, 50]);
  });

  it("uses the furthest stage ever reached, even after moving back", () => {
    // Interviewed, then moved back to response: still counts as an interview.
    const [, , interview] = computeFunnel([job("other", ["response", "interview"])]);
    expect(interview?.count).toBe(1);
  });

  it("has no conversion when the previous stage is empty", () => {
    expect(computeFunnel([]).map((s) => s.conversion)).toEqual([null, null, null, null]);
  });
});

describe("computePlatformStats", () => {
  it("sorts by applications and computes the reply rate", () => {
    const rows = computePlatformStats([
      job("indeed", ["response"]),
      job("linkedin", []),
      job("linkedin", ["rejected"]),
      job("linkedin", ["ghosted"]),
    ]);
    expect(rows).toEqual([
      { platform: "linkedin", applied: 3, replies: 1, replyRate: 33 },
      { platform: "indeed", applied: 1, replies: 1, replyRate: 100 },
    ]);
  });
});

describe("computeDailyApplications", () => {
  it("fills every day, including zero days, with that day's target", () => {
    const rows = computeDailyApplications(
      [job("other", [], "2026-11-27"), job("other", [], "2026-11-27")],
      [{ dailyApplyTarget: 5, effectiveFrom: d("2026-11-27") }],
      d("2026-11-26"),
      d("2026-11-28"),
    );
    expect(rows).toEqual([
      { day: "2026-11-26", count: 0, target: 5 }, // before the first change → first target
      { day: "2026-11-27", count: 2, target: 5 },
      { day: "2026-11-28", count: 0, target: 5 },
    ]);
  });
});
