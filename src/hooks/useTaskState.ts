import {ui} from '../services/uiCopy';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TaskItem, UserStats, Badge, SensorySettings, SubTask, Priority } from '../types';
import { calculateTaskDifficultyAndXP } from '../services/aiBreakdownService';
import {
  DEFAULT_TASKS,
  preserveTaskHistory,
  prepareUpgradeRecovery,
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

} from '../services/storageService';
import { sound } from '../services/soundService';
import { checkNewBadges, getLevelInfo, calculateDailyStreak, calculateStreakFromTasks } from '../services/gamificationService';
import { triggerCelebration } from '../components/ConfettiBurst';
import { getTranslation,resolveActiveLanguage } from '../services/i18nService';

export function useTaskState(
  showToast: (msg: string) => void,
  focusTask: TaskItem | null,
  setFocusTask: React.Dispatch<React.SetStateAction<TaskItem | null>>
) {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {prepareUpgradeRecovery();return loadTasks()});
  useEffect(()=>{const reload=()=>setTasks(loadTasks());window.addEventListener('rhythm-reload-tasks',reload);return()=>window.removeEventListener('rhythm-reload-tasks',reload)},[]);
  const [settings, setSettings] = useState<SensorySettings>(() => loadSettings());
  const [todayStr, setTodayStr] = useState<string>(() => getTodayDateString());

  const [stats, setStats] = useState<UserStats>(() => {
    const raw = loadStats();
    const { updatedStats } = calculateDailyStreak(raw, getTodayDateString());
    saveStats(updatedStats);
    return updatedStats;
  });
  const [badges, setBadges] = useState<Badge[]>(() => loadBadges());

  const past7Days = useMemo(() => getPast7DaysCompletion(tasks,todayStr), [tasks, todayStr]);

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
          showToast(ui('Shield protected your streak',settings.language));
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [todayStr, stats, showToast,settings.language]);

  // Pure derived stats with accurate real-time streak
  const computedStats: UserStats = useMemo(() => {
    const dynamicStreak = calculateStreakFromTasks(tasks, todayStr, stats.protectedDates);
    return {
      ...stats,
      currentStreak: dynamicStreak,
      longestStreak: Math.max(stats.longestStreak, dynamicStreak),
    };
  }, [stats, tasks, todayStr]);

  // Sync settings with DOM & Sound
  useEffect(() => {
    document.documentElement.lang=resolveActiveLanguage(settings.language);
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-compact', String(settings.compactView));
    document.documentElement.setAttribute('data-show-xp', String(settings.showXp!==false));
    document.documentElement.setAttribute('data-show-streaks', String(settings.showStreaks!==false));
    document.documentElement.setAttribute('data-show-quotes', String(settings.showQuotes!==false));
    document.documentElement.setAttribute('data-dyslexic', String(settings.dyslexicFont));
    document.documentElement.setAttribute('data-reduced-motion', String(settings.reducedMotion));
    sound.updateSettings(settings.soundEnabled, settings.soundVolume);
    saveSettings(settings);
  }, [settings]);

  const handleUpdateSettings = useCallback((newSettings: Partial<SensorySettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

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

    if (settings.showXp!==false && newLevelInfo.level > prevLevelInfo.level) {
      sound.playLevelUp();
      showToast(ui('Level',settings.language)+' '+newLevelInfo.level);
    }

    const dynamicStreak = calculateStreakFromTasks(updatedTasks, todayStr, stats.protectedDates);
    const longestStreak = Math.max(stats.longestStreak, dynamicStreak);

    let newShields = stats.streakShields;
    if (dynamicStreak >= 3 && dynamicStreak % 3 === 0 && dynamicStreak > stats.currentStreak && newShields < 3) {
      newShields += 1;
      if(settings.showStreaks!==false)showToast(ui('Shield earned',settings.language));
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
      shieldCheckedDate: todayStr,
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

    setBadges(updatedBadges);saveBadges(updatedBadges);
    if (settings.showCelebrations!==false && newlyUnlocked.length > 0) {
      sound.playBadge();
      newlyUnlocked.forEach((b) => {
        showToast(ui('Unlocked',settings.language)+': '+ui(b.title,settings.language));
      });
      setBadges(updatedBadges);
      saveBadges(updatedBadges);
    }
  }, [tasks, stats, badges, settings, todayStr, showToast]);

  const handleToggleSubTask = useCallback((taskId: string, subTaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const currentSubs = t.subTasks || [];
      const updatedSubTasks = currentSubs.map((st) =>
        st.id === subTaskId ? { ...st, completed: !(st.completedDates || []).includes(todayStr), completedDates: (st.completedDates || []).includes(todayStr) ? (st.completedDates || []).filter(d=>d!==todayStr) : [...(st.completedDates || []),todayStr] } : st
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
  }, [tasks, focusTask, setFocusTask, todayStr]);

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
  }, [tasks, focusTask, setFocusTask]);

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
  }, [tasks, focusTask, setFocusTask]);

  const handleSaveTask = useCallback((taskData: Partial<TaskItem>, editingTask: TaskItem | null) => {
    let updated: TaskItem[];

    if (editingTask) {
      updated = tasks.map((t) =>
        t.id === editingTask.id ? ({ ...t, ...taskData, history: preserveTaskHistory(t,todayStr) } as TaskItem) : t
      );
      setTasks(updated);
      saveTasks(updated);
      showToast(ui('Task saved',settings.language));
    } else {
      const finalMinutes = taskData.estimatedMinutes || 5;
      const finalPriority = taskData.priority || 'medium';
      const finalTitle = taskData.title || 'New Task';
      const finalDesc = taskData.description || '';
      const finalSubTasks = taskData.subTasks || [];
      const computedXP = taskData.xpValue ?? calculateTaskDifficultyAndXP(finalTitle, finalDesc, finalMinutes, finalPriority, finalSubTasks.length).xp;

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
      showToast(ui('Task saved',settings.language)+': '+newTask.title);

      const { updatedBadges, newlyUnlocked } = checkNewBadges(
        stats,
        updated,
        todayStr,
        badges,
        { createdCustom: true }
      );
      setBadges(updatedBadges);saveBadges(updatedBadges);
    if (settings.showCelebrations!==false && newlyUnlocked.length > 0) {
        sound.playBadge();
        newlyUnlocked.forEach((b) => {
          showToast(ui('Unlocked',settings.language)+': '+ui(b.title,settings.language));
        });
        setBadges(updatedBadges);
        saveBadges(updatedBadges);
      }
    }
  }, [tasks, stats, badges, settings, todayStr, showToast]);

  const handleDirectAddTask = useCallback((taskData: Partial<TaskItem>): TaskItem => {
    const finalMinutes = taskData.estimatedMinutes || 5;
    const finalPriority = taskData.priority || 'high';
    const finalTitle = taskData.title || 'Practice Task';
    const finalDesc = taskData.description || '';
    const finalXP = taskData.xpValue ?? calculateTaskDifficultyAndXP(finalTitle, finalDesc, finalMinutes, finalPriority, taskData.subTasks?.length || 0).xp;

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
    return newTask;
  }, [tasks]);

  const handleDeleteTask = useCallback((taskId: string) => {
    const updated = tasks.map((t) => t.id === taskId ? {...t,archived:true,archivedAt:todayStr,history:preserveTaskHistory(t,todayStr)} : t);
    setTasks(updated);
    saveTasks(updated);
    showToast(ui('Task archived',settings.language));
  }, [tasks, todayStr, showToast,settings.language]);

  const handleChangePriority = useCallback((taskId: string, newPriority: Priority) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t));
    setTasks(updated);
    saveTasks(updated);
  }, [tasks]);

  const handleExportJSON = useCallback(() => {
    const json = JSON.stringify({version:'1.1.0',exportedAt:new Date().toISOString(),tasks,settings,stats,badges},null,2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rhythmquest_backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(ui('Backup exported',settings.language));
  }, [todayStr, showToast,tasks,settings,stats,badges]);

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
      showToast(ui('Backup restored',settings.language));
    } else {
      alert(ui('Invalid backup. Nothing was changed.',settings.language));
    }
  }, [showToast,settings.language]);

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
      showToast(ui('Settings reset',settings.language));
    }
  }, [settings.language, showToast]);

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
