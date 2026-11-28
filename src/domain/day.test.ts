import { describe, expect, it } from "vitest";

import type { LocalDay } from "./day";
import { addDays, daysBetween, eachDay, isLocalDay, isValidTimeZone, toLocalDay } from "./day";

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

describe("isValidTimeZone", () => {
  it.each(["Asia/Kolkata", "America/New_York", "UTC"])("accepts %s", (tz) => {
    expect(isValidTimeZone(tz)).toBe(true);
  });

  it.each(["Not/AZone", "", "Mars/Olympus"])("rejects %s", (tz) => {
    expect(isValidTimeZone(tz)).toBe(false);
  });
});

const d = (value: string) => value as LocalDay;

describe("day arithmetic", () => {
  it("adds days across month and year ends", () => {
    expect(addDays(d("2026-11-30"), 1)).toBe("2026-12-01");
    expect(addDays(d("2026-12-31"), 1)).toBe("2027-01-01");
    expect(addDays(d("2026-03-01"), -1)).toBe("2026-02-28");
  });

  it("isn't affected by daylight saving changes", () => {
    // US DST ends on Nov 1, 2026; local-day maths must still step one calendar day.
    expect(addDays(d("2026-10-31"), 1)).toBe("2026-11-01");
    expect(daysBetween(d("2026-10-31"), d("2026-11-02"))).toBe(2);
  });

  it("counts days between, in either direction", () => {
    expect(daysBetween(d("2026-11-26"), d("2026-12-03"))).toBe(7);
    expect(daysBetween(d("2026-12-03"), d("2026-11-26"))).toBe(-7);
  });

  it("lists each day inclusively", () => {
    expect(eachDay(d("2026-11-29"), d("2026-12-01"))).toEqual([
      "2026-11-29",
      "2026-11-30",
      "2026-12-01",
    ]);
    expect(eachDay(d("2026-12-01"), d("2026-11-30"))).toEqual([]);
  });
});
