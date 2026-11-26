import { describe, expect, it } from "vitest";

import { savedSearchSchema } from "./schema";

describe("savedSearchSchema", () => {
  it("keeps the query string, which holds the search filters", () => {
    const url = "https://www.linkedin.com/jobs/search/?keywords=react&f_TPR=r86400&f_WT=2";
    expect(savedSearchSchema.parse({ label: " React remote ", url })).toEqual({
      label: "React remote",
      url,
    });
  });

  it.each([
    ["", "https://x.com", "label"],
    ["Ok", "linkedin.com/jobs", "url"],
    ["Ok", "javascript:alert(1)", "url"],
  ])("rejects label %j url %j", (label, url, field) => {
    const result = savedSearchSchema.safeParse({ label, url });
    expect(result.success ? [] : result.error.issues.map((i) => i.path[0])).toEqual([field]);
  });
});
