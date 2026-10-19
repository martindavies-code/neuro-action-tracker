import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  isTaskScheduledForToday,
  getTodayIncompleteTasks,
  getPast7DaysCompletion,
  getDateMinusDays,
  DEFAULT_TASKS,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  importBackupJSON,
  sanitizeImportedTask,
  sanitizeImportedSettings,
  sanitizeImportedStats,
  sanitizeImportedBadges,
  loadTasks,
  loadStats,
} from '../src/services/storageService.ts';
import {
  getLevelInfo,
  calculateStreakFromTasks,
  calculateDailyStreak,
  checkNewBadges,
  INITIAL_BADGES,
  getCompanionStage,
  COMPANION_DEFINITIONS,
} from '../src/services/gamificationService.ts';
import { generateMagicSubTasks, calculateTaskDifficultyAndXP } from '../src/services/aiBreakdownService.ts';
import { TRANSLATIONS, resolveActiveLanguage } from '../src/services/i18nService.ts';
import { ambientAudio } from '../src/services/ambientAudioService.ts';
import { speechService } from '../src/services/speechService.ts';
import { sound } from '../src/services/soundService.ts';
import { getIconComponent } from '../src/utils/iconMap.ts';
import type { TaskItem, UserStats, Badge, CompanionChoice } from '../src/types.ts';

describe('1. Task Scheduling & Lifecycle Engine', () => {
  const baseTask: TaskItem = {
    id: 'test_1',
    title: 'Test Routine',
    category: 'morning',
    priority: 'medium',
    xpValue: 15,
    iconName: 'Sparkles',
    completedDates: [],
    createdAt: '2026-08-30T00:00:00.000Z',
    order: 1,
    recurrenceType: 'daily',
  };

  it('correctly schedules standard daily tasks', () => {
    assert.strictEqual(isTaskScheduledForToday(baseTask, '2026-08-30'), true);
    assert.strictEqual(isTaskScheduledForToday(baseTask, '2026-09-01'), true);
  });

  it('rejects archived tasks immediately', () => {
    const archivedTask = { ...baseTask, archived: true };
    assert.strictEqual(isTaskScheduledForToday(archivedTask, '2026-08-30'), false);
  });

  it('handles one-off tasks lifecycle correctly', () => {
    const oneOffTask: TaskItem = {
      ...baseTask,
      id: 'one_off_1',
      isOneOff: true,
      recurrenceType: 'one-off',
      completedDates: [],
    };

    // Uncompleted one-off should be active today
    assert.strictEqual(isTaskScheduledForToday(oneOffTask, '2026-08-30'), true);

    // Completed today -> still active today so user can review/uncheck
    const completedToday: TaskItem = {
      ...oneOffTask,
      completedDates: ['2026-08-30'],
    };
    assert.strictEqual(isTaskScheduledForToday(completedToday, '2026-08-30'), true);

    // Completed on a previous day -> hidden/done forever!
    const completedYesterday: TaskItem = {
      ...oneOffTask,
      completedDates: ['2026-08-29'],
    };
    assert.strictEqual(isTaskScheduledForToday(completedYesterday, '2026-08-30'), false);
  });

  it('handles custom days of week recurrence accurately', () => {
    // 2026-08-30 is Sunday (0)
    // 2026-08-31 is Monday (1)
    // 2026-09-05 is Saturday (6)
    const weekendTask: TaskItem = {
      ...baseTask,
      recurrenceType: 'custom_days',
      daysOfWeek: [0, 6], // Sun, Sat
    };

    assert.strictEqual(isTaskScheduledForToday(weekendTask, '2026-08-30'), true); // Sunday
    assert.strictEqual(isTaskScheduledForToday(weekendTask, '2026-08-31'), false); // Monday
    assert.strictEqual(isTaskScheduledForToday(weekendTask, '2026-09-05'), true); // Saturday

    const weekdayTask: TaskItem = {
      ...baseTask,
      recurrenceType: 'custom_days',
      daysOfWeek: [1, 2, 3, 4, 5],
    };
    assert.strictEqual(isTaskScheduledForToday(weekdayTask, '2026-08-30'), false); // Sunday
    assert.strictEqual(isTaskScheduledForToday(weekdayTask, '2026-08-31'), true); // Monday
  });

  it('filters getTodayIncompleteTasks accurately', () => {
    const taskA: TaskItem = { ...baseTask, id: 'a', completedDates: ['2026-08-30'] };
    const taskB: TaskItem = { ...baseTask, id: 'b', completedDates: [] };
    const taskC: TaskItem = { ...baseTask, id: 'c', isOneOff: true, recurrenceType: 'one-off', completedDates: ['2026-08-28'] };

    const list = [taskA, taskB, taskC];
    const incomplete = getTodayIncompleteTasks(list, '2026-08-30');
    assert.strictEqual(incomplete.length, 1);
    assert.strictEqual(incomplete[0].id, 'b');
  });
});

