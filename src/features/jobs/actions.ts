"use server";

import { refresh } from "next/cache";

import { detectPlatform } from "@/domain/jobs";
import { requireUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";

import type { AddToInboxField, AddToInboxState } from "./schema";
import { addToInboxSchema, jobIdSchema } from "./schema";

const UNIQUE_VIOLATION = "23505";

export async function addToInbox(
  _prev: AddToInboxState,
  formData: FormData,
): Promise<AddToInboxState> {
  const user = await requireUser();

  const values = {
    url: String(formData.get("url") ?? ""),
    title: String(formData.get("title") ?? ""),
    company: String(formData.get("company") ?? ""),
  };

  const parsed = addToInboxSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: AddToInboxState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as AddToInboxField;
      fieldErrors[field] ??= issue.message;
    }
    return { status: "error", fieldErrors, values };
  }

  const { url, title, company } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("jobs").insert({
    user_id: user.id,
    url,
    title,
    company,
    platform: url ? detectPlatform(url) : "other",
  });

  if (error?.code === UNIQUE_VIOLATION) {
    return { status: "error", fieldErrors: { url: "You've already saved this job" }, values };
  }
  if (error) {
    console.error("addToInbox failed", error);
    return { status: "error", message: "Couldn't save the job. Please try again.", values };
  }

  refresh();
  return { status: "success", message: "Saved to inbox" };
}

export type DeleteJobResult = { ok: true } | { ok: false; message: string };

export async function deleteJob(jobId: string): Promise<DeleteJobResult> {
  const user = await requireUser();
  const id = jobIdSchema.safeParse(jobId);
  if (!id.success) return { ok: false, message: "Invalid job" };

  const supabase = await createClient();
  const { error } = await supabase.from("jobs").delete().eq("id", id.data).eq("user_id", user.id);

  if (error) {
    console.error("deleteJob failed", error);
    return { ok: false, message: "Couldn't delete the job. Please try again." };
  }

  refresh();
  return { ok: true };
}
