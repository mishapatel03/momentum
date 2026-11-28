import { describe, expect, it } from "vitest";

import { safeNextPath } from "./safe-redirect";

describe("safeNextPath", () => {
  it.each(["/jobs", "/jobs/123", "/share?url=https%3A%2F%2Fx.com", "/"])("allows %s", (path) => {
    expect(safeNextPath(path)).toBe(path);
  });

  it.each([
    "https://evil.example",
    "//evil.example/path",
    "/\\evil.example",
    "javascript:alert(1)",
    "jobs",
    "",
    "/login",
    "/login?next=/jobs",
    null,
    undefined,
  ])("rejects %j", (value) => {
    expect(safeNextPath(value)).toBe("/");
  });
});