describe('2. Gamification & Streak Shield Mechanics', () => {
  it('computes level progress accurately across all boundaries', () => {
    const lvl1 = getLevelInfo(0);
    assert.strictEqual(lvl1.level, 1);
    assert.strictEqual(lvl1.progressPercent, 0);

    const lvl1Mid = getLevelInfo(50);
    assert.strictEqual(lvl1Mid.level, 1);
    assert.strictEqual(lvl1Mid.progressPercent, 50);

    const lvl2Exact = getLevelInfo(100);
    assert.strictEqual(lvl2Exact.level, 2);
    assert.strictEqual(lvl2Exact.progressPercent, 0);

    const lvl7Top = getLevelInfo(2000);
    assert.strictEqual(lvl7Top.level, 7);
    assert.strictEqual(lvl7Top.levelTitle, 'Zen Grandmaster');
  });

  it('calculates streaks dynamically from task completion dates', () => {
    const today = '2026-08-30';
    const yesterday = '2026-08-29';
    const twoDaysAgo = '2026-08-28';

    const tasksWithStreak: TaskItem[] = [
      {
        ...DEFAULT_TASKS[0],
        completedDates: [today, yesterday, twoDaysAgo],
      },
    ];
    assert.strictEqual(calculateStreakFromTasks(tasksWithStreak, today), 3);

    // If today is not completed yet, but yesterday was -> streak is 1 (alive pending today)
    const pendingToday: TaskItem[] = [
      {
        ...DEFAULT_TASKS[0],
        completedDates: [yesterday, twoDaysAgo],
      },
    ];
    assert.strictEqual(calculateStreakFromTasks(pendingToday, today), 2);

    // If both today and yesterday missed -> streak resets to 0
    const brokenStreak: TaskItem[] = [
      {
        ...DEFAULT_TASKS[0],
        completedDates: [twoDaysAgo],
      },
    ];
    assert.strictEqual(calculateStreakFromTasks(brokenStreak, today), 0);
  });

  it('protects momentum using streak shields when a day is missed', () => {
    const today = '2026-08-30';
    const twoDaysAgo = '2026-08-28';

    const statsWithShield: UserStats = {
      ...DEFAULT_STATS,
      currentStreak: 5,
      longestStreak: 5,
      streakShields: 2,
      lastActiveDate: twoDaysAgo, // Missed yesterday!
    };

    const { updatedStats, shieldUsed } = calculateDailyStreak(statsWithShield, today);
    assert.strictEqual(shieldUsed, true);
    assert.strictEqual(updatedStats.currentStreak, 5); // Streak preserved!
    assert.strictEqual(updatedStats.streakShields, 1); // 1 shield consumed

    // When 0 shields are left and a day is missed -> streak resets
    const statsNoShields: UserStats = {
      ...statsWithShield,
      streakShields: 0,
    };
    const res = calculateDailyStreak(statsNoShields, today);
    assert.strictEqual(res.shieldUsed, false);
    assert.strictEqual(res.updatedStats.currentStreak, 0);
  });

  it('awards clean_sweep only when all scheduled tasks for today are done', () => {
    const today = '2026-08-30';
    const tasks: TaskItem[] = [
      { ...DEFAULT_TASKS[0], completedDates: [today] },
      { ...DEFAULT_TASKS[1], completedDates: [today] },
      // Task scheduled for weekdays only (not today Sunday)
      { ...DEFAULT_TASKS[2], recurrenceType: 'custom_days', daysOfWeek: [1, 2, 3, 4, 5], completedDates: [] },
    ];

    const badges: Badge[] = [...INITIAL_BADGES];
    const { newlyUnlocked } = checkNewBadges(DEFAULT_STATS, tasks, today, badges);
    const cleanSweep = newlyUnlocked.find((b) => b.id === 'clean_sweep');
    assert.ok(cleanSweep, 'clean_sweep badge should unlock because all tasks scheduled for TODAY are complete');
  });

  it('unlocks hydration_hero badge with multilingual keywords', () => {
    const today = '2026-08-30';
    const spanishTask: TaskItem = {
      ...DEFAULT_TASKS[0],
      title: 'Beber 2 vasos de agua',
      completedDates: [today],
    };
    const { newlyUnlocked } = checkNewBadges(DEFAULT_STATS, [spanishTask], today, INITIAL_BADGES);
    assert.ok(newlyUnlocked.some((b) => b.id === 'hydration_hero'), 'Spanish agua should unlock hydration_hero');
  });
});

