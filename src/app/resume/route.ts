import { NextResponse } from "next/server";

import { requireUser } from "@/features/auth/session";
import { RESUME_BUCKET, RESUME_DOWNLOAD_NAME, resumePath } from "@/features/resume/constants";
import { createClient } from "@/lib/supabase/server";

/**
 * Opens (or with ?download=1, downloads) the user's resume via a short-lived signed URL.
 * A plain link to this route works in a new tab without popup blockers getting in the way.
 */
export async function GET(request: Request) {
  const user = await requireUser();
  const download = new URL(request.url).searchParams.get("download") === "1";

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(resumePath(user.id), 60, download ? { download: RESUME_DOWNLOAD_NAME } : {});

  if (error || !data) {
    return NextResponse.redirect(new URL("/toolkit", request.url));
  }
  return NextResponse.redirect(data.signedUrl);
}
