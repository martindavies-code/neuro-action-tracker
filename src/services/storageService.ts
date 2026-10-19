import type { Badge, DayCompletionRecord, SensorySettings, TaskItem, UserStats } from '../types';
import { INITIAL_BADGES } from './gamificationService';

const STORAGE_KEYS = {
  TASKS: 'nat_tasks_v2',
  SETTINGS: 'nat_sensory_settings_v1',
  STATS: 'nat_user_stats_v2',
  BADGES: 'nat_badges_v1',
  ONBOARDING_DONE: 'nat_onboarding_completed_v1',
};

export const getTodayDateString = (dateObj: Date = new Date()): string => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getDateMinusDays = (daysAgo: number, baseDateStr?: string): string => {
  let d = new Date();
  if (baseDateStr) {
    const parts = baseDateStr.split('-');
    if (parts.length === 3) {
      d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
    }
  } else {
    d.setHours(12, 0, 0, 0);
  }
  d.setDate(d.getDate() - daysAgo);
  return getTodayDateString(d);
};

/**
 * Determines whether a task is scheduled for a specific date (defaults to today).
 * Accurately handles daily recurrence, custom days of week, and one-off lifecycle rules.
 */
export function isTaskScheduledForToday(task: TaskItem, dateStr: string = getTodayDateString()): boolean {
  if (task.archived) return false;

  // 1. One-off task rule:
  if (task.isOneOff || task.recurrenceType === 'one-off') {
    const completedDates = Array.isArray(task.completedDates) ? task.completedDates : [];
    if (completedDates.length === 0) return true; // Never completed -> active
    if (completedDates.includes(dateStr)) return true; // Completed on this date -> show so user can inspect/uncheck
    return false; // Completed on a past date -> done forever, hidden from active checklist
  }

  // 2. Custom days of week rule (0 = Sun, 1 = Mon ... 6 = Sat):
  if (task.recurrenceType === 'custom_days' && Array.isArray(task.daysOfWeek) && task.daysOfWeek.length > 0) {
    try {
      const parts = dateStr.split('-');
      const d = parts.length === 3 ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0) : new Date();
      return task.daysOfWeek.includes(d.getDay());
    } catch {
      return true;
    }
  }

  // 3. Default (daily):
  return true;
}

/**
 * Returns all active tasks scheduled for a given date.
 */
export function getTodayTasks(tasks: TaskItem[], dateStr: string = getTodayDateString()): TaskItem[] {
  return tasks.filter((t) => isTaskScheduledForToday(t, dateStr));
}

/**
 * Returns all incomplete tasks scheduled for a given date.
 */
export function getTodayIncompleteTasks(tasks: TaskItem[], dateStr: string = getTodayDateString()): TaskItem[] {
  return tasks.filter(
    (t) => isTaskScheduledForToday(t, dateStr) && !(Array.isArray(t.completedDates) && t.completedDates.includes(dateStr))
  );
}

