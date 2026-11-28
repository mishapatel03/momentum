/**
 * The challenge rules, in one place. Agreed with the product owner before Day 3:
 * changing them later changes how history is scored.
 */
export const RULES = {
  /** Length of the whole challenge, in days. */
  challengeDays: 30,
  /** Days per celebration window. */
  windowDays: 15,
  /** Days added to a window that missed the pass mark. */
  extensionDays: 2,
  /** Share of tasks (in %) that must be done to earn the celebration. */
  passPercent: 95,
  /** Follow-up reminders, in days after applying, while the job is still "applied". */
  followUpAfterDays: [7, 14],
  /** Days after applying with no reply when the app suggests marking the job ghosted. */
  suggestGhostedAfterDays: 21,
  /** Used before the user has saved a target. */
  defaultDailyTarget: 5,
} as const;
