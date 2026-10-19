import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TaskItem, UserStats, Badge, SensorySettings, SubTask, Priority } from '../types';
import { generateMagicSubTasks, calculateTaskDifficultyAndXP } from '../services/aiBreakdownService';
import {
  DEFAULT_TASKS,
  getPast7DaysCompletion,
  getTodayDateString,
  loadBadges,
  loadSettings,
  loadStats,
  loadTasks,
  saveBadges,
  saveSettings,
  saveStats,
  saveTasks,
  resetAllData,
  importBackupJSON,
  exportBackupJSON,
} from '../services/storageService';
import { sound } from '../services/soundService';
import { checkNewBadges, getLevelInfo, calculateDailyStreak, calculateStreakFromTasks } from '../services/gamificationService';
import { triggerCelebration } from '../components/ConfettiBurst';
import { getTranslation } from '../services/i18nService';

export function useTaskState(
  triggerCloudSync: (t: TaskItem[], s: UserStats, b: Badge[], set: SensorySettings) => void,
  showToast: (msg: string) => void,
  focusTask: TaskItem | null,
  setFocusTask: React.Dispatch<React.SetStateAction<TaskItem | null>>
) {
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadTasks());
  const [settings, setSettings] = useState<SensorySettings>(() => loadSettings());
  const [todayStr, setTodayStr] = useState<string>(() => getTodayDateString());
  
  const [stats, setStats] = useState<UserStats>(() => {
    const raw = loadStats();
    const { updatedStats } = calculateDailyStreak(raw, getTodayDateString());
    saveStats(updatedStats);
    return updatedStats;
  });
  const [badges, setBadges] = useState<Badge[]>(() => loadBadges());

  const past7Days = useMemo(() => getPast7DaysCompletion(tasks), [tasks]);

  // Automated Midnight Rollover & Shield Consumer Watcher
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDay = getTodayDateString();
      if (currentDay !== todayStr) {
        setTodayStr(currentDay);
        const { updatedStats, usedShield } = calculateDailyStreak(stats, currentDay);
        setStats(updatedStats);
        saveStats(updatedStats);
        if (usedShield) {
          showToast('🛡️ A streak shield protected your momentum overnight!');
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [todayStr, stats, showToast]);

  // Pure derived stats with accurate real-time streak
  const computedStats: UserStats = useMemo(() => {
    const dynamicStreak = calculateStreakFromTasks(tasks, todayStr);
    return {
      ...stats,
      currentStreak: dynamicStreak,
      longestStreak: Math.max(stats.longestStreak, dynamicStreak),
    };
  }, [stats, tasks, todayStr]);

  // Sync settings with DOM & Sound
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-dyslexic', String(settings.dyslexicFont));
    document.documentElement.setAttribute('data-reduced-motion', String(settings.reducedMotion));
    sound.updateSettings(settings.soundEnabled, settings.soundVolume);
    saveSettings(settings);
  }, [settings]);

  const handleUpdateSettings = useCallback((newSettings: Partial<SensorySettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      triggerCloudSync(tasks, stats, badges, updated);
      return updated;
    });
  }, [tasks, stats, badges, triggerCloudSync]);

  const handleToggleComplete = useCallback((task: TaskItem, e?: React.MouseEvent, fromFocusMode = false) => {
    const isCompleted = task.completedDates.includes(todayStr);

    let updatedDates: string[];
    let xpDiff = 0;
    let completionsDiff = 0;

    if (isCompleted) {
      updatedDates = task.completedDates.filter((d) => d !== todayStr);
      xpDiff = -task.xpValue;
      completionsDiff = -1;
      sound.playPop();
    } else {
      updatedDates = [...task.completedDates, todayStr];
      xpDiff = task.xpValue;
      completionsDiff = 1;
      sound.playCheck();
      triggerCelebration(settings, { e, type: fromFocusMode ? 'focus' : 'standard' });
    }

    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, completedDates: updatedDates } : t
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    const newXp = Math.max(0, stats.xp + xpDiff);
    const prevLevelInfo = getLevelInfo(stats.xp);
    const newLevelInfo = getLevelInfo(newXp);

    if (newLevelInfo.level > prevLevelInfo.level) {
      sound.playLevelUp();
      showToast(`🎉 Level Up! You reached Level ${newLevelInfo.level}: ${newLevelInfo.levelTitle}!`);
    }

    const dynamicStreak = calculateStreakFromTasks(updatedTasks, todayStr);
    const longestStreak = Math.max(stats.longestStreak, dynamicStreak);

    let newShields = stats.streakShields;
    if (dynamicStreak >= 3 && dynamicStreak % 3 === 0 && dynamicStreak > stats.currentStreak && newShields < 3) {
      newShields += 1;
      showToast(`🛡️ +1 Streak Shield Crafted! (You hit a ${dynamicStreak}-day rhythm)`);
    }

    const newStats: UserStats = {
      ...stats,
      xp: newXp,
      level: newLevelInfo.level,
      levelTitle: newLevelInfo.levelTitle,
      currentStreak: dynamicStreak,
      longestStreak,
      streakShields: newShields,
      totalCompletions: Math.max(0, stats.totalCompletions + completionsDiff),
      lastActiveDate: todayStr,
    };
    setStats(newStats);
    saveStats(newStats);

    const { updatedBadges, newlyUnlocked } = checkNewBadges(
      newStats,
      updatedTasks,
      todayStr,
      badges,
      { usedFocusMode: fromFocusMode }
    );

    let currentBadges = badges;
    if (newlyUnlocked.length > 0) {
      sound.playBadge();
      newlyUnlocked.forEach((b) => {
        showToast(`🏆 Badge Unlocked: ${b.title} - ${b.description}`);
      });
      setBadges(updatedBadges);
      saveBadges(updatedBadges);
      currentBadges = updatedBadges;
    }

    triggerCloudSync(updatedTasks, newStats, currentBadges, settings);
  }, [tasks, stats, badges, settings, todayStr, showToast, triggerCloudSync]);

  const handleToggleSubTask = useCallback((taskId: string, subTaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const currentSubs = t.subTasks || [];
      const updatedSubTasks = currentSubs.map((st) =>
        st.id === subTaskId ? { ...st, completed: !st.completed } : st
      );
      const updatedTask = { ...t, subTasks: updatedSubTasks };
      if (focusTask && focusTask.id === taskId) {
        setFocusTask(updatedTask);
      }
      return updatedTask;
    });
    setTasks(updated);
    saveTasks(updated);
    sound.playPop();
    triggerCloudSync(updated, stats, badges, settings);
  }, [tasks, stats, badges, settings, focusTask, setFocusTask, triggerCloudSync]);

  const handleAddSubTask = useCallback((taskId: string, title: string) => {
    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const newSubTask = { id: 'st_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6), title, completed: false };
      const currentSubs = t.subTasks || [];
      const updatedTask = { ...t, subTasks: [...currentSubs, newSubTask] };
      if (focusTask && focusTask.id === taskId) {
        setFocusTask(updatedTask);
      }
      return updatedTask;
    });
    setTasks(updated);
    saveTasks(updated);
    sound.playPop();
    triggerCloudSync(updated, stats, badges, settings);
  }, [tasks, stats, badges, settings, focusTask, setFocusTask, triggerCloudSync]);

  const handleBreakdownTask = useCallback(async (task: TaskItem) => {
    sound.playPop();
    const generated = await generateMagicSubTasks(task.title, task.description);
    const updated = tasks.map((t) => {
      if (t.id !== task.id) return t;
      const updatedTask = { ...t, subTasks: generated };
      if (focusTask && focusTask.id === task.id) {
        setFocusTask(updatedTask);
      }
      return updatedTask;
    });
    setTasks(updated);
    saveTasks(updated);
    sound.playLevelUp();
    showToast(`🪄 AI broke "${task.title}" into ${generated.length} gentle steps!`);
    triggerCloudSync(updated, stats, badges, settings);
  }, [tasks, stats, badges, settings, focusTask, setFocusTask, showToast, triggerCloudSync]);

  const handleSetSubTasks = useCallback((taskId: string, subTasks: SubTask[]) => {
    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const updatedTask = { ...t, subTasks };
      if (focusTask && focusTask.id === taskId) {
        setFocusTask(updatedTask);
      }
      return updatedTask;
    });
    setTasks(updated);
    saveTasks(updated);
    triggerCloudSync(updated, stats, badges, settings);
  }, [tasks, stats, badges, settings, focusTask, setFocusTask, triggerCloudSync]);

  const handleSaveTask = useCallback((taskData: Partial<TaskItem>, editingTask: TaskItem | null) => {
    let updated: TaskItem[];

    if (editingTask) {
      updated = tasks.map((t) =>
        t.id === editingTask.id ? ({ ...t, ...taskData } as TaskItem) : t
      );
      setTasks(updated);
      saveTasks(updated);
      showToast('Task updated successfully.');
    } else {
      const finalMinutes = taskData.estimatedMinutes || 5;
      const finalPriority = taskData.priority || 'medium';
      const finalTitle = taskData.title || 'New Task';
      const finalDesc = taskData.description || '';
      const finalSubTasks = taskData.subTasks || [];
      const computedXP = taskData.xpValue || calculateTaskDifficultyAndXP(finalTitle, finalDesc, finalMinutes, finalPriority, finalSubTasks.length).xp;

      const newTask: TaskItem = {
        id: 'task_' + Date.now(),
        title: finalTitle,
        description: finalDesc,
        category: taskData.category || 'morning',
        priority: finalPriority,
        xpValue: computedXP,
        estimatedMinutes: finalMinutes,
        iconName: taskData.iconName || 'Sparkles',
        completedDates: [],
        createdAt: new Date().toISOString(),
        order: tasks.length + 1,
        isDefault: false,
        recurrenceType: taskData.recurrenceType || (taskData.isOneOff ? 'one-off' : 'daily'),
        daysOfWeek: taskData.daysOfWeek,
        isOneOff: Boolean(taskData.isOneOff || taskData.recurrenceType === 'one-off'),
        subTasks: finalSubTasks,
      };

      updated = [...tasks, newTask];
      setTasks(updated);
      saveTasks(updated);
      sound.playPop();
      showToast(`✨ Created "${newTask.title}" (+${newTask.xpValue} XP reward)!`);

      const { updatedBadges, newlyUnlocked } = checkNewBadges(
        stats,
        updated,
        todayStr,
        badges,
        { createdCustom: true }
      );
      if (newlyUnlocked.length > 0) {
        sound.playBadge();
        newlyUnlocked.forEach((b) => {
          showToast(`🏆 Badge Unlocked: ${b.title}!`);
        });
        setBadges(updatedBadges);
        saveBadges(updatedBadges);
      }
    }
    triggerCloudSync(updated, stats, badges, settings);
  }, [tasks, stats, badges, settings, todayStr, showToast, triggerCloudSync]);

  const handleDirectAddTask = useCallback((taskData: Partial<TaskItem>): TaskItem => {
    const finalMinutes = taskData.estimatedMinutes || 5;
    const finalPriority = taskData.priority || 'high';
    const finalTitle = taskData.title || 'Practice Task';
    const finalDesc = taskData.description || '';
    const finalXP = taskData.xpValue || calculateTaskDifficultyAndXP(finalTitle, finalDesc, finalMinutes, finalPriority, taskData.subTasks?.length || 0).xp;

    const newTask: TaskItem = {
      id: 'task_onboard_' + Date.now(),
      title: finalTitle,
      description: finalDesc,
      category: taskData.category || 'evening',
      priority: finalPriority,
      xpValue: finalXP,
      estimatedMinutes: finalMinutes,
      iconName: taskData.iconName || 'Zap',
      completedDates: [],
      createdAt: new Date().toISOString(),
      order: tasks.length + 1,
      isDefault: false,
      recurrenceType: taskData.recurrenceType || 'daily',
      daysOfWeek: taskData.daysOfWeek,
      isOneOff: Boolean(taskData.isOneOff),
      subTasks: taskData.subTasks || [],
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    triggerCloudSync(updated, stats, badges, settings);
    return newTask;
  }, [tasks, stats, badges, settings, triggerCloudSync]);

  const handleDeleteTask = useCallback((taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveTasks(updated);
    triggerCloudSync(updated, stats, badges, settings);
    showToast('Task removed.');
  }, [tasks, stats, badges, settings, triggerCloudSync, showToast]);

  const handleChangePriority = useCallback((taskId: string, newPriority: Priority) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t));
    setTasks(updated);
    saveTasks(updated);
    triggerCloudSync(updated, stats, badges, settings);
  }, [tasks, stats, badges, settings, triggerCloudSync]);

  const handleExportJSON = useCallback(() => {
    const json = exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rhythmquest_backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Backup exported successfully.');
  }, [todayStr, showToast]);

  const handleImportJSON = useCallback((jsonStr: string) => {
    const success = importBackupJSON(jsonStr);
    if (success) {
      const loadedTasks = loadTasks();
      const loadedSettings = loadSettings();
      const loadedStats = loadStats();
      const loadedBadges = loadBadges();
      setTasks(loadedTasks);
      setSettings(loadedSettings);
      setStats(loadedStats);
      setBadges(loadedBadges);
      triggerCloudSync(loadedTasks, loadedStats, loadedBadges, loadedSettings);
      showToast('✓ Backup restored successfully.');
    } else {
      alert('Invalid backup JSON format.');
    }
  }, [triggerCloudSync, showToast]);

  const handleResetData = useCallback(() => {
    const confirmMsg = getTranslation('confirm_reset_account', settings.language);
    if (window.confirm(confirmMsg)) {
      resetAllData();
      saveTasks(DEFAULT_TASKS);
      setTasks(DEFAULT_TASKS);
      const defaultSettings = loadSettings();
      const defaultStats = loadStats();
      const defaultBadges = loadBadges();
      setSettings(defaultSettings);
      setStats(defaultStats);
      setBadges(defaultBadges);
      triggerCloudSync(DEFAULT_TASKS, defaultStats, defaultBadges, defaultSettings);
      showToast('✓ Reset to default tasks and settings.');
    }
  }, [settings.language, triggerCloudSync, showToast]);

  return {
    tasks,
    setTasks,
    settings,
    setSettings,
    stats,
    setStats,
    badges,
    setBadges,
    todayStr,
    past7Days,
    computedStats,
    handleUpdateSettings,
    handleToggleComplete,
    handleToggleSubTask,
    handleAddSubTask,
    handleBreakdownTask,
    handleSetSubTasks,
    handleSaveTask,
    handleDirectAddTask,
    handleDeleteTask,
    handleChangePriority,
    handleExportJSON,
    handleImportJSON,
    handleResetData,
  };
}
