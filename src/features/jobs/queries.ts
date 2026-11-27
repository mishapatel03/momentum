import "server-only";

import type { PipelineStatus } from "@/domain/pipeline";
import { isPipelineStatus } from "@/domain/pipeline";
import { requireUser } from "@/features/auth/session";
import { getUserTimezone } from "@/features/settings/queries";
import { createClient } from "@/lib/supabase/server";

import type { JobRow } from "./db-types";

export type InboxJob = Pick<JobRow, "id" | "title" | "company" | "url" | "platform" | "created_at">;

export async function getInboxJobs(): Promise<InboxJob[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, company, url, platform, created_at")
    .eq("user_id", user.id)
    .eq("status", "inbox")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export type PipelineJob = {
  id: string;
  title: string;
  company: string;
  url: string | null;
  platform: JobRow["platform"];
  status: PipelineStatus;
  /** e.g. "Nov 26", in the user's timezone. Formatted on the server to avoid hydration mismatches. */
  appliedOn: string;
};

export async function getPipelineJobs(): Promise<PipelineJob[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const [jobsResult, timezone] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, title, company, url, platform, status, applied_at")
      .eq("user_id", user.id)
      .neq("status", "inbox")
      .order("applied_at", { ascending: false }),
    getUserTimezone(),
  ]);

  if (jobsResult.error) throw jobsResult.error;

  const formatDay = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
  });

  return jobsResult.data.flatMap((job) => {
    // The DB guarantees pipeline jobs have these; the checks narrow the types.
    if (!isPipelineStatus(job.status) || !job.title || !job.company || !job.applied_at) return [];
    return [
      {
        id: job.id,
        title: job.title,
        company: job.company,
        url: job.url,
        platform: job.platform,
        status: job.status,
        appliedOn: formatDay.format(new Date(job.applied_at)),
      },
    ];
  });
}
