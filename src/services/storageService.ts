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
  if (baseDateStr && typeof baseDateStr === 'string') {
    const parts = baseDateStr.split('-');
    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      if (
        Number.isInteger(year) &&
        Number.isInteger(month) &&
        Number.isInteger(day) &&
        month >= 0 &&
        month <= 11 &&
        day >= 1 &&
        day <= 31
      ) {
        const candidate = new Date(year, month, day, 12, 0, 0);
        if (!isNaN(candidate.getTime())) {
          d = candidate;
        }
      }
    }
  } else {
    d.setHours(12, 0, 0, 0);
  }
  const cleanDaysAgo = Number.isFinite(daysAgo) ? Math.floor(daysAgo) : 0;
  d.setDate(d.getDate() - cleanDaysAgo);
  return getTodayDateString(d);
};

/**
 * Determines whether a task is scheduled for a specific date (defaults to today).
 * Accurately handles daily recurrence, custom days of week, and one-off lifecycle rules.
 */
export function isTaskScheduledForToday(task: TaskItem, dateStr: string = getTodayDateString()): boolean {
  if (!task || typeof task !== 'object' || task.archived) return false;

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
      if (parts.length === 3) {
        const year = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const day = Number(parts[2]);
        const d = new Date(year, month, day, 12, 0, 0);
        if (!isNaN(d.getTime())) {
          return task.daysOfWeek.includes(d.getDay());
        }
      }
      return true;
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
  if (!Array.isArray(tasks)) return [];
  return tasks.filter((t) => isTaskScheduledForToday(t, dateStr));
}

/**
 * Returns all incomplete tasks scheduled for a given date.
 */
