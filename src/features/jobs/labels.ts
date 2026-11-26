import type { JobPlatform } from "@/domain/jobs";

export const PLATFORM_LABELS: Record<JobPlatform, string> = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  naukri: "Naukri",
  wellfound: "Wellfound",
  company_site: "Company site",
  referral: "Referral",
  other: "Other",
};
