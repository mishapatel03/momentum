import type { LocalDay } from "./day";

export type TargetChange = {
  dailyApplyTarget: number;
  effectiveFrom: LocalDay;
};

/**
 * The daily apply target that applied on `day`: the latest change on or before it.
 * Days before the first change use the first target, so early challenge days are still scored.
 * Returns null only when there are no targets at all.
 */
export function targetOn(changes: readonly TargetChange[], day: LocalDay): number | null {
  if (changes.length === 0) return null;

  const sorted = [...changes].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  let current = sorted[0]!;
  for (const change of sorted) {
    if (change.effectiveFrom > day) break;
    current = change;
  }
  return current.dailyApplyTarget;
}
