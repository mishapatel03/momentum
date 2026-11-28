import { describe, expect, it } from "vitest";

import type { LocalDay } from "@/domain/day";

import { formatDay } from "./format";

describe("formatDay", () => {
  it("formats the calendar day as-is, whatever the server's timezone", () => {
    expect(formatDay("2026-12-01" as LocalDay)).toBe("Tuesday, December 1");
    expect(formatDay("2026-12-01" as LocalDay, "short")).toBe("Dec 1");
  });
});