export const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'def_brush_morning',
    title: 'Brush Teeth (Morning)',
    description: 'Fresh start for a clean mouth & clear mind',
    category: 'morning',
    priority: 'high',
    xpValue: 15,
    estimatedMinutes: 2,
    iconName: 'Sparkles',
    completedDates: [],
    isDefault: true,
    createdAt: new Date().toISOString(),
    order: 1,
    recurrenceType: 'daily',
    subTasks: [],
  },
  {
    id: 'def_healthy_food',
    title: 'Eat a Nourishing Meal',
    description: 'Brain fuel with protein, fiber, or healthy whole foods',
    category: 'morning',
    priority: 'high',
    xpValue: 20,
    estimatedMinutes: 15,
    iconName: 'Utensils',
    completedDates: [],
    isDefault: true,
    createdAt: new Date().toISOString(),
    order: 2,
    recurrenceType: 'daily',
    subTasks: [],
  },
  {
    id: 'def_hydrate',
    title: 'Drink 2 Glasses of Water',
    description: 'Stay refreshed and keep energy levels steady',
    category: 'anytime',
    priority: 'medium',
    xpValue: 10,
    estimatedMinutes: 1,
    iconName: 'Droplets',
    completedDates: [],
    isDefault: true,
    createdAt: new Date().toISOString(),
    order: 3,
    recurrenceType: 'daily',
    subTasks: [],
  },
  {
    id: 'def_stretch',
    title: '5-Minute Gentle Stretch or Movement',
    description: 'Release tension in neck, shoulders, and back',
    category: 'afternoon',
    priority: 'medium',
    xpValue: 15,
    estimatedMinutes: 5,
    iconName: 'Activity',
    completedDates: [],
    isDefault: true,
    createdAt: new Date().toISOString(),
    order: 4,
    recurrenceType: 'daily',
    subTasks: [],
  },
  {
    id: 'def_meds',
    title: 'Take Daily Vitamins / Medication',
    description: 'Essential wellness support on schedule',
    category: 'morning',
    priority: 'high',
    xpValue: 20,
    estimatedMinutes: 1,
    iconName: 'Pill',
    completedDates: [],
    isDefault: true,
    createdAt: new Date().toISOString(),
    order: 5,
    recurrenceType: 'daily',
    subTasks: [],
  },
  {
    id: 'def_tidy',
    title: '5-Minute Space Reset',
    description: 'Clear desk or bedroom surface to lower cognitive noise',
    category: 'evening',
    priority: 'low',
    xpValue: 15,
    estimatedMinutes: 5,
    iconName: 'CheckCircle2',
    completedDates: [],
    isDefault: true,
    createdAt: new Date().toISOString(),
    order: 6,
    recurrenceType: 'daily',
    subTasks: [],
  },
  {
    id: 'def_brush_night',
    title: 'Brush Teeth (Evening)',
    description: 'Wind-down nighttime dental care before bed',
    category: 'evening',
    priority: 'high',
    xpValue: 15,
    estimatedMinutes: 2,
    iconName: 'Moon',
    completedDates: [],
    isDefault: true,
    createdAt: new Date().toISOString(),
    order: 7,
    recurrenceType: 'daily',
    subTasks: [],
  },
];

export const DEFAULT_SETTINGS: SensorySettings = {
  language: 'auto',
  soundEnabled: true,
  soundVolume: 0.5,
  soundPack: 'chimes',
  reducedMotion: false,
  dyslexicFont: false,
  bionicReading: false,
  readingRuler: false,
  theme: 'sage',
  celebrationIntensity: 'normal',
  compactView: false,
  showCompanion: true,
  companionChoice: 'pip',
  energyBattery: 'full',
};

export const DEFAULT_STATS: UserStats = {
  xp: 0,
  level: 1,
  levelTitle: 'Rhythm Explorer',
  currentStreak: 0,
  longestStreak: 0,
  streakShields: 2, // Welcome gift: 2 protective shields
  totalCompletions: 0,
  lastActiveDate: '',
  tutorialXpAwarded: false,
};

// Storage helper functions
export function loadTasks(): TaskItem[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_TASKS;
    const raw = window.localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      saveTasks(DEFAULT_TASKS);
      return DEFAULT_TASKS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_TASKS;
    return parsed.map((t) => ({
      ...t,
      xpValue: Math.min(25, Math.max(5, Number(t.xpValue) || 15)),
      completedDates: Array.isArray(t.completedDates) ? t.completedDates : [],
      subTasks: Array.isArray(t.subTasks) ? t.subTasks : [],
      recurrenceType: t.recurrenceType || (t.isOneOff ? 'one-off' : 'daily'),
      daysOfWeek: Array.isArray(t.daysOfWeek) ? t.daysOfWeek : undefined,
      isOneOff: Boolean(t.isOneOff || t.recurrenceType === 'one-off'),
    }));
  } catch {
    return DEFAULT_TASKS;
  }
}

export function saveTasks(tasks: TaskItem[]) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch {
    // Graceful fallback
  }
}

export function loadSettings(): SensorySettings {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_SETTINGS;
    const raw = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SensorySettings) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Graceful fallback
  }
}

