import { describe, expect, it } from "vitest";

import { detectPlatform, normalizeJobUrl } from "./jobs";

describe("detectPlatform", () => {
  it.each([
    ["https://www.linkedin.com/jobs/view/123", "linkedin"],
    ["https://in.linkedin.com/jobs/view/123", "linkedin"],
    ["https://lnkd.in/abc", "linkedin"],
    ["https://in.indeed.com/viewjob?jk=1", "indeed"],
    ["https://www.indeed.co.uk/viewjob?jk=1", "indeed"],
    ["https://www.naukri.com/job-listings-x", "naukri"],
    ["https://wellfound.com/jobs/1", "wellfound"],
    ["https://boards.greenhouse.io/acme/jobs/1", "other"],
    ["https://notlinkedin.com/jobs", "other"],
    ["not a url", "other"],
  ])("%s → %s", (url, platform) => {
    expect(detectPlatform(url)).toBe(platform);
  });
});

describe("normalizeJobUrl", () => {
  it("drops tracking params, hash and trailing slash", () => {
    expect(
      normalizeJobUrl(
        "https://www.LinkedIn.com/jobs/view/123/?trk=feed&refId=abc&utm_source=x#top",
      ),
    ).toBe("https://www.linkedin.com/jobs/view/123");
  });

  it("keeps params that identify the job", () => {
    expect(normalizeJobUrl("https://in.indeed.com/viewjob?jk=42&from=serp")).toBe(
      "https://in.indeed.com/viewjob?jk=42",
    );
  });

  it("trims whitespace", () => {
    expect(normalizeJobUrl("  https://acme.com/careers/1  ")).toBe("https://acme.com/careers/1");
  });

  it.each(["", "acme.com/jobs", "ftp://acme.com/x", "javascript:alert(1)"])(
    "rejects %j",
    (input) => {
      expect(normalizeJobUrl(input)).toBeNull();
    },
  );
});
