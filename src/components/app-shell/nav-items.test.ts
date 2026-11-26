import { describe, expect, it } from "vitest";

import { isActive } from "./nav-items";

describe("isActive", () => {
  it("matches Today only on the root path", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/jobs", "/")).toBe(false);
  });

  it("matches a section and its sub-pages", () => {
    expect(isActive("/jobs", "/jobs")).toBe(true);
    expect(isActive("/jobs/123", "/jobs")).toBe(true);
  });

  it("doesn't match a path that only shares a prefix", () => {
    expect(isActive("/jobsearch", "/jobs")).toBe(false);
  });
});
