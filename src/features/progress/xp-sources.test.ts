import { describe, expect, it } from "vitest";

import type { ChallengeProgress } from "@/domain/challenge";
import type { DayResult } from "@/domain/scoring";

import { countXpSources } from "./xp-sources";

const challenge = { windows: [{ status: "passed" }, { status: "active" }] } as ChallengeProgress;
const days = [{ complete: true }, { complete: false }, { complete: true }] as DayResult[];

describe("countXpSources", () => {
  it("counts each source", () => {
    const sources = countXpSources({
      pipelineJobCount: 7,
      checkInCount: 4,
      days,
      challenge,
      events: [
        { job_id: "a", type: "follow_up_sent", to_status: null },
        { job_id: "b", type: "follow_up_sent", to_status: null },
        { job_id: "a", type: "status_change", to_status: "response" },
        { job_id: "a", type: "status_change", to_status: "interview" },
      ],
    });
    expect(sources).toEqual({
      applications: 7,
      followUps: 2,
      checkIns: 4,
      completeDays: 2,
      responses: 1,
      interviews: 1,
      offers: 0,
      celebrations: 1,
    });
  });

  it("counts a milestone once per job, even if the card moved back and forth", () => {
    const sources = countXpSources({
      pipelineJobCount: 1,
      checkInCount: 0,
      days: [],
      challenge: { windows: [] } as unknown as ChallengeProgress,
      events: [
        { job_id: "a", type: "status_change", to_status: "interview" },
        { job_id: "a", type: "status_change", to_status: "response" },
        { job_id: "a", type: "status_change", to_status: "interview" },
      ],
    });
    expect(sources.interviews).toBe(1);
  });
});
