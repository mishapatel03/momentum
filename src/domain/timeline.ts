import type { JobStatus } from "./jobs";

export type JobEvent =
  | { type: "status_change"; from: JobStatus | null; to: JobStatus; at: string }
  | { type: "follow_up_sent"; at: string };

export type TimelineEntry = {
  at: string;
  kind: "saved" | "added_applied" | "applied" | "moved" | "follow_up";
  /** The status moved to, for "moved" entries. */
  status?: JobStatus;
};

/**
 * Turns a job's raw event log into a readable history, oldest first.
 * A job created straight into the pipeline has a first event with `from: null`;
 * otherwise it started in the inbox, so the creation time becomes a "saved" entry.
 */
export function buildTimeline(createdAt: string, events: readonly JobEvent[]): TimelineEntry[] {
  const sorted = [...events].sort((a, b) => a.at.localeCompare(b.at));
  const first = sorted[0];
  const createdInPipeline = first?.type === "status_change" && first.from === null;

  const entries: TimelineEntry[] = createdInPipeline ? [] : [{ at: createdAt, kind: "saved" }];

  for (const event of sorted) {
    if (event.type === "follow_up_sent") {
      entries.push({ at: event.at, kind: "follow_up" });
    } else if (event.from === null) {
      entries.push({ at: event.at, kind: "added_applied" });
    } else if (event.from === "inbox") {
      entries.push({ at: event.at, kind: "applied" });
    } else {
      entries.push({ at: event.at, kind: "moved", status: event.to });
    }
  }
  return entries;
}
