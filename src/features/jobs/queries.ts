import "server-only";

import { requireUser } from "@/features/auth/session";
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
