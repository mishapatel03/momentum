import type { JobPlatform } from "@/domain/jobs";
import type { PipelineStatus } from "@/domain/pipeline";

export const PLATFORM_LABELS: Record<JobPlatform, string> = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  naukri: "Naukri",
  wellfound: "Wellfound",
  company_site: "Company site",
  referral: "Referral",
  other: "Other",
};

export const STATUS_LABELS: Record<PipelineStatus, string> = {
  applied: "Applied",
  response: "Response",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
};

/** A small colour dot per column, so statuses are easy to tell apart at a glance. */
export const STATUS_DOT: Record<PipelineStatus, string> = {
  applied: "bg-sky-500",
  response: "bg-violet-500",
  interview: "bg-amber-500",
  offer: "bg-emerald-500",
  rejected: "bg-rose-500",
  ghosted: "bg-zinc-400",
};
