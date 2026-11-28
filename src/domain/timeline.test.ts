import { describe, expect, it } from "vitest";

import { buildTimeline } from "./timeline";

const created = "2026-11-26T09:00:00Z";

describe("buildTimeline", () => {
  it("shows a saved entry for a job still in the inbox", () => {
    expect(buildTimeline(created, [])).toEqual([{ at: created, kind: "saved" }]);
  });

  it("tells the story of an inbox job that moved through the pipeline", () => {
    const timeline = buildTimeline(created, [
      { type: "status_change", from: "applied", to: "interview", at: "2026-11-30T10:00:00Z" },
      { type: "status_change", from: "inbox", to: "applied", at: "2026-11-26T12:00:00Z" },
      { type: "follow_up_sent", at: "2026-11-28T10:00:00Z" },
    ]);

    expect(timeline.map((e) => e.kind)).toEqual(["saved", "applied", "follow_up", "moved"]);
    expect(timeline.at(-1)?.status).toBe("interview");
  });

  it("starts with 'added as applied' when the job skipped the inbox", () => {
    const timeline = buildTimeline(created, [
      { type: "status_change", from: null, to: "applied", at: created },
    ]);
    expect(timeline).toEqual([{ at: created, kind: "added_applied" }]);
  });
});
