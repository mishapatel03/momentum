import "server-only";

import { requireUser } from "@/features/auth/session";
import { getUserTimezone } from "@/features/settings/queries";
import { createClient } from "@/lib/supabase/server";

import { RESUME_BUCKET, resumePath } from "./constants";

export type ResumeInfo = { sizeBytes: number; updatedLabel: string };

/** The user's resume, or null if none is uploaded. */
export async function getResume(): Promise<ResumeInfo | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data, error }, timeZone] = await Promise.all([
    supabase.storage.from(RESUME_BUCKET).info(resumePath(user.id)),
    getUserTimezone(),
  ]);
  if (error || !data) return null; // "not found" comes back as an error

  const updated = data.lastModified ?? data.createdAt;
  return {
    sizeBytes: data.size ?? 0,
    updatedLabel: new Intl.DateTimeFormat("en-US", {
      timeZone,
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(updated)),
  };
}
