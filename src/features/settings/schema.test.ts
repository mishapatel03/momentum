import { describe, expect, it } from "vitest";

import { makeSettingsSchema } from "./schema";

// 20:00 UTC on Nov 26 = Nov 27 in Kolkata.
const now = new Date("2026-11-26T20:00:00Z");
const schema = makeSettingsSchema(now);

const valid = {
  timezone: "Asia/Kolkata",
  challengeStartDate: "2026-11-26",
  dailyApplyTarget: "5",
};

function errorsFor(input: Record<string, unknown>) {
  const result = schema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
}

describe("settings schema", () => {
  it("accepts valid input and coerces the target to a number", () => {
    const result = schema.safeParse(valid);
    expect(result.success && result.data.dailyApplyTarget).toBe(5);
  });

  it("allows today in the user's timezone, even if it's tomorrow in UTC", () => {
    expect(errorsFor({ ...valid, challengeStartDate: "2026-11-27" })).toEqual([]);
  });

  it("rejects a start date in the future", () => {
    expect(errorsFor({ ...valid, challengeStartDate: "2026-11-28" })).toEqual([
      "challengeStartDate",
    ]);
  });

  it.each(["0", "51", "4.5", "", "abc"])("rejects target %j", (dailyApplyTarget) => {
    expect(errorsFor({ ...valid, dailyApplyTarget })).toEqual(["dailyApplyTarget"]);
  });

  it("rejects an unknown timezone", () => {
    expect(errorsFor({ ...valid, timezone: "Mars/Olympus" })).toEqual(["timezone"]);
  });
});