describe('3. AI Micro-Task Breakdown Service', () => {
  it('accurately matches primary domain phrases', async () => {
    const teethSteps = await generateMagicSubTasks('Brush teeth morning');
    assert.strictEqual(teethSteps.length >= 3, true);
    assert.ok(teethSteps[0].title.toLowerCase().includes('tooth') || teethSteps[0].title.toLowerCase().includes('brush'));

    const waterSteps = await generateMagicSubTasks('Drink 2 glasses of water');
    assert.strictEqual(waterSteps.length >= 3, true);
    assert.ok(waterSteps.some((s) => s.title.toLowerCase().includes('water')));
  });

  it('gracefully falls back to gentle structured micro-steps for unique custom tasks', async () => {
    const customSteps = await generateMagicSubTasks('Assemble IKEA Standing Desk');
    assert.strictEqual(customSteps.length, 4);
    assert.ok(customSteps[0].title.includes('Assemble IKEA Standing Desk'));
    assert.ok(customSteps[1].title.includes('2-minute physical step'));
  });
});

describe('4. Localization (i18n) Complete Parity Check', () => {
  it('ensures all 9 supported languages have 100% key parity with English', () => {
    const enKeys = Object.keys(TRANSLATIONS.en).sort();
    const supportedLangs = ['es', 'fr', 'de', 'ja', 'pt', 'it', 'zh', 'ko'];

    for (const lang of supportedLangs) {
      const dict = TRANSLATIONS[lang];
      assert.ok(dict, `Missing language dictionary: ${lang}`);

      const missingInLang = enKeys.filter((k) => !(k in dict));
      assert.deepStrictEqual(
        missingInLang,
        [],
        `Language "${lang}" is missing keys: ${missingInLang.join(', ')}`
      );

      // Verify no empty string translations
      for (const key of enKeys) {
        const val = dict[key as keyof typeof dict];
        assert.ok(val && val.trim().length > 0, `Empty translation for [${lang}].${key}`);
      }
    }
  });
});

describe('5. Backup JSON Data Integrity & Sanitization', () => {
  it('exports and imports clean valid state', () => {
    const validBackup = JSON.stringify({
      tasks: DEFAULT_TASKS,
      settings: DEFAULT_SETTINGS,
      stats: DEFAULT_STATS,
      badges: INITIAL_BADGES,
      version: '1.0.0',
    });

    const success = importBackupJSON(validBackup);
    assert.strictEqual(success, true);
  });

  it('safely handles corrupted or malformed input without throwing', () => {
    assert.strictEqual(importBackupJSON('NOT_JSON_INVALID'), false);
    assert.strictEqual(importBackupJSON('{}'), true);
  });
});

describe('6. Ambient Soundscape State & Subscription Persistence', () => {
  it('notifies subscribers immediately upon subscription and on volume changes', () => {
    let notifiedSound = '';
    let notifiedVol = 0;
    const unsub = ambientAudio.subscribe((s, v) => {
      notifiedSound = s;
      notifiedVol = v;
    });

    assert.strictEqual(notifiedSound, ambientAudio.getActiveSoundscape());
    assert.strictEqual(typeof notifiedVol, 'number');

    ambientAudio.setVolume(0.65);
    assert.strictEqual(notifiedVol, 0.65);
    assert.strictEqual(ambientAudio.getVolume(), 0.65);

    unsub();
  });
});

