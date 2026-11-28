import "server-only";

import type { LocalDay } from "@/domain/day";
import { toLocalDay } from "@/domain/day";
import type { DayResult } from "@/domain/scoring";
import { scoreDays } from "@/domain/scoring";
import { requireUser } from "@/features/auth/session";
import type { Mood } from "@/features/checkins/schema";
import { requestTime } from "@/lib/request-time";
import { createClient } from "@/lib/supabase/server";

import { toScoringFacts } from "./facts";

export type TodayProgress =
  | { kind: "needs-setup" }
  | { kind: "not-started"; startDay: LocalDay }
  | {
      kind: "active";
      timeZone: string;
      startDay: LocalDay;
      today: LocalDay;
      /** Every scored day from the challenge start through today, oldest first. */
      days: DayResult[];
      todayResult: DayResult;
      checkIn: { mood: Mood; note: string | null } | null;
    };

/** Loads every fact the engine needs and scores the challenge up to today. */
export async function getTodayProgress(): Promise<TodayProgress> {
  const now = await requestTime();
  const user = await requireUser();
  const supabase = await createClient();

  const [settings, targets, jobs, events, checkins] = await Promise.all([
    supabase
      .from("settings")
      .select("timezone, challenge_start_date")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("targets").select("daily_apply_target, effective_from").eq("user_id", user.id),
    supabase
      .from("jobs")
      .select("id, status, applied_at")
      .eq("user_id", user.id)
      .neq("status", "inbox"),
    supabase
      .from("job_events")
      .select("job_id, type, from_status, occurred_at")
      .eq("user_id", user.id),
    supabase.from("checkins").select("day, mood, note").eq("user_id", user.id),
  ]);

  for (const result of [settings, targets, jobs, events, checkins]) {
    if (result.error) throw result.error;
  }
  if (!settings.data) return { kind: "needs-setup" };

  const timeZone = settings.data.timezone;
  const startDay = settings.data.challenge_start_date as LocalDay;
  const today = toLocalDay(now, timeZone);
  if (today < startDay) return { kind: "not-started", startDay };

  const facts = toScoringFacts(
    {
      targets: targets.data ?? [],
      // applied_at is always set for pipeline jobs (DB constraint); the filter narrows the type.
      jobs: (jobs.data ?? []).flatMap((job) =>
        job.applied_at ? [{ id: job.id, status: job.status, applied_at: job.applied_at }] : [],
      ),
      events: events.data ?? [],
      checkins: checkins.data ?? [],
    },
    timeZone,
  );

  const days = scoreDays(startDay, today, facts);
  const todayCheckIn = (checkins.data ?? []).find((row) => row.day === today);

  return {
    kind: "active",
    timeZone,
    startDay,
    today,
    days,
    todayResult: days.at(-1)!,
    checkIn: todayCheckIn ? { mood: todayCheckIn.mood, note: todayCheckIn.note } : null,
  };
}
