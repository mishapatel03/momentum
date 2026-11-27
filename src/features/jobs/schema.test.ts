import { describe, expect, it } from "vitest";

import { addAppliedJobSchema, addToInboxSchema, markAppliedSchema } from "./schema";

const empty = { url: "", title: "", company: "" };

describe("addToInboxSchema", () => {
  it("accepts just a link and normalizes it", () => {
    const result = addToInboxSchema.parse({
      ...empty,
      url: " https://acme.com/jobs/1/?utm_source=x ",
    });
    expect(result).toEqual({ url: "https://acme.com/jobs/1", title: null, company: null });
  });

  it("accepts just a title", () => {
    expect(addToInboxSchema.parse({ ...empty, title: "Frontend Engineer" }).title).toBe(
      "Frontend Engineer",
    );
  });

  it("requires a link or a title", () => {
    const result = addToInboxSchema.safeParse({ ...empty, company: "Acme" });
    expect(result.success).toBe(false);
  });

  it("rejects a link without a scheme", () => {
    const result = addToInboxSchema.safeParse({ ...empty, url: "acme.com/jobs" });
    expect(result.success).toBe(false);
  });
});

describe("markAppliedSchema", () => {
  it("requires title and company and a known platform", () => {
    const result = markAppliedSchema.safeParse({ title: " ", company: "", platform: "myspace" });
    expect(result.success ? [] : result.error.issues.map((i) => i.path[0]).sort()).toEqual([
      "company",
      "platform",
      "title",
    ]);
  });

  it("trims values", () => {
    expect(
      markAppliedSchema.parse({ title: " SWE ", company: " Acme ", platform: "linkedin" }),
    ).toEqual({ title: "SWE", company: "Acme", platform: "linkedin" });
  });
});

describe("addAppliedJobSchema", () => {
  it("makes the link optional", () => {
    const base = { title: "SWE", company: "Acme", platform: "other" };
    expect(addAppliedJobSchema.parse({ ...base, url: "" }).url).toBeNull();
    expect(addAppliedJobSchema.parse({ ...base, url: "https://acme.com/j/1/" }).url).toBe(
      "https://acme.com/j/1",
    );
  });
});
