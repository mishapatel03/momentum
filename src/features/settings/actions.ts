"use server";

import { refresh } from "next/cache";

import type { LocalDay } from "@/domain/day";
import { toLocalDay } from "@/domain/day";
import { targetOn } from "@/domain/targets";
import { requireUser } from "@/features/auth/session";
import { formValues, toFieldErrors } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

import type { SettingsFormState, SettingsInput } from "./schema";
import { makeSettingsSchema } from "./schema";

const SAVE_FAILED = "Couldn't save your settings. Please try again.";

export async function saveSettings(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const user = await requireUser();

  const values = formValues(formData, ["timezone", "challengeStartDate", "dailyApplyTarget"]);

  const now = new Date();
  const parsed = makeSettingsSchema(now).safeParse(values);

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: toFieldErrors<keyof SettingsInput>(parsed.error),
      values,
    };
  }

  const { timezone, challengeStartDate, dailyApplyTarget } = parsed.data;
  const today = toLocalDay(now, timezone);
  const supabase = await createClient();

  const { error: settingsError } = await supabase
    .from("settings")
    .upsert(
      { user_id: user.id, timezone, challenge_start_date: challengeStartDate },
      { onConflict: "user_id" },
    );
  if (settingsError) {
    console.error("saveSettings: settings upsert failed", settingsError);
    return { status: "error", message: SAVE_FAILED, values };
  }

  // Record a target change from today only if it actually changed, so history stays clean.
  const { data: targetRows, error: targetsError } = await supabase
    .from("targets")
    .select("daily_apply_target, effective_from")
    .eq("user_id", user.id);
  if (targetsError) {
    console.error("saveSettings: targets read failed", targetsError);
    return { status: "error", message: SAVE_FAILED, values };
  }

  const current = targetOn(
    targetRows.map((row) => ({
      dailyApplyTarget: row.daily_apply_target,
      effectiveFrom: row.effective_from as LocalDay,
    })),
    today,
  );

  if (current !== dailyApplyTarget) {
    const { error: targetError } = await supabase
      .from("targets")
      .upsert(
        { user_id: user.id, daily_apply_target: dailyApplyTarget, effective_from: today },
        { onConflict: "user_id,effective_from" },
      );
    if (targetError) {
      console.error("saveSettings: target upsert failed", targetError);
      return { status: "error", message: SAVE_FAILED, values };
    }
  }

  refresh();
  return { status: "success", message: "Settings saved" };
}
