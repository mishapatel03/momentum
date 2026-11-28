"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { isLocalDay } from "@/domain/day";
import { requireUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";

const input = z.object({
  windowStart: z.string().refine(isLocalDay),
  windowNumber: z.number().int().min(1),
});

/** Remembers that a window's celebration was shown, so it plays once across devices. */
export async function markCelebrationSeen(windowStart: string, windowNumber: number) {
  const user = await requireUser();
  const parsed = input.safeParse({ windowStart, windowNumber });
  if (!parsed.success) return { ok: false as const };

  const supabase = await createClient();
  const { error } = await supabase.from("celebrations_seen").upsert(
    {
      user_id: user.id,
      window_start: parsed.data.windowStart,
      window_number: parsed.data.windowNumber,
    },
    { onConflict: "user_id,window_start", ignoreDuplicates: true },
  );

  if (error) {
    console.error("markCelebrationSeen failed", error);
    return { ok: false as const };
  }
  refresh();
  return { ok: true as const };
}
