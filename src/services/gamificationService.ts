import type { Badge, CompanionChoice, TaskItem, UserStats } from '../types';
import { getDateMinusDays, isTaskScheduledForToday } from './storageService';

export interface CompanionStage {
  minLevel: number;
  title: string;
  emoji: string;
  badgeLabel: string;
}

export interface CompanionMetadata {
  id: CompanionChoice;
  name: string;
  species: string;
  defaultEmoji: string;
  description: string;
  stages: CompanionStage[];
}

export const COMPANION_DEFINITIONS: Record<CompanionChoice, CompanionMetadata> = {
  pip: {
    id: 'pip',
    name: 'Pip the Sproutling',
    species: 'Sprout',
    defaultEmoji: '🌱',
    description: 'Gentle Growth • Evolves from Seedling to Blossom',
    stages: [
      { minLevel: 5, title: 'Radiant Blossom', emoji: '🌸', badgeLabel: 'Radiant Blossom 🌸' },
      { minLevel: 3, title: 'Growing Sproutling', emoji: '🌱', badgeLabel: 'Growing Sprout 🌱' },
      { minLevel: 1, title: 'Seedling', emoji: '🌰', badgeLabel: 'Seedling Seed 🌰' },
    ],
  },
  mochi: {
    id: 'mochi',
    name: 'Mochi the Fox',
    species: 'Fox',
    defaultEmoji: '🦊',
    description: 'Playful Focus • Evolves to Forest Spirit',
    stages: [
      { minLevel: 5, title: 'Forest Spirit', emoji: '🦊✨', badgeLabel: 'Forest Spirit 🦊✨' },
      { minLevel: 3, title: 'Playful Fox', emoji: '🦊', badgeLabel: 'Playful Fox 🐾' },
      { minLevel: 1, title: 'Baby Kit', emoji: '🐾', badgeLabel: 'Baby Kit 🐾' },
    ],
  },
  nova: {
    id: 'nova',
    name: 'Nova the Cosmic Cat',
    species: 'Cat',
    defaultEmoji: '🐱',
    description: 'Quiet Wonder • Evolves to Starlight Guardian',
    stages: [
      { minLevel: 5, title: 'Starlight Guardian', emoji: '🐱✨', badgeLabel: 'Starlight Guardian 🌌' },
      { minLevel: 3, title: 'Cosmic Explorer', emoji: '🐱', badgeLabel: 'Cosmic Explorer 🐱' },
      { minLevel: 1, title: 'Little Kitten', emoji: '🐈', badgeLabel: 'Little Kitten 🐈' },
    ],
  },
  bubbles: {
    id: 'bubbles',
    name: 'Bubbles the Calm Turtle',
    species: 'Turtle',
    defaultEmoji: '🐢',
    description: 'Calm & Steady • Evolves to Ancient Sage',
    stages: [
      { minLevel: 5, title: 'Ancient Sage', emoji: '🐢🌊', badgeLabel: 'Ancient Sage 🌊' },
      { minLevel: 3, title: 'Calm Swimmer', emoji: '🐢', badgeLabel: 'Calm Swimmer 🐢' },
      { minLevel: 1, title: 'Tiny Hatchling', emoji: '🫧', badgeLabel: 'Tiny Hatchling 🫧' },
    ],
  },
};

export function getCompanionStage(choice: CompanionChoice = 'pip', level: number = 1) {
  const comp = COMPANION_DEFINITIONS[choice] || COMPANION_DEFINITIONS.pip;
  const stage = comp.stages.find((s) => level >= s.minLevel) || comp.stages[comp.stages.length - 1];
  return {
    ...comp,
    currentStage: stage,
    formattedStage: `${stage.badgeLabel}`,
  };
}