describe('7. Task Search & Multi-criteria Filtering Engine', () => {
  const sampleTasks: TaskItem[] = [
    { ...DEFAULT_TASKS[0], id: 's1', title: 'Brush teeth & floss', category: 'morning', priority: 'high', completedDates: ['2026-08-30'] },
    { ...DEFAULT_TASKS[1], id: 's2', title: 'Eat Healthy Salad', category: 'afternoon', priority: 'medium', completedDates: [] },
    { ...DEFAULT_TASKS[2], id: 's3', title: 'Gentle Yoga Stretch', category: 'evening', priority: 'low', completedDates: [] },
    { ...DEFAULT_TASKS[0], id: 's4', title: 'Archived task', archived: true, completedDates: [] },
  ];

  it('filters by keyword case-insensitively and ignores archived tasks', () => {
    const results = sampleTasks.filter(
      (t) => !t.archived && t.title.toLowerCase().includes('salad')
    );
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, 's2');
  });

  it('filters by category and completion status accurately', () => {
    const today = '2026-08-30';
    const morningTasks = sampleTasks.filter((t) => !t.archived && t.category === 'morning');
    assert.strictEqual(morningTasks.length, 1);

    const todoTasks = sampleTasks.filter((t) => !t.archived && !t.completedDates.includes(today));
    assert.strictEqual(todoTasks.length, 2);

    const doneTasks = sampleTasks.filter((t) => !t.archived && t.completedDates.includes(today));
    assert.strictEqual(doneTasks.length, 1);
    assert.strictEqual(doneTasks[0].id, 's1');
  });
});

describe('8. Speech Accessibility & Multi-language Locale Resolution', () => {
  it('correctly resolves explicit and auto fallback languages', () => {
    assert.strictEqual(resolveActiveLanguage('es'), 'es');
    assert.strictEqual(resolveActiveLanguage('fr'), 'fr');
    assert.strictEqual(resolveActiveLanguage('de'), 'de');
    assert.strictEqual(resolveActiveLanguage('ja'), 'ja');
    assert.strictEqual(resolveActiveLanguage('zh'), 'zh');
    assert.strictEqual(resolveActiveLanguage('ko'), 'ko');
    assert.strictEqual(resolveActiveLanguage('pt'), 'pt');
    assert.strictEqual(resolveActiveLanguage('it'), 'it');
    assert.strictEqual(resolveActiveLanguage('en'), 'en');

    // Auto resolution returns a valid string code
    const autoLang = resolveActiveLanguage('auto');
    assert.ok(typeof autoLang === 'string' && autoLang.length >= 2);
  });
});

describe('9. 7-Day Completion History & Scheduled Calculation Accuracy', () => {
  it('correctly calculates 7-day window and scheduled tasks per day', () => {
    const tasks: TaskItem[] = [
      { ...DEFAULT_TASKS[0], id: 'hist_1', recurrenceType: 'daily', completedDates: [] },
      { ...DEFAULT_TASKS[1], id: 'hist_2', recurrenceType: 'custom_days', daysOfWeek: [1, 3, 5], completedDates: [] },
    ];
    const records = getPast7DaysCompletion(tasks);
    assert.strictEqual(records.length, 7);
    records.forEach((rec) => {
      assert.ok(typeof rec.date === 'string' && rec.date.length === 10);
      assert.ok(rec.totalAvailable >= 1);
      assert.strictEqual(rec.completedCount, 0);
      assert.strictEqual(rec.xpEarned, 0);
    });
  });
});

describe('10. Speech Completion & Callback Lifecycle', () => {
  it('executes onEnd callback gracefully even when speech synthesis is unsupported or idle', () => {
    let ended = false;
    speechService.speak('Test gentle reminder', 'en', () => {
      ended = true;
    });
    speechService.stop();
    assert.strictEqual(speechService.isSpeaking, false);
    assert.strictEqual(ended, true);
  });
});

describe('11. Client-Side Offline Storage & Environment Resilience', () => {
  it('safely handles local storage operations without throwing in any environment', () => {
    assert.doesNotThrow(() => {
      const tasks = loadTasks();
      assert.ok(Array.isArray(tasks));
      const stats = loadStats();
      assert.ok(typeof stats.xp === 'number');
    });
  });
});

