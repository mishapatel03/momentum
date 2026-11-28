import { describe, expect, it } from "vitest";

import { RESUME_MAX_BYTES, resumePath, validateResumeFile } from "./constants";

const pdf = (size = 100) =>
  new File(["%PDF-1.7\n" + "x".repeat(Math.max(0, size - 9))], "cv.pdf", {
    type: "application/pdf",
  });

describe("validateResumeFile", () => {
  it("accepts a real PDF", async () => {
    expect(await validateResumeFile(pdf())).toBeNull();
  });

  it("rejects a file that only pretends to be a PDF", async () => {
    const fake = new File(["hello"], "cv.pdf", { type: "application/pdf" });
    expect(await validateResumeFile(fake)).toMatch(/PDF/);
  });

  it("rejects files over 5 MB and empty files", async () => {
    expect(await validateResumeFile(pdf(RESUME_MAX_BYTES + 1))).toMatch(/5 MB/);
    expect(await validateResumeFile(new File([], "cv.pdf"))).toMatch(/empty/);
  });
});

describe("resumePath", () => {
  it("keeps each user's resume in their own folder", () => {
    expect(resumePath("abc")).toBe("abc/resume.pdf");
  });
});
