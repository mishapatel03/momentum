import { describe, expect, it } from "vitest";

import { canMove, isPipelineStatus } from "./pipeline";

describe("canMove", () => {
  it("allows forward moves", () => {
    expect(canMove("applied", "interview")).toBe(true);
  });

  it("allows moving back within the pipeline", () => {
    expect(canMove("ghosted", "response")).toBe(true);
  });

  it("never allows moving to the inbox", () => {
    expect(canMove("applied", "inbox")).toBe(false);
  });

  it("doesn't move inbox jobs (they go through mark-as-applied)", () => {
    expect(canMove("inbox", "applied")).toBe(false);
  });

  it("treats moving to the same status as a no-op", () => {
    expect(canMove("offer", "offer")).toBe(false);
  });
});

describe("isPipelineStatus", () => {
  it("excludes the inbox and unknown values", () => {
    expect(isPipelineStatus("applied")).toBe(true);
    expect(isPipelineStatus("inbox")).toBe(false);
    expect(isPipelineStatus("hired")).toBe(false);
  });
});
