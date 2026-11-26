/**
 * A calendar day in the user's timezone, formatted as `YYYY-MM-DD`.
 * Every "which day is this?" question in the app must go through `toLocalDay`,
 * so streaks and challenge scores never drift between UTC and local time.
 */
export type LocalDay = string & { readonly __brand: "LocalDay" };

const LOCAL_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toLocalDay(date: Date, timeZone: string): LocalDay {
  // en-CA formats dates as YYYY-MM-DD.
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  return formatted as LocalDay;
}

export function isLocalDay(value: string): value is LocalDay {
  if (!LOCAL_DAY_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}