export function getTodayIncompleteTasks(tasks: TaskItem[], dateStr: string = getTodayDateString()): TaskItem[] {
  if (!Array.isArray(tasks)) return [];
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
    return parsed.map((t, idx) => sanitizeImportedTask(t, idx));
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
    return sanitizeImportedSettings(JSON.parse(raw));
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
    return sanitizeImportedStats(JSON.parse(raw));
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
    return sanitizeImportedBadges(JSON.parse(raw));
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

export function sanitizeImportedTask(raw: unknown, idx: number = 0): TaskItem {
  const t = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const cleanStr = (val: unknown, fallback: string, maxLen: number) =>
    typeof val === 'string' ? val.trim().slice(0, maxLen) : fallback;
  const cleanNum = (val: unknown, min: number, max: number, fallback: number) =>
    typeof val === 'number' && Number.isFinite(val) ? Math.max(min, Math.min(max, Math.floor(val))) : fallback;

  const validCategories = ['morning', 'afternoon', 'evening', 'anytime'] as const;
  const validPriorities = ['low', 'medium', 'high'] as const;
  const validRecurrences = ['daily', 'custom_days', 'one-off'] as const;

  const sanitizedSubTasks: TaskItem['subTasks'] = Array.isArray(t.subTasks)
    ? t.subTasks.slice(0, 50).map((st, sIdx) => {
        const item = st && typeof st === 'object' ? (st as Record<string, unknown>) : {};
        return {
          id: cleanStr(item.id, `st_${idx}_${sIdx}_${Date.now()}`, 50),
          title: cleanStr(item.title, 'Step', 200),
          completed: Boolean(item.completed),
        };
      })
    : [];

  const sanitizedDates: string[] = Array.isArray(t.completedDates)
    ? t.completedDates.filter((d): d is string => {
        if (typeof d !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(d)) return false;
        const [y, m, day] = d.split('-').map(Number);
        const dt = new Date(y, m - 1, day, 12, 0, 0);
        return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === day;
      })
    : [];

  const rawRecurrence = t.recurrenceType || (t.isOneOff ? 'one-off' : 'daily');
  const recurrenceType = validRecurrences.includes(rawRecurrence as any) ? (rawRecurrence as any) : 'daily';

  const daysOfWeek = Array.isArray(t.daysOfWeek)
    ? t.daysOfWeek.filter((day): day is number => Number.isInteger(day) && day >= 0 && day <= 6)
    : undefined;

  return {
    id: cleanStr(t.id, `task_imp_${idx}_${Date.now()}`, 64),
    title: cleanStr(t.title, 'Untitled Task', 200),
    description: cleanStr(t.description, '', 2000),
    category: validCategories.includes(t.category as any) ? (t.category as any) : 'morning',
    priority: validPriorities.includes(t.priority as any) ? (t.priority as any) : 'medium',
    xpValue: cleanNum(t.xpValue, 5, 25, 15),
    estimatedMinutes: cleanNum(t.estimatedMinutes, 1, 1440, 5),
    iconName: cleanStr(t.iconName, 'Sparkles', 50),
    completedDates: sanitizedDates,
    createdAt: typeof t.createdAt === 'string' ? t.createdAt.slice(0, 40) : new Date().toISOString(),
    order: cleanNum(t.order, 0, 10000, idx + 1),
    isDefault: Boolean(t.isDefault),
    archived: Boolean(t.archived),
    subTasks: sanitizedSubTasks,
    recurrenceType,
    daysOfWeek,
    isOneOff: Boolean(t.isOneOff || recurrenceType === 'one-off'),
  };
}

export function sanitizeImportedSettings(raw: unknown): SensorySettings {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return DEFAULT_SETTINGS;
  const s = raw as Record<string, unknown>;
  const validThemes = ['sage', 'sunset', 'slate', 'high-contrast'] as const;
  const validLangs = ['auto', 'en', 'es', 'fr', 'de', 'ja', 'pt', 'zh', 'it', 'nl'] as const;
  const validBatteries = ['full', 'half', 'empty'] as const;
  const validCompanions = ['pip', 'mochi', 'nova', 'bubbles'] as const;

  return {
    language: validLangs.includes(s.language as any) ? (s.language as any) : DEFAULT_SETTINGS.language,
    soundEnabled: typeof s.soundEnabled === 'boolean' ? s.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
    soundVolume:
      typeof s.soundVolume === 'number' && Number.isFinite(s.soundVolume)
        ? Math.max(0, Math.min(1, s.soundVolume))
        : DEFAULT_SETTINGS.soundVolume,
    soundPack: ['chimes', 'bamboo', 'cyber', 'lofi'].includes(s.soundPack as string)
      ? (s.soundPack as any)
      : DEFAULT_SETTINGS.soundPack,
    reducedMotion: typeof s.reducedMotion === 'boolean' ? s.reducedMotion : DEFAULT_SETTINGS.reducedMotion,
    dyslexicFont: typeof s.dyslexicFont === 'boolean' ? s.dyslexicFont : DEFAULT_SETTINGS.dyslexicFont,
    bionicReading: typeof s.bionicReading === 'boolean' ? s.bionicReading : DEFAULT_SETTINGS.bionicReading,
    readingRuler: typeof s.readingRuler === 'boolean' ? s.readingRuler : DEFAULT_SETTINGS.readingRuler,
    theme: validThemes.includes(s.theme as any) ? (s.theme as any) : DEFAULT_SETTINGS.theme,
    celebrationIntensity: ['gentle', 'normal', 'festive'].includes(s.celebrationIntensity as string)
      ? (s.celebrationIntensity as any)
      : DEFAULT_SETTINGS.celebrationIntensity,
    compactView: typeof s.compactView === 'boolean' ? s.compactView : DEFAULT_SETTINGS.compactView,
    showCompanion: typeof s.showCompanion === 'boolean' ? s.showCompanion : DEFAULT_SETTINGS.showCompanion,
    companionChoice: validCompanions.includes(s.companionChoice as any)
      ? (s.companionChoice as any)
      : DEFAULT_SETTINGS.companionChoice,
    energyBattery: validBatteries.includes(s.energyBattery as any)
      ? (s.energyBattery as any)
      : DEFAULT_SETTINGS.energyBattery,
  };
}

export function sanitizeImportedStats(raw: unknown): UserStats {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return DEFAULT_STATS;
  const s = raw as Record<string, unknown>;
  const cleanNum = (val: unknown, min: number, max: number, def: number) =>
    typeof val === 'number' && Number.isFinite(val) ? Math.max(min, Math.min(max, Math.floor(val))) : def;

  return {
    xp: cleanNum(s.xp, 0, 1000000, DEFAULT_STATS.xp),
    level: cleanNum(s.level, 1, 99, DEFAULT_STATS.level),
    levelTitle: typeof s.levelTitle === 'string' ? s.levelTitle.slice(0, 50) : DEFAULT_STATS.levelTitle,
    currentStreak: cleanNum(s.currentStreak, 0, 3650, DEFAULT_STATS.currentStreak),
    longestStreak: cleanNum(s.longestStreak, 0, 3650, DEFAULT_STATS.longestStreak),
    streakShields: cleanNum(s.streakShields, 0, 10, DEFAULT_STATS.streakShields),
    totalCompletions: cleanNum(s.totalCompletions, 0, 1000000, DEFAULT_STATS.totalCompletions),
    lastActiveDate: typeof s.lastActiveDate === 'string' && s.lastActiveDate.length <= 20 ? s.lastActiveDate : '',
    tutorialXpAwarded: typeof s.tutorialXpAwarded === 'boolean' ? s.tutorialXpAwarded : DEFAULT_STATS.tutorialXpAwarded,
  };
}

export function sanitizeImportedBadges(raw: unknown): Badge[] {
  if (!Array.isArray(raw)) return INITIAL_BADGES;
  const importedMap = new Map(
    raw
      .filter((b: unknown): b is Badge => Boolean(b && typeof b === 'object' && 'id' in (b as Record<string, unknown>)))
      .map((b: Badge) => [b.id, b])
  );
  return INITIAL_BADGES.map((initBadge) => {
    const found = importedMap.get(initBadge.id);
    return found ? { ...initBadge, unlockedAt: typeof found.unlockedAt === 'string' ? found.unlockedAt : null } : initBadge;
  });
}

export function importBackupJSON(jsonStr: string): boolean {
  try {
    if (!jsonStr || typeof jsonStr !== 'string') return false;
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return false;

    if (data.tasks && Array.isArray(data.tasks)) {
      const sanitizedTasks: TaskItem[] = data.tasks.map(sanitizeImportedTask);
      saveTasks(sanitizedTasks);
    }
    if (data.settings && typeof data.settings === 'object' && !Array.isArray(data.settings)) {
      saveSettings(sanitizeImportedSettings(data.settings));
    }
    if (data.stats && typeof data.stats === 'object' && !Array.isArray(data.stats)) {
      saveStats(sanitizeImportedStats(data.stats));
    }
    if (data.badges && Array.isArray(data.badges)) {
      saveBadges(sanitizeImportedBadges(data.badges));
    }
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}
