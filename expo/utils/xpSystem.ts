export type XPAction =
  | 'answer_correct'
  | 'answer_wrong'
  | 'daily_goal'
  | 'exam_complete'
  | 'streak_milestone'
  | 'badge_unlock';

const XP_VALUES: Record<XPAction, number> = {
  answer_correct: 10,
  answer_wrong: 2,
  daily_goal: 50,
  exam_complete: 100,
  streak_milestone: 50,
  badge_unlock: 75,
};

export function calculateXP(action: XPAction): number {
  return XP_VALUES[action];
}

// Each level requires progressively more XP
// Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(50 * Math.pow(level - 1, 1.5));
}

export function calculateLevel(totalXP: number): {
  level: number;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  progressPercent: number;
} {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXP) {
    level++;
  }

  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercent = xpForNextLevel > 0 ? xpInCurrentLevel / xpForNextLevel : 1;

  return { level, xpForNextLevel, xpInCurrentLevel, progressPercent };
}
