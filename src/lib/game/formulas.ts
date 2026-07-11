export type Tier = "Tiny" | "Standard" | "Hard";

export const XP_BY_TIER: Record<Tier, number> = {
  Tiny: 10,
  Standard: 25,
  Hard: 50,
};

export const TOTAL_XP_TARGET = 6000;

/**
 * Calculates the streak multiplier.
 * +1% per day, capped at +30% (+0.30)
 */
export function getStreakMultiplier(streak: number): number {
  return 1 + Math.min(streak, 30) * 0.01;
}

/**
 * Calculates XP earned for a set of quests completed on a day.
 */
export function calculateDailyXP(completedQuests: { tier: Tier }[], streak: number): number {
  const baseXP = completedQuests.reduce((sum, quest) => sum + XP_BY_TIER[quest.tier], 0);
  const multiplier = getStreakMultiplier(streak);
  return Math.round(baseXP * multiplier);
}

/**
 * Maps cumulative XP to a saturating resolution percentage.
 * Asymptotes towards 100% but never quite reaches it, representing
 * "high definition, not perfect".
 */
export function calculateResolutionPct(cumulativeXP: number): number {
  const raw = cumulativeXP / TOTAL_XP_TARGET;
  const pct = 100 * (1 - Math.exp(-2.5 * raw));
  // Round to 1 decimal place for rendering
  return Math.round(pct * 10) / 10;
}
