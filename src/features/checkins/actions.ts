"use server";

import { refresh } from "next/cache";

import { toLocalDay } from "@/domain/day";
import { requireUser } from "@/features/auth/session";
import { getUserTimezone } from "@/features/settings/queries";
import { formValues, toFieldErrors } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

import type { CheckInField, CheckInState } from "./schema";
import { checkInSchema } from "./schema";

/** Saves today's check-in (in the user's timezone). Saving again the same day updates it. */
export async function saveCheckIn(_prev: CheckInState, formData: FormData): Promise<CheckInState> {
  const user = await requireUser();
  const values = formValues(formData, ["mood", "note"]);

  const parsed = checkInSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors<CheckInField>(parsed.error), values };
  }

  const day = toLocalDay(new Date(), await getUserTimezone());
  const supabase = await createClient();
  const { error } = await supabase
    .from("checkins")
    .upsert({ user_id: user.id, day, ...parsed.data }, { onConflict: "user_id,day" });

  if (error) {
    console.error("saveCheckIn failed", error);
    return { status: "error", message: "Couldn't save your check-in. Please try again.", values };
  }

  refresh();
  return { status: "success", message: "Check-in saved" };
}
