"use server";

import { refresh } from "next/cache";

import { requireUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";

import { RESUME_BUCKET, resumePath, SHARE_LINK_DAYS } from "./constants";

type Result<T = object> = ({ ok: true } & T) | { ok: false; message: string };
const FAILED = "Something went wrong. Please try again.";

/**
 * Step 1 of an upload: a one-time URL the browser uploads to directly. This keeps large
 * files off our server (Vercel caps request bodies at about 4.5 MB).
 */
export async function createResumeUploadUrl(): Promise<Result<{ path: string; token: string }>> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUploadUrl(resumePath(user.id), { upsert: true });

  if (error || !data) {
    console.error("createResumeUploadUrl failed", error);
    return { ok: false, message: FAILED };
  }
  return { ok: true, path: data.path, token: data.token };
}

/** Step 2: called after the browser finished uploading, so the page shows the new file. */
export async function finishResumeUpload(): Promise<void> {
  await requireUser();
  refresh();
}

export async function deleteResume(): Promise<Result> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.storage.from(RESUME_BUCKET).remove([resumePath(user.id)]);
  if (error) {
    console.error("deleteResume failed", error);
    return { ok: false, message: FAILED };
  }
  refresh();
  return { ok: true };
}

/** A private link anyone can open for SHARE_LINK_DAYS. The file itself stays private. */
export async function createResumeShareLink(): Promise<Result<{ url: string }>> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(resumePath(user.id), SHARE_LINK_DAYS * 24 * 60 * 60);

  if (error || !data) {
    console.error("createResumeShareLink failed", error);
    return { ok: false, message: "Couldn't create a link. Is a resume uploaded?" };
  }
  return { ok: true, url: data.signedUrl };
}
