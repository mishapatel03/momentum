/**
 * Where to go after login. Only same-site paths are allowed, so a crafted
 * `?next=https://evil.example` (an open redirect) can never send the user off-site.
 */
export function safeNextPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) return fallback;
  // Must be a path on this site: "/x", never "//host", "/\host" or a full URL.
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value === "/login" || value.startsWith("/login?") || value.startsWith("/login/"))
    return fallback;
  return value;
}
