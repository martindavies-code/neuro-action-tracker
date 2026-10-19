import { useState, useEffect, useCallback, useRef } from 'react';
import type { TaskItem, UserStats, Badge, SensorySettings } from '../types';
import { auth, onAuthStateChanged, type User } from '../services/firebase';
import { fetchUserDataFromFirestore, syncUserDataToFirestore } from '../services/cloudSyncService';
import {
  loadTasks,
  saveTasks,
  loadStats,
  saveStats,
  loadBadges,
  saveBadges,
  loadSettings,
  saveSettings,
  sanitizeImportedTask,
  sanitizeImportedStats,
  sanitizeImportedBadges,
  sanitizeImportedSettings,
} from '../services/storageService';

interface SyncPayload {
  tasks: TaskItem[];
  stats: UserStats;
  badges: Badge[];
  settings: SensorySettings;
}

export function useCloudSync(
  onCloudDataReceived: (tasks: TaskItem[], stats: UserStats, badges: Badge[], settings: SensorySettings) => void,
  showToast: (msg: string) => void
) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPayloadRef = useRef<SyncPayload | null>(null);
  const currentUserRef = useRef<User | null>(null);

  // Keep ref up to date for unmount/beforeunload flush without stale closures
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const flushPendingSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
    const user = currentUserRef.current;
    if (user && latestPayloadRef.current) {
      const payload = latestPayloadRef.current;
      latestPayloadRef.current = null;
      syncUserDataToFirestore(user.uid, payload);
    }
  }, []);

  const triggerCloudSync = useCallback(
    (
      currentTasks: TaskItem[],
      currentStats: UserStats,
      currentBadges: Badge[],
      currentSettings: SensorySettings
    ) => {
      if (!currentUser) return;
      latestPayloadRef.current = {
        tasks: currentTasks,
        stats: currentStats,
        badges: currentBadges,
        settings: currentSettings,
      };

      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Trailing-edge debounce (800ms) to coalesce rapid toggles & prevent write quota exhaustion
      syncTimeoutRef.current = setTimeout(() => {
        syncTimeoutRef.current = null;
        if (currentUserRef.current && latestPayloadRef.current) {
          const payload = latestPayloadRef.current;
          latestPayloadRef.current = null;
          syncUserDataToFirestore(currentUserRef.current.uid, payload);
        }
      }, 800);
    },
    [currentUser]
  );

  // Flush on page unload or unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushPendingSync();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushPendingSync();
    };
  }, [flushPendingSync]);

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
          // Strictly sanitize all incoming cloud data before applying to state & localStorage
          const cleanTasks = Array.isArray(cloudData.tasks)
            ? cloudData.tasks.map((t, idx) => sanitizeImportedTask(t, idx))
            : loadTasks();
          const cleanStats = sanitizeImportedStats(cloudData.stats);
          const cleanBadges = sanitizeImportedBadges(cloudData.badges);
          const cleanSettings = sanitizeImportedSettings(cloudData.settings);

          onCloudDataReceived(cleanTasks, cleanStats, cleanBadges, cleanSettings);
          saveTasks(cleanTasks);
          saveStats(cleanStats);
          saveBadges(cleanBadges);
          saveSettings(cleanSettings);
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
    triggerCloudSync,
    flushPendingSync,
  };
}
