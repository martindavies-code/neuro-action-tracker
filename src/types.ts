export type Priority = 'high' | 'medium' | 'low';

export type RoutineCategory = 'morning' | 'afternoon' | 'evening' | 'anytime';

export type RecurrenceType = 'daily' | 'one-off' | 'custom_days';

export type ThemeMode = 'sage' | 'sunset' | 'slate' | 'high-contrast';

export type CelebrationIntensity = 'gentle' | 'normal' | 'vibrant';

export type CompanionChoice = 'pip' | 'mochi' | 'nova' | 'bubbles';

export type EnergyBattery = 'full' | 'moderate' | 'low'; // Spoon Theory

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  category: RoutineCategory;
  priority: Priority;
  xpValue: number;
  estimatedMinutes?: number;
  iconName: string;
  completedDates: string[]; // ISO date strings 'YYYY-MM-DD'
  isDefault?: boolean;
  createdAt: string;
  order: number;
  archived?: boolean;
  subTasks?: SubTask[];
  isBonusBoosted?: boolean;
  recurrenceType?: RecurrenceType;
  daysOfWeek?: number[]; // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  isOneOff?: boolean;
}

export type SupportedLanguage = 'auto' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'pt' | 'it' | 'zh' | 'ko';

export interface SensorySettings {
  language: SupportedLanguage;
  soundEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0
  soundPack: 'chimes' | 'retro' | 'water';
  reducedMotion: boolean;
  dyslexicFont: boolean;
  bionicReading: boolean;
  readingRuler: boolean;
  theme: ThemeMode;
  celebrationIntensity: CelebrationIntensity;
  compactView: boolean;
  showCompanion: boolean;
  companionChoice: CompanionChoice;
  energyBattery: EnergyBattery;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt: string | null;
  category: 'streak' | 'xp' | 'routine' | 'milestone';
  requirement: string;
}

export interface UserStats {
  xp: number;
  level: number;
  levelTitle: string;
  currentStreak: number;
  longestStreak: number;
  streakShields: number;
  totalCompletions: number;
  lastActiveDate: string;
  tutorialXpAwarded?: boolean;
}

export interface DayCompletionRecord {
  date: string; // YYYY-MM-DD
  completedCount: number;
  totalAvailable: number;
  xpEarned: number;
}

export type ViewTab = 'today' | 'dashboard' | 'settings' | 'focus';
