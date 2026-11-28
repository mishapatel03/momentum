import { describe, expect, it } from "vitest";

import type { FactRows } from "./facts";
import { toScoringFacts } from "./facts";

const empty: FactRows = { targets: [], jobs: [], events: [], checkins: [] };

describe("toScoringFacts", () => {
  it("converts timestamps to the user's local day, not UTC", () => {
    // 20:00 UTC on Nov 26 is Nov 27 in India.
    const facts = toScoringFacts(
      { ...empty, jobs: [{ id: "a", status: "applied", applied_at: "2026-11-26T20:00:00Z" }] },
      "Asia/Kolkata",
    );
    expect(facts.jobs[0]?.appliedOn).toBe("2026-11-27");
  });

  it("uses the first move away from 'applied' as the reply day", () => {
    const facts = toScoringFacts(
      {
        ...empty,
        jobs: [{ id: "a", status: "applied", applied_at: "2026-11-01T10:00:00Z" }],
        events: [
          // Out of order on purpose; the later one must not win.
          {
            job_id: "a",
            type: "status_change",
            from_status: "applied",
            occurred_at: "2026-11-20T10:00:00Z",
          },
          {
            job_id: "a",
            type: "status_change",
            from_status: "applied",
            occurred_at: "2026-11-05T10:00:00Z",
          },
          {
            job_id: "a",
            type: "status_change",
            from_status: "inbox",
            occurred_at: "2026-11-01T10:00:00Z",
          },
        ],
      },
      "UTC",
    );
    expect(facts.jobs[0]?.leftAppliedOn).toBe("2026-11-05");
  });

  it("collects follow-up days per job", () => {
    const facts = toScoringFacts(
      {
        ...empty,
        jobs: [{ id: "a", status: "applied", applied_at: "2026-11-01T10:00:00Z" }],
        events: [
          {
            job_id: "a",
            type: "follow_up_sent",
            from_status: null,
            occurred_at: "2026-11-08T10:00:00Z",
          },
          {
            job_id: "a",
            type: "follow_up_sent",
            from_status: null,
            occurred_at: "2026-11-15T10:00:00Z",
          },
        ],
      },
      "UTC",
    );
    expect(facts.jobs[0]?.followUpsSentOn).toEqual(["2026-11-08", "2026-11-15"]);
  });

  it("treats a moved job with no logged move as already answered", () => {
    const facts = toScoringFacts(
      { ...empty, jobs: [{ id: "a", status: "interview", applied_at: "2026-11-01T10:00:00Z" }] },
      "UTC",
    );
    expect(facts.jobs[0]?.leftAppliedOn).toBe("2026-11-01");
  });

  it("keeps check-in days and targets as local days", () => {
    const facts = toScoringFacts(
      {
        ...empty,
        targets: [{ daily_apply_target: 5, effective_from: "2026-11-01" }],
        checkins: [{ day: "2026-11-02" }],
      },
      "UTC",
    );
    expect(facts.targets).toEqual([{ dailyApplyTarget: 5, effectiveFrom: "2026-11-01" }]);
    expect(facts.checkInDays.has("2026-11-02" as never)).toBe(true);
  });
});
