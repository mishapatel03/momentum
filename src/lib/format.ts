import type { LocalDay } from "@/domain/day";

const formats = {
  long: { weekday: "long", month: "long", day: "numeric" },
  short: { month: "short", day: "numeric" },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

/**
 * Formats a calendar day. Local days are already in the user's timezone, so they're
 * formatted at UTC midnight to make sure the date never shifts.
 */
export function formatDay(day: LocalDay, style: keyof typeof formats = "long"): string {
  return new Intl.DateTimeFormat("en-US", { ...formats[style], timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
}
