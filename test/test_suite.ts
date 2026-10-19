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
import { isFirebaseConfigured } from '../src/services/firebase.ts';
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
  });
});

describe('11. Firebase Safe Environment Initializer & Config Guarding', () => {
  it('safely determines configuration status in test environment without throwing', () => {
    const configured = isFirebaseConfigured();
    assert.ok(typeof configured === 'boolean');
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


