import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";

export const MOODS = ["great", "good", "okay", "low", "bad"] as const;
export type Mood = (typeof MOODS)[number];

// Compile-time check that the list matches the database enum.
type DbMood = Database["public"]["Enums"]["mood"];
const moodsMatch: [Mood] extends [DbMood] ? ([DbMood] extends [Mood] ? true : false) : false = true;
void moodsMatch;

export const MOOD_EMOJI: Record<Mood, { emoji: string; label: string }> = {
  great: { emoji: "🤩", label: "Great" },
  good: { emoji: "🙂", label: "Good" },
  okay: { emoji: "😐", label: "Okay" },
  low: { emoji: "😕", label: "Low" },
  bad: { emoji: "😞", label: "Bad" },
};

export const NOTE_MAX = 280;

export const checkInSchema = z.object({
  mood: z.enum(MOODS, { error: "Pick how today went" }),
  note: z
    .string()
    .trim()
    .max(NOTE_MAX, `At most ${NOTE_MAX} characters`)
    .transform((value) => value || null),
});

export type CheckInField = "mood" | "note";

export type CheckInState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<CheckInField, string>>;
  values?: Record<CheckInField, string>;
};
