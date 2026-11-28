import type { JobStatus } from "./jobs";

/** Pipeline columns, in board order. The inbox is not part of the pipeline. */
export const PIPELINE_STATUSES = [
  "applied",
  "response",
  "interview",
  "offer",
  "rejected",
  "ghosted",
] as const satisfies readonly JobStatus[];

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

export function isPipelineStatus(value: string): value is PipelineStatus {
  return (PIPELINE_STATUSES as readonly string[]).includes(value);
}

/**
 * A pipeline job can move to any other pipeline status, in any direction
 * (e.g. back from "ghosted" to "response" when they finally reply), but never to the inbox.
 */
export function canMove(from: JobStatus, to: JobStatus): boolean {
  return from !== to && isPipelineStatus(from) && isPipelineStatus(to);
}