describe('12. AI Task Difficulty & Executive Friction XP Evaluator', () => {
  it('evaluates high activation barrier / dread tasks (phone calls, bureaucracy) at 20-25 XP', () => {
    const callDoctor = calculateTaskDifficultyAndXP('Call doctor to schedule prescription renewal', '', 10, 'medium');
    assert.strictEqual(callDoctor.xp >= 20, true);
    assert.strictEqual(callDoctor.tier, 'high');
    assert.ok(callDoctor.reason.includes('executive activation barrier') || callDoctor.reason.includes('High'));

    const fileTaxes = calculateTaskDifficultyAndXP('File annual taxes and submit financial invoices', '', 45, 'high', 5);
    assert.strictEqual(fileTaxes.xp, 25);
    assert.strictEqual(fileTaxes.tier, 'epic');
  });

  it('evaluates physical & sensory inertia tasks at 18-20 XP', () => {
    const scrubBathroom = calculateTaskDifficultyAndXP('Deep clean and scrub bathroom shower', '', 20, 'medium');
    assert.strictEqual(scrubBathroom.xp >= 20, true);
    assert.ok(scrubBathroom.reason.includes('Physical & sensory energy demand'));

    const washSheets = calculateTaskDifficultyAndXP('Wash bedsheets and fold laundry piles', '', 25, 'medium');
    assert.strictEqual(washSheets.xp >= 20, true);
  });

  it('evaluates dopamine micro-wins at 5 XP', () => {
    const drinkWater = calculateTaskDifficultyAndXP('Drink 2 glasses of water', '', 1, 'low');
    assert.strictEqual(drinkWater.xp, 5);
    assert.strictEqual(drinkWater.tier, 'micro');

    const takeVitamins = calculateTaskDifficultyAndXP('Take morning vitamins and medication', '', 2, 'medium');
    assert.strictEqual(takeVitamins.xp, 5);
    assert.strictEqual(takeVitamins.tier, 'micro');
  });

  it('evaluates standard daily upkeep at 10-15 XP', () => {
    const brushTeeth = calculateTaskDifficultyAndXP('Brush Teeth (Morning)', '', 2, 'medium');
    assert.strictEqual(brushTeeth.xp, 10);
    assert.strictEqual(brushTeeth.tier, 'quick');

    const stretch = calculateTaskDifficultyAndXP('15-minute gentle physical stretch', '', 15, 'medium');
    assert.strictEqual(stretch.xp, 15);
    assert.strictEqual(stretch.tier, 'moderate');
  });
});

describe('13. Companion Mascot Evolution Consistency', () => {
  const companions: CompanionChoice[] = ['pip', 'mochi', 'nova', 'bubbles'];

  it('validates companion choice values and metadata definitions', () => {
    companions.forEach((c) => {
      const meta = COMPANION_DEFINITIONS[c];
      assert.ok(meta, `Missing COMPANION_DEFINITIONS for ${c}`);
      assert.strictEqual(meta.id, c);
      assert.strictEqual(meta.stages.length, 3);
      assert.ok(meta.defaultEmoji.length > 0);
      assert.ok(meta.description.length > 0);
    });
  });

  it('accurately resolves evolution stages across levels 1 through 7 for all mascots', () => {
    // Level 1-2: Base stage (Seedling / Baby Kit / Kitten / Hatchling)
    assert.strictEqual(getCompanionStage('mochi', 1).currentStage.title, 'Baby Kit');
    assert.strictEqual(getCompanionStage('mochi', 2).currentStage.title, 'Baby Kit');
    assert.strictEqual(getCompanionStage('nova', 1).currentStage.title, 'Little Kitten');
    assert.strictEqual(getCompanionStage('bubbles', 1).currentStage.title, 'Tiny Hatchling');
    assert.strictEqual(getCompanionStage('pip', 1).currentStage.title, 'Seedling');

    // Level 3-4: Mid evolution stage
    assert.strictEqual(getCompanionStage('mochi', 3).currentStage.title, 'Playful Fox');
    assert.strictEqual(getCompanionStage('mochi', 4).currentStage.title, 'Playful Fox');
    assert.strictEqual(getCompanionStage('nova', 3).currentStage.title, 'Cosmic Explorer');
    assert.strictEqual(getCompanionStage('bubbles', 3).currentStage.title, 'Calm Swimmer');
    assert.strictEqual(getCompanionStage('pip', 3).currentStage.title, 'Growing Sproutling');

    // Level 5-7: Top ascended evolution stage
    assert.strictEqual(getCompanionStage('mochi', 5).currentStage.title, 'Forest Spirit');
    assert.strictEqual(getCompanionStage('mochi', 7).currentStage.title, 'Forest Spirit');
    assert.strictEqual(getCompanionStage('nova', 5).currentStage.title, 'Starlight Guardian');
    assert.strictEqual(getCompanionStage('bubbles', 5).currentStage.title, 'Ancient Sage');
    assert.strictEqual(getCompanionStage('pip', 5).currentStage.title, 'Radiant Blossom');
  });
});

