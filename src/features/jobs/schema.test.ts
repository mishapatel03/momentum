import { describe, expect, it } from "vitest";

import { addToInboxSchema } from "./schema";

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