export const LEVEL_THRESHOLDS = [
  { level: 1, title: 'Rhythm Explorer', minXp: 0, maxXp: 100 },
  { level: 2, title: 'Task Pathfinder', minXp: 100, maxXp: 250 },
  { level: 3, title: 'Focus Alchemist', minXp: 250, maxXp: 450 },
  { level: 4, title: 'Rhythm Master', minXp: 450, maxXp: 700 },
  { level: 5, title: 'Clarity Champion', minXp: 700, maxXp: 1000 },
  { level: 6, title: 'Habit Maestro', minXp: 1000, maxXp: 1500 },
  { level: 7, title: 'Zen Grandmaster', minXp: 1500, maxXp: 99999 },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_step',
    title: 'First Spark',
    description: 'Completed your very first action item.',
    iconName: 'Zap',
    unlockedAt: null,
    category: 'milestone',
    requirement: 'Complete 1 task',
  },
  {
    id: 'morning_sun',
    title: 'Morning Light',
    description: 'Completed a morning routine task to start the day.',
    iconName: 'Sun',
    unlockedAt: null,
    category: 'routine',
    requirement: 'Complete 1 morning task',
  },
  {
    id: 'hydration_hero',
    title: 'Hydration Hero',
    description: 'Prioritized drinking water and nourishing yourself.',
    iconName: 'Droplets',
    unlockedAt: null,
    category: 'routine',
    requirement: 'Complete hydration or meal task',
  },
  {
    id: 'three_day_streak',
    title: 'Gentle Flow',
    description: 'Kept your routine alive for 3 days.',
    iconName: 'Flame',
    unlockedAt: null,
    category: 'streak',
    requirement: 'Reach a 3-day streak',
  },
  {
    id: 'focus_mode',
    title: 'Deep Clarity',
    description: 'Used single-task Focus Mode to conquer executive overwhelm.',
    iconName: 'Target',
    unlockedAt: null,
    category: 'milestone',
    requirement: 'Complete a task in Focus Mode',
  },
  {
    id: 'custom_creator',
    title: 'Rhythm Architect',
    description: 'Created a customized task tailored to your unique brain.',
    iconName: 'PenTool',
    unlockedAt: null,
    category: 'milestone',
    requirement: 'Create a custom task',
  },
  {
    id: 'level_3_reached',
    title: 'Focus Alchemist',
    description: 'Reached Level 3 through consistent small wins.',
    iconName: 'Award',
    unlockedAt: null,
    category: 'xp',
    requirement: 'Reach Level 3',
  },
  {
    id: 'clean_sweep',
    title: 'Total Harmony',
    description: 'Completed all routine items for the day.',
    iconName: 'Sparkles',
    unlockedAt: null,
    category: 'milestone',
    requirement: 'Complete 100% of tasks today',
  },
];

export function getLevelInfo(xp: number) {
  const current =
    LEVEL_THRESHOLDS.find(
      (t, idx) => xp >= t.minXp && (xp < t.maxXp || idx === LEVEL_THRESHOLDS.length - 1)
    ) || LEVEL_THRESHOLDS[0];

  const level = current.level;
  const levelTitle = current.title;
  const minXp = current.minXp;
  const maxXp = current.maxXp;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((xp - minXp) / Math.max(1, maxXp - minXp)) * 100))
  );

  return {
    level,
    levelTitle,
    minXp,
    maxXp,
    xpInCurrentLevel: Math.max(0, xp - minXp),
    xpNeededForNext: maxXp - minXp,
    progressPercent,
  };
}

/**
 * Calculates current streak dynamically based on actual task completion history
 */
