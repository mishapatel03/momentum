import { describe, expect, it } from "vitest";
import { z } from "zod";

import { formValues, toFieldErrors } from "./forms";

describe("toFieldErrors", () => {
  it("keeps the first message per field", () => {
    const schema = z.object({ name: z.string().min(2, "too short").max(1, "too long") });
    const result = schema.safeParse({ name: "a" });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error)).toEqual({ name: "too short" });
  });
});

describe("formValues", () => {
  it("reads strings and defaults missing fields to empty", () => {
    const data = new FormData();
    data.set("title", "SWE");
    expect(formValues(data, ["title", "company"])).toEqual({ title: "SWE", company: "" });
  });
});
