"use server";

import { refresh } from "next/cache";

import { detectPlatform } from "@/domain/jobs";
import { isPipelineStatus } from "@/domain/pipeline";
import { requireUser } from "@/features/auth/session";
import { formValues, toFieldErrors } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

import type { AddToInboxField, AddToInboxState, AppliedField, AppliedFormState } from "./schema";
import { addAppliedJobSchema, addToInboxSchema, jobIdSchema, markAppliedSchema } from "./schema";

const UNIQUE_VIOLATION = "23505";

export async function addToInbox(
  _prev: AddToInboxState,
  formData: FormData,
): Promise<AddToInboxState> {
  const user = await requireUser();

  const values = formValues(formData, ["url", "title", "company"]);

  const parsed = addToInboxSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors<AddToInboxField>(parsed.error), values };
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

const APPLY_FAILED = "Couldn't save the job. Please try again.";

/** Moves an inbox job into the pipeline. The DB trigger logs the status change. */
export async function markApplied(
  jobId: string,
  _prev: AppliedFormState,
  formData: FormData,
): Promise<AppliedFormState> {
  const user = await requireUser();
  const values = formValues(formData, ["title", "company", "platform"]);

  const id = jobIdSchema.safeParse(jobId);
  if (!id.success) return { status: "error", message: "Invalid job", values };

  const parsed = markAppliedSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors<AppliedField>(parsed.error), values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .update({ ...parsed.data, status: "applied", applied_at: new Date().toISOString() })
    .eq("id", id.data)
    .eq("user_id", user.id)
    .eq("status", "inbox") // only from the inbox: never re-applies or moves a pipeline job
    .select("id");

  if (error) {
    console.error("markApplied failed", error);
    return { status: "error", message: APPLY_FAILED, values };
  }
  if (data.length === 0) {
    refresh();
    return { status: "error", message: "This job isn't in your inbox anymore." };
  }

  refresh();
  return { status: "success", message: "Nice! Marked as applied 🎯" };
}

/** Adds a job straight into the pipeline as applied. */
export async function addAppliedJob(
  _prev: AppliedFormState,
  formData: FormData,
): Promise<AppliedFormState> {
  const user = await requireUser();
  const values = formValues(formData, ["title", "company", "platform", "url"]);

  const parsed = addAppliedJobSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors<AppliedField>(parsed.error), values };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("jobs").insert({
    ...parsed.data,
    user_id: user.id,
    status: "applied",
    applied_at: new Date().toISOString(),
  });

  if (error?.code === UNIQUE_VIOLATION) {
    return {
      status: "error",
      fieldErrors: { url: "This job is already saved. Mark it as applied from your inbox." },
      values,
    };
  }
  if (error) {
    console.error("addAppliedJob failed", error);
    return { status: "error", message: APPLY_FAILED, values };
  }

  refresh();
  return { status: "success", message: "Nice! Application added 🎯" };
}

export type MoveJobResult = { ok: true } | { ok: false; message: string };

/** Moves a pipeline job to another pipeline status. The DB trigger logs the change. */
export async function moveJob(jobId: string, to: string): Promise<MoveJobResult> {
  const user = await requireUser();
  const id = jobIdSchema.safeParse(jobId);
  if (!id.success || !isPipelineStatus(to)) return { ok: false, message: "Invalid move" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .update({ status: to })
    .eq("id", id.data)
    .eq("user_id", user.id)
    .neq("status", "inbox")
    .select("id");

  if (error) {
    console.error("moveJob failed", error);
    return { ok: false, message: "Couldn't move the job. Please try again." };
  }
  if (data.length === 0) return { ok: false, message: "That job no longer exists." };

  refresh();
  return { ok: true };
}