export function calculateStreakFromTasks(tasks: TaskItem[], todayStr: string): number {
  const activeTasks = tasks.filter((t) => !t.archived);
  if (activeTasks.length === 0) return 0;

  // Check if at least 1 task is completed today
  const completedToday = activeTasks.some(
    (t) => Array.isArray(t.completedDates) && t.completedDates.includes(todayStr)
  );

  let streak = 0;
  let checkDayOffset = 0;

  if (completedToday) {
    streak = 1;
    checkDayOffset = 1;
  } else {
    // Check if yesterday was completed
    const yesterdayStr = getDateMinusDays(1, todayStr);
    const completedYesterday = activeTasks.some(
      (t) => Array.isArray(t.completedDates) && t.completedDates.includes(yesterdayStr)
    );
    if (completedYesterday) {
      streak = 1;
      checkDayOffset = 2;
    } else {
      return 0; // 0 streak if neither today nor yesterday had completions
    }
  }

  // Traverse consecutive days backwards
  while (checkDayOffset <= 365) {
    const pastDayStr = getDateMinusDays(checkDayOffset, todayStr);
    const hadCompletion = activeTasks.some(
      (t) => Array.isArray(t.completedDates) && t.completedDates.includes(pastDayStr)
    );
    if (hadCompletion) {
      streak += 1;
      checkDayOffset += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateDailyStreak(
  prevStats: UserStats,
  todayStr: string
): { updatedStats: UserStats; shieldUsed: boolean; usedShield: boolean } {
  const yesterdayStr = getDateMinusDays(1, todayStr);
  const twoDaysAgoStr = getDateMinusDays(2, todayStr);

  let currentStreak = prevStats.currentStreak;
  let streakShields = prevStats.streakShields;
  let shieldUsed = false;

  if (!prevStats.lastActiveDate || prevStats.lastActiveDate === todayStr) {
    // New user or already active today
    return { updatedStats: prevStats, shieldUsed: false, usedShield: false };
  }

  if (prevStats.lastActiveDate === yesterdayStr) {
    // Yesterday was active - streak is continuous
  } else if (prevStats.lastActiveDate === twoDaysAgoStr) {
    // Missed yesterday! Check for streak shield protection
    if (streakShields > 0) {
      streakShields -= 1;
      shieldUsed = true;
    } else {
      currentStreak = 0;
    }
  } else if (prevStats.lastActiveDate && prevStats.lastActiveDate < twoDaysAgoStr) {
    // Inactive for multiple days
    currentStreak = 0;
  }

  const longestStreak = Math.max(prevStats.longestStreak, currentStreak);

  return {
    updatedStats: {
      ...prevStats,
      currentStreak,
      longestStreak,
      streakShields,
    },
    shieldUsed,
    usedShield: shieldUsed,
  };
}

export function checkNewBadges(
  stats: UserStats,
  tasks: TaskItem[],
  todayStr: string,
  currentBadges: Badge[],
  context?: { usedFocusMode?: boolean; createdCustom?: boolean }
): { updatedBadges: Badge[]; newlyUnlocked: Badge[] } {
  const newlyUnlocked: Badge[] = [];

  const updatedBadges = currentBadges.map((badge) => {
    if (badge.unlockedAt) return badge;

    let shouldUnlock = false;

    if (badge.id === 'first_step' && stats.totalCompletions >= 1) {
      shouldUnlock = true;
    } else if (badge.id === 'morning_sun') {
      const completedMorning = tasks.some(
        (t) => t.category === 'morning' && Array.isArray(t.completedDates) && t.completedDates.includes(todayStr)
      );
      if (completedMorning) shouldUnlock = true;
    } else if (badge.id === 'hydration_hero') {
      const hydrationKeywords = ['water', 'hydrate', 'hydration', 'agua', 'água', 'eau', 'wasser', 'acqua', '水', 'meal', 'nourish', 'comida', 'repas', 'essen'];
      const completedHydration = tasks.some(
        (t) =>
          (t.id === 'def_hydrate' || hydrationKeywords.some((kw) => t.title.toLowerCase().includes(kw))) &&
          Array.isArray(t.completedDates) &&
          t.completedDates.includes(todayStr)
      );
      if (completedHydration) shouldUnlock = true;
    } else if (badge.id === 'three_day_streak' && stats.currentStreak >= 3) {
      shouldUnlock = true;
    } else if (badge.id === 'focus_mode' && context?.usedFocusMode) {
      shouldUnlock = true;
    } else if (badge.id === 'custom_creator' && context?.createdCustom) {
      shouldUnlock = true;
    } else if (badge.id === 'level_3_reached' && stats.level >= 3) {
      shouldUnlock = true;
    } else if (badge.id === 'clean_sweep') {
      const todayScheduledTasks = tasks.filter((t) => isTaskScheduledForToday(t, todayStr));
      const allDone =
        todayScheduledTasks.length > 0 &&
        todayScheduledTasks.every((t) => Array.isArray(t.completedDates) && t.completedDates.includes(todayStr));
      if (allDone) shouldUnlock = true;
    }

    if (shouldUnlock) {
      const unlockedBadge = { ...badge, unlockedAt: new Date().toISOString() };
      newlyUnlocked.push(unlockedBadge);
      return unlockedBadge;
    }

    return badge;
  });

  return { updatedBadges, newlyUnlocked };
}
