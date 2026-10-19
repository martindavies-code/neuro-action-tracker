import { useState, useEffect, useCallback } from 'react';
import type { TaskItem, UserStats, Badge, SensorySettings } from '../types';
import { auth, onAuthStateChanged, type User } from '../services/firebase';
import { fetchUserDataFromFirestore, syncUserDataToFirestore } from '../services/cloudSyncService';
import { loadTasks, saveTasks, loadStats, saveStats, loadBadges, saveBadges, loadSettings, saveSettings } from '../services/storageService';

export function useCloudSync(
  onCloudDataReceived: (tasks: TaskItem[], stats: UserStats, badges: Badge[], settings: SensorySettings) => void,
  showToast: (msg: string) => void
) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const triggerCloudSync = useCallback(
    (
      currentTasks: TaskItem[],
      currentStats: UserStats,
      currentBadges: Badge[],
      currentSettings: SensorySettings
    ) => {
      if (currentUser) {
        syncUserDataToFirestore(currentUser.uid, {
          tasks: currentTasks,
          stats: currentStats,
          badges: currentBadges,
          settings: currentSettings,
        });
      }
    },
    [currentUser]
  );

  useEffect(() => {
    if (!auth) return;
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      setCurrentUser(user);
      if (user) {
        const cloudData = await fetchUserDataFromFirestore(user.uid);
        if (!isMounted) return;
        if (cloudData) {
          onCloudDataReceived(cloudData.tasks, cloudData.stats, cloudData.badges, cloudData.settings);
          saveTasks(cloudData.tasks);
          saveStats(cloudData.stats);
          saveBadges(cloudData.badges);
          saveSettings(cloudData.settings);
          showToast(`☁️ Synced cloud data for ${user.displayName || user.email}!`);
        } else {
          await syncUserDataToFirestore(user.uid, {
            tasks: loadTasks(),
            stats: loadStats(),
            badges: loadBadges(),
            settings: loadSettings(),
          });
          if (isMounted) {
            showToast(`☁️ Connected! Uploaded current routines to your account.`);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [onCloudDataReceived, showToast]);

  return {
    currentUser,
    setCurrentUser,
    triggerCloudSync
  };
}
