/** Counts of everything that earns XP. XP is always recomputed from history, never stored. */
export type XpSources = {
  applications: number;
  followUps: number;
  checkIns: number;
  completeDays: number;
  /** Distinct jobs that ever reached each status, so moving a card back and forth can't farm XP. */
  responses: number;
  interviews: number;
  offers: number;
  celebrations: number;
};

export const XP_REWARDS: Record<keyof XpSources, number> = {
  applications: 10,
  followUps: 5,
  checkIns: 5,
  completeDays: 20,
  responses: 25,
  interviews: 50,
  offers: 200,
  celebrations: 100,
};

export function computeXp(sources: XpSources): number {
  return (Object.keys(XP_REWARDS) as (keyof XpSources)[]).reduce(
    (total, key) => total + sources[key] * XP_REWARDS[key],
    0,
  );
}

/** Each level needs a bit more than the last. A full 30-day challenge lands around level 5–6. */
export const LEVELS = [
  { name: "Job Seeker", minXp: 0 },
  { name: "Go-Getter", minXp: 100 },
  { name: "Pipeline Builder", minXp: 300 },
  { name: "Interview Magnet", minXp: 700 },
  { name: "Offer Hunter", minXp: 1300 },
  { name: "Offer Magnet", minXp: 2200 },
] as const;

export type Level = {
  /** 1-based. */
  number: number;
  name: string;
  xp: number;
  /** XP where this level starts. */
  floor: number;
  /** The next level, or null at the top. */
  next: { name: string; minXp: number } | null;
  /** 0–100 progress towards the next level (100 at the top). */
  progress: number;
};

export function levelFor(xp: number): Level {
  const index = LEVELS.findLastIndex((level) => xp >= level.minXp);
  const current = LEVELS[Math.max(0, index)]!;
  const next = LEVELS[index + 1] ?? null;

  return {
    number: Math.max(0, index) + 1,
    name: current.name,
    xp,
    floor: current.minXp,
    next,
    progress: next ? Math.floor(((xp - current.minXp) / (next.minXp - current.minXp)) * 100) : 100,
  };
}