describe('14. Magic Wand Clean Icon Parity across All Languages', () => {
  it('ensures break_down_step and auto_break_down do not contain duplicate emoji prefixes in dictionaries', () => {
    const allLangs = Object.keys(TRANSLATIONS) as Array<keyof typeof TRANSLATIONS>;
    allLangs.forEach((lang) => {
      const dict = TRANSLATIONS[lang];
      assert.ok(!dict.break_down_step.startsWith('🪄'), `Language ${lang} break_down_step has duplicate emoji prefix`);
      assert.ok(!dict.auto_break_down.startsWith('🪄'), `Language ${lang} auto_break_down has duplicate emoji prefix`);
    });
  });
});

describe('15. Focus Mode Invariants & Timezone-Safe Date Math', () => {
  it('accurately calculates past dates across month and leap year boundaries without drift', () => {
    // 2024 is a leap year; test Feb 29 boundary
    const leapDay = '2024-03-01';
    assert.strictEqual(getDateMinusDays(1, leapDay), '2024-02-29');
    assert.strictEqual(getDateMinusDays(2, leapDay), '2024-02-28');

    // Test year boundary (Jan 1 -> Dec 31)
    const newYear = '2027-01-01';
    assert.strictEqual(getDateMinusDays(1, newYear), '2026-12-31');
    assert.strictEqual(getDateMinusDays(7, newYear), '2026-12-25');
  });

  it('accurately schedules across different days of the week', () => {
    // 2026-09-03 is a Thursday (4)
    const thursdayTask: TaskItem = {
      id: 'thu_1',
      title: 'Thursday Deep Work',
      category: 'afternoon',
      priority: 'high',
      xpValue: 20,
      iconName: 'Target',
      completedDates: [],
      createdAt: '2026-09-01T00:00:00.000Z',
      order: 1,
      recurrenceType: 'custom_days',
      daysOfWeek: [4], // Thursday only
    };

    assert.strictEqual(isTaskScheduledForToday(thursdayTask, '2026-09-03'), true); // Thursday
    assert.strictEqual(isTaskScheduledForToday(thursdayTask, '2026-09-04'), false); // Friday
    assert.strictEqual(isTaskScheduledForToday(thursdayTask, '2026-09-02'), false); // Wednesday
  });
});