export function loadStats(): UserStats {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_STATS;
    const raw = window.localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) {
      saveStats(DEFAULT_STATS);
      return DEFAULT_STATS;
    }
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: UserStats) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch {
    // Graceful fallback
  }
}

export function loadBadges(): Badge[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return INITIAL_BADGES;
    const raw = window.localStorage.getItem(STORAGE_KEYS.BADGES);
    if (!raw) {
      saveBadges(INITIAL_BADGES);
      return INITIAL_BADGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BADGES;
  }
}

export function saveBadges(badges: Badge[]) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  } catch {
    // Graceful fallback
  }
}

export function isOnboardingCompleted(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return window.localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
  } catch {
    return false;
  }
}

export function setOnboardingCompleted(completed: boolean) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, completed ? 'true' : 'false');
  } catch {
    // Graceful fallback
  }
}

export function getPast7DaysCompletion(tasks: TaskItem[]): DayCompletionRecord[] {
  const records: DayCompletionRecord[] = [];
  const activeTasks = tasks.filter((t) => !t.archived);

  for (let i = 6; i >= 0; i--) {
    const dateStr = getDateMinusDays(i);
    const scheduledForDate = activeTasks.filter((t) => isTaskScheduledForToday(t, dateStr));
    const completed = activeTasks.filter((t) => Array.isArray(t.completedDates) && t.completedDates.includes(dateStr));
    const xpEarned = completed.reduce((sum, t) => sum + (t.xpValue || 0), 0);

    records.push({
      date: dateStr,
      completedCount: completed.length,
      totalAvailable: Math.max(scheduledForDate.length, completed.length),
      xpEarned,
    });
  }

  return records;
}

export function resetAllData() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.removeItem(STORAGE_KEYS.TASKS);
  window.localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  window.localStorage.removeItem(STORAGE_KEYS.STATS);
  window.localStorage.removeItem(STORAGE_KEYS.BADGES);
  window.localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DONE);
}

export function exportBackupJSON(): string {
  const data = {
    tasks: loadTasks(),
    settings: loadSettings(),
    stats: loadStats(),
    badges: loadBadges(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.tasks && Array.isArray(data.tasks)) {
      const sanitizedTasks: TaskItem[] = data.tasks.map((t: Partial<TaskItem>, idx: number) => ({
        id: t.id || `task_imp_${idx}_${Date.now()}`,
        title: t.title || 'Untitled Task',
        description: t.description || '',
        category: t.category || 'morning',
        priority: t.priority || 'medium',
        xpValue: Math.min(25, Math.max(5, typeof t.xpValue === 'number' ? t.xpValue : 15)),
        estimatedMinutes: typeof t.estimatedMinutes === 'number' ? t.estimatedMinutes : 5,
        iconName: t.iconName || 'Sparkles',
        completedDates: Array.isArray(t.completedDates) ? t.completedDates : [],
        createdAt: t.createdAt || new Date().toISOString(),
        order: typeof t.order === 'number' ? t.order : idx + 1,
        isDefault: Boolean(t.isDefault),
        archived: Boolean(t.archived),
        subTasks: Array.isArray(t.subTasks) ? t.subTasks : [],
        recurrenceType: t.recurrenceType || (t.isOneOff ? 'one-off' : 'daily'),
        daysOfWeek: Array.isArray(t.daysOfWeek) ? t.daysOfWeek : undefined,
        isOneOff: Boolean(t.isOneOff || t.recurrenceType === 'one-off'),
      }));
      saveTasks(sanitizedTasks);
    }
    if (data.settings && typeof data.settings === 'object') {
      saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }
    if (data.stats && typeof data.stats === 'object') {
      saveStats({ ...DEFAULT_STATS, ...data.stats });
    }
    if (data.badges && Array.isArray(data.badges)) {
      const importedMap = new Map(data.badges.map((b: Badge) => [b.id, b]));
      const mergedBadges = INITIAL_BADGES.map((initBadge) => {
        const found = importedMap.get(initBadge.id);
        return found ? { ...initBadge, ...found } : initBadge;
      });
      saveBadges(mergedBadges);
    }
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}
