import { z } from "zod";

import { isLocalDay, isValidTimeZone, toLocalDay } from "@/domain/day";

export const DAILY_TARGET = { min: 1, max: 50, default: 5 } as const;

/** Built per request because "not in the future" depends on the current time. */
export function makeSettingsSchema(now: Date) {
  return z
    .object({
      timezone: z.string().refine(isValidTimeZone, "Pick a valid timezone"),
      challengeStartDate: z.string().refine(isLocalDay, "Enter a valid date"),
      dailyApplyTarget: z.coerce
        .number({ error: "Enter a number" })
        .int("Must be a whole number")
        .min(DAILY_TARGET.min, `At least ${DAILY_TARGET.min}`)
        .max(DAILY_TARGET.max, `At most ${DAILY_TARGET.max}`),
    })
    .superRefine((value, ctx) => {
      if (!isValidTimeZone(value.timezone) || !isLocalDay(value.challengeStartDate)) return;
      if (value.challengeStartDate > toLocalDay(now, value.timezone)) {
        ctx.addIssue({
          code: "custom",
          path: ["challengeStartDate"],
          message: "Start date can't be in the future",
        });
      }
    });
}

export type SettingsInput = z.infer<ReturnType<typeof makeSettingsSchema>>;

export type SettingsFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof SettingsInput, string>>;
  /** What was submitted, so the form keeps it after React resets it. */
  values?: Record<keyof SettingsInput, string>;
};
