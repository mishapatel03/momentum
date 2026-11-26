/**
 * Job vocabulary shared by the whole app. Mirrors the database enums;
 * `src/features/jobs/db-types.ts` fails to compile if the two ever drift apart.
 */
export const JOB_PLATFORMS = [
  "linkedin",
  "indeed",
  "naukri",
  "wellfound",
  "company_site",
  "referral",
  "other",
] as const;
export type JobPlatform = (typeof JOB_PLATFORMS)[number];

export const JOB_STATUSES = [
  "inbox",
  "applied",
  "response",
  "interview",
  "offer",
  "rejected",
  "ghosted",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/** Hosts we can recognise from a link. Matches the host and any subdomain (e.g. in.linkedin.com). */
const PLATFORM_HOSTS: ReadonlyArray<[platform: JobPlatform, hosts: readonly string[]]> = [
  ["linkedin", ["linkedin.com", "lnkd.in"]],
  ["indeed", ["indeed.com", "indeed.co.in", "indeed.co.uk", "indeed.ca"]],
  ["naukri", ["naukri.com"]],
  ["wellfound", ["wellfound.com", "angel.co"]],
];

export function detectPlatform(url: string): JobPlatform {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return "other";
  }
  for (const [platform, hosts] of PLATFORM_HOSTS) {
    if (hosts.some((h) => host === h || host.endsWith(`.${h}`))) return platform;
  }
  return "other";
}

/** Query params that only track where a click came from. Dropping them makes duplicates detectable. */
const TRACKING_PARAMS = new Set([
  "trk",
  "trackingid",
  "refid",
  "ref",
  "src",
  "source",
  "from",
  "gclid",
  "fbclid",
  "lipi",
  "ebp",
  "recommendedflavor",
]);

/**
 * Canonical form of a job link: https-agnostic input, no hash, no tracking params,
 * lowercase host, no trailing slash. Returns null for anything that isn't an http(s) URL.
 */
export function normalizeJobUrl(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  for (const key of [...url.searchParams.keys()]) {
    const lower = key.toLowerCase();
    if (lower.startsWith("utm_") || TRACKING_PARAMS.has(lower)) url.searchParams.delete(key);
  }
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }
  return url.toString();
}