describe('16. Security & Sanitisation - Prototype Pollution & Injection Defense', () => {
  it('protects against prototype pollution in sanitizeImportedTask', () => {
    const maliciousTask = JSON.parse(
      '{"__proto__": {"polluted": true}, "constructor": {"prototype": {"admin": true}}, "title": "Injected Task", "xpValue": 15}'
    );
    const sanitized = sanitizeImportedTask(maliciousTask);
    assert.strictEqual(sanitized.title, 'Injected Task');
    assert.strictEqual((Object.prototype as any).polluted, undefined);
    assert.strictEqual((Object.prototype as any).admin, undefined);
  });

  it('safely handles null, undefined, and non-object inputs in sanitizeImportedTask', () => {
    const nullResult = sanitizeImportedTask(null as any);
    assert.ok(nullResult && typeof nullResult === 'object');
    assert.strictEqual(nullResult.title, 'Untitled Task');
    assert.strictEqual(nullResult.xpValue, 15);

    const undefinedResult = sanitizeImportedTask(undefined as any);
    assert.strictEqual(undefinedResult.title, 'Untitled Task');

    const numberResult = sanitizeImportedTask(12345 as any);
    assert.strictEqual(numberResult.title, 'Untitled Task');
  });

  it('bounds and truncates excessive string lengths (DoS prevention)', () => {
    const hugeString = 'A'.repeat(5000);
    const task = sanitizeImportedTask({
      title: hugeString,
      description: hugeString,
      id: hugeString,
    });
    assert.strictEqual(task.title.length, 200);
    assert.strictEqual(task.description.length, 2000);
    assert.strictEqual(task.id.length, 64);
  });

  it('clamps numeric XP and estimated minutes out of bounds (NaN, Infinity, negatives)', () => {
    const taskWithBadNumbers = sanitizeImportedTask({
      xpValue: NaN,
      estimatedMinutes: Infinity,
    });
    assert.strictEqual(taskWithBadNumbers.xpValue, 15);
    assert.strictEqual(taskWithBadNumbers.estimatedMinutes, 5);

    const taskWithNegativeNumbers = sanitizeImportedTask({
      xpValue: -999,
      estimatedMinutes: -50,
    });
    assert.strictEqual(taskWithNegativeNumbers.xpValue, 5); // Clamped to min 5
    assert.strictEqual(taskWithNegativeNumbers.estimatedMinutes, 1); // Clamped to min 1
  });

  it('filters corrupted or malicious date injection in completedDates', () => {
    const task = sanitizeImportedTask({
      completedDates: ['2026-08-30', '<script>alert(1)</script>', '2026-99-99', null, 12345, 'invalid'] as any,
    });
    assert.deepStrictEqual(task.completedDates, ['2026-08-30']);
  });

  it('caps subtasks at 50 and sanitizes subtask items against non-objects', () => {
    const subtasks = Array.from({ length: 100 }, (_, i) =>
      i === 0 ? null : { id: `st_${i}`, title: `Step ${i}`, completed: true }
    );
    const task = sanitizeImportedTask({ subTasks: subtasks as any });
    assert.strictEqual(task.subTasks.length, 50);
    assert.strictEqual(task.subTasks[0].title, 'Step');
    assert.strictEqual(task.subTasks[1].title, 'Step 1');
  });

  it('protects against prototype pollution in sanitizeImportedSettings', () => {
    const maliciousSettings = Object.assign(
      Object.create(null),
      { theme: 'hack_theme', soundVolume: NaN, language: 'malicious' }
    );
    (maliciousSettings as any).__proto__ = { injected: 'dangerous' };

    const cleanSettings = sanitizeImportedSettings(maliciousSettings);
    assert.strictEqual((Object.prototype as any).injected, undefined);
    assert.strictEqual(cleanSettings.theme, DEFAULT_SETTINGS.theme);
    assert.strictEqual(cleanSettings.language, DEFAULT_SETTINGS.language);
    assert.strictEqual(cleanSettings.soundVolume, DEFAULT_SETTINGS.soundVolume);
  });

  it('protects against negative and NaN stats in sanitizeImportedStats', () => {
    const maliciousStats = {
      xp: -100,
      currentStreak: NaN,
      longestStreak: Infinity,
      streakShields: -5,
    };
    const cleanStats = sanitizeImportedStats(maliciousStats);
    assert.strictEqual(cleanStats.xp, DEFAULT_STATS.xp);
    assert.strictEqual(cleanStats.currentStreak, DEFAULT_STATS.currentStreak);
    assert.strictEqual(cleanStats.streakShields, 0); // Negative shields clamped to 0
  });

  it('sanitizes imported badges and discards non-matching IDs', () => {
    const rawBadges = [
      { id: 'first_step', unlockedAt: '2026-08-30T10:00:00.000Z' },
      { id: 'fake_exploit_badge', unlockedAt: '2026-08-30' },
      null,
      'invalid',
    ];
    const badges = sanitizeImportedBadges(rawBadges);
    assert.strictEqual(badges.length, INITIAL_BADGES.length);
    const firstStep = badges.find((b) => b.id === 'first_step');
    assert.strictEqual(firstStep?.unlockedAt, '2026-08-30T10:00:00.000Z');
    assert.strictEqual(badges.some((b) => b.id === 'fake_exploit_badge'), false);
  });
});

describe('17. IconRenderer Defense & Safe Prototype Resolution', () => {
  it('prevents prototype pollution crash on special property names', () => {
    // Calling "constructor", "toString", "__proto__", "valueOf" must NOT return Object/Function
    const constructorIcon = getIconComponent('constructor');
    assert.notStrictEqual(constructorIcon, Object.prototype.constructor);

    const toStringIcon = getIconComponent('toString');
    assert.notStrictEqual(toStringIcon, Object.prototype.toString);

    const protoIcon = getIconComponent('__proto__');
    assert.notStrictEqual(protoIcon, Object.prototype);
  });

  it('returns valid Lucide components for known icon names and falls back for unknown', () => {
    const sparkles = getIconComponent('Sparkles');
    assert.ok(sparkles && typeof sparkles === 'object');

    const unknown = getIconComponent('NonExistentIcon');
    assert.ok(unknown && typeof unknown === 'object');

    const empty = getIconComponent('');
    assert.ok(empty && typeof empty === 'object');
  });
});

