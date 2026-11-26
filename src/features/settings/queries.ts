import "server-only";

import type { LocalDay } from "@/domain/day";
import { toLocalDay } from "@/domain/day";
import { targetOn } from "@/domain/targets";
import { requireUser } from "@/features/auth/session";
import { requestTime } from "@/lib/request-time";
import { createClient } from "@/lib/supabase/server";

export type UserSettings = {
  timezone: string;
  challengeStartDate: LocalDay;
  dailyApplyTarget: number | null;
};

/** The user's settings, or null if they haven't saved any yet. */
export async function getSettings(): Promise<UserSettings | null> {
  const now = await requestTime();
  const user = await requireUser();
  const supabase = await createClient();

  const [settingsResult, targetsResult] = await Promise.all([
    supabase
      .from("settings")
      .select("timezone, challenge_start_date")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("targets").select("daily_apply_target, effective_from").eq("user_id", user.id),
  ]);

  if (settingsResult.error) throw settingsResult.error;
  if (targetsResult.error) throw targetsResult.error;
  if (!settingsResult.data) return null;

  const { timezone, challenge_start_date } = settingsResult.data;
  const targets = targetsResult.data.map((row) => ({
    dailyApplyTarget: row.daily_apply_target,
    effectiveFrom: row.effective_from as LocalDay,
  }));

  return {
    timezone,
    challengeStartDate: challenge_start_date as LocalDay,
    dailyApplyTarget: targetOn(targets, toLocalDay(now, timezone)),
  };
}
