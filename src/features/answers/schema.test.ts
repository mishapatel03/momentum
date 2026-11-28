import { describe, expect, it } from "vitest";

import { answerSchema, BODY_MAX, STARTER_ANSWERS } from "./schema";

describe("answerSchema", () => {
  it("trims and accepts a normal answer", () => {
    expect(answerSchema.parse({ label: " Notice period ", body: " 30 days " })).toEqual({
      label: "Notice period",
      body: "30 days",
    });
  });

  it("requires both fields and caps the body", () => {
    expect(answerSchema.safeParse({ label: "", body: " " }).success).toBe(false);
    expect(answerSchema.safeParse({ label: "x", body: "y".repeat(BODY_MAX + 1) }).success).toBe(
      false,
    );
  });

  it("ships starter answers that pass validation", () => {
    for (const answer of STARTER_ANSWERS) expect(answerSchema.safeParse(answer).success).toBe(true);
  });
});