describe('18. Web Audio & Synthesizer Input Resilience', () => {
  it('safely clamps volume in soundService against NaN and infinities', () => {
    sound.updateSettings(true, NaN);
    // Shouldn't throw and volume should be safe
    sound.updateSettings(true, -10);
    sound.updateSettings(true, 100);
    sound.updateSettings(false, 0.5);
    // Verify no throw on play
    sound.playCheck();
    sound.playPop();
    sound.playLevelUp();
    sound.playBadge();
  });

  it('clamps ambientAudio volume safely against NaN, negative, and infinite values', () => {
    ambientAudio.setVolume(NaN);
    assert.strictEqual(ambientAudio.getVolume(), 0.35);

    ambientAudio.setVolume(-5);
    assert.strictEqual(ambientAudio.getVolume(), 0);

    ambientAudio.setVolume(10);
    assert.strictEqual(ambientAudio.getVolume(), 1);

    ambientAudio.setVolume(Infinity);
    assert.strictEqual(ambientAudio.getVolume(), 0.35);
  });

  it('handles rapid audio start/stop cycles without uncaught promise or timeout leaks', () => {
    ambientAudio.play('rain');
    ambientAudio.play('waves');
    ambientAudio.stop();
    assert.strictEqual(ambientAudio.getActiveSoundscape(), 'none');
  });
});

describe('19. Speech Synthesis Watchdog & Input Boundary Defense', () => {
  it('immediately fires onEnd when text is empty, whitespace, or invalid', () => {
    let endedCount = 0;
    speechService.speak('', 'en', () => { endedCount++; });
    assert.strictEqual(endedCount, 1);

    speechService.speak('   ', 'en', () => { endedCount++; });
    assert.strictEqual(endedCount, 2);

    speechService.speak(null as any, 'en', () => { endedCount++; });
    assert.strictEqual(endedCount, 3);
  });

  it('safely bounds speech rate against NaN and extreme values', () => {
    speechService.setRate(NaN);
    speechService.setRate(-5);
    speechService.setRate(10);
  });
});

describe('20. Performance & Algorithmic Scalability', () => {
  it('calculates 365-day streak in under 10ms using O(1) Set lookups', () => {
    const today = '2026-10-19';
    // Generate 365 consecutive completion dates
    const completedDates: string[] = [];
    for (let i = 0; i < 365; i++) {
      completedDates.push(getDateMinusDays(i, today));
    }

    const yearTask: TaskItem = {
      ...DEFAULT_TASKS[0],
      completedDates,
    };

    const startTime = performance.now();
    const streak = calculateStreakFromTasks([yearTask], today);
    const durationMs = performance.now() - startTime;

    assert.strictEqual(streak, 365);
    assert.ok(durationMs < 10, `Streak calculation took ${durationMs}ms, should be < 10ms`);
  });

  it('handles malformed date strings in getDateMinusDays safely', () => {
    // Malformed strings must fallback safely to today without throwing
    const malformed1 = getDateMinusDays(1, '2026-99-99');
    assert.ok(typeof malformed1 === 'string' && malformed1.length === 10);

    const malformed2 = getDateMinusDays(1, 'invalid-date');
    assert.ok(typeof malformed2 === 'string' && malformed2.length === 10);

    const malformed3 = getDateMinusDays(1, '');
    assert.ok(typeof malformed3 === 'string' && malformed3.length === 10);

    // Non-finite daysAgo
    const fallbackDays = getDateMinusDays(NaN, '2026-08-30');
    assert.strictEqual(fallbackDays, '2026-08-30');
  });

  it('guarantees getLevelInfo never returns NaN% progress under extreme values', () => {
    const extremeXPs = [-1000, 0, 50, 100, 999999, NaN, Infinity, -Infinity];
    extremeXPs.forEach((xp) => {
      const info = getLevelInfo(xp);
      assert.ok(Number.isFinite(info.level), `Level must be finite for xp=${xp}`);
      assert.ok(Number.isFinite(info.progressPercent), `Progress must be finite for xp=${xp}`);
      assert.ok(info.progressPercent >= 0 && info.progressPercent <= 100);
      assert.ok(!Number.isNaN(info.progressPercent));
    });
  });

  it('guarantees calculateTaskDifficultyAndXP handles unexpected or malicious inputs safely', () => {
    const res1 = calculateTaskDifficultyAndXP(null as any, null as any, NaN, null as any, NaN);
    assert.ok(Number.isFinite(res1.xp));
    assert.ok(res1.xp >= 5 && res1.xp <= 25);
    assert.ok(typeof res1.tier === 'string');

    const hugeText = 'call '.repeat(1000);
    const res2 = calculateTaskDifficultyAndXP(hugeText, hugeText, -999, 'high', 100);
    assert.ok(Number.isFinite(res2.xp));
    assert.ok(res2.xp >= 5 && res2.xp <= 25);
  });
});


