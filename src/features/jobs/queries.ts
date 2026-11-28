import "server-only";

import type { JobStatus } from "@/domain/jobs";
import type { PipelineStatus } from "@/domain/pipeline";
import { isPipelineStatus } from "@/domain/pipeline";
import type { JobEvent, TimelineEntry } from "@/domain/timeline";
import { buildTimeline } from "@/domain/timeline";
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

export type JobDetails = {
  id: string;
  title: string | null;
  company: string | null;
  url: string | null;
  platform: JobRow["platform"];
  status: JobStatus;
  notes: string | null;
  /** Timeline entries with their dates pre-formatted in the user's timezone. */
  timeline: (TimelineEntry & { when: string })[];
};

/** A single job with its history, or null if it doesn't exist (or isn't the user's). */
export async function getJob(jobId: string): Promise<JobDetails | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const [jobResult, eventsResult, timezone] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, title, company, url, platform, status, notes, created_at")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("job_events")
      .select("type, from_status, to_status, occurred_at")
      .eq("job_id", jobId)
      .eq("user_id", user.id),
    getUserTimezone(),
  ]);

  if (jobResult.error) throw jobResult.error;
  if (eventsResult.error) throw eventsResult.error;
  const job = jobResult.data;
  if (!job) return null;

  const events = eventsResult.data.flatMap((row): JobEvent[] => {
    if (row.type === "follow_up_sent") return [{ type: row.type, at: row.occurred_at }];
    if (!row.to_status) return [];
    return [{ type: row.type, from: row.from_status, to: row.to_status, at: row.occurred_at }];
  });

  const formatWhen = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return {
    id: job.id,
    title: job.title,
    company: job.company,
    url: job.url,
    platform: job.platform,
    status: job.status,
    notes: job.notes,
    timeline: buildTimeline(job.created_at, events).map((entry) => ({
      ...entry,
      when: formatWhen.format(new Date(entry.at)),
    })),
  };
}
