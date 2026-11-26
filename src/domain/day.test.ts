import { describe, expect, it } from "vitest";

import { isLocalDay, toLocalDay } from "./day";

describe("toLocalDay", () => {
  it("returns the calendar day in the given timezone, not UTC", () => {
    // 20:00 UTC on Nov 26 is already Nov 27 in India (UTC+5:30).
    const instant = new Date("2026-11-26T20:00:00Z");

    expect(toLocalDay(instant, "UTC")).toBe("2026-11-26");
    expect(toLocalDay(instant, "Asia/Kolkata")).toBe("2026-11-27");
    expect(toLocalDay(instant, "America/Los_Angeles")).toBe("2026-11-26");
  });

  it("handles the moment just before local midnight", () => {
    const instant = new Date("2026-11-26T18:29:59Z"); // 23:59:59 in Kolkata

    expect(toLocalDay(instant, "Asia/Kolkata")).toBe("2026-11-26");
  });

  it("throws on an invalid timezone", () => {
    expect(() => toLocalDay(new Date(), "Not/AZone")).toThrow(RangeError);
  });
});

describe("isLocalDay", () => {
  it.each(["2026-11-26", "2024-02-29"])("accepts %s", (value) => {
    expect(isLocalDay(value)).toBe(true);
  });

  it.each(["2026-13-01", "2025-02-29", "26-11-2026", "2026-11-26T00:00", ""])(
    "rejects %s",
    (value) => {
      expect(isLocalDay(value)).toBe(false);
    },
  );
});
