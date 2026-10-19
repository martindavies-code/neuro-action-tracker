import { useState, useCallback, useRef, useEffect } from 'react';
import type { TaskItem, ViewTab } from '../types';
import { isOnboardingCompleted } from '../services/storageService';

export function useUIState() {
  const [activeTab, setActiveTab] = useState<ViewTab>('today');
  
  // Modals & Power Tools
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => !isOnboardingCompleted());
  const [isSpinnerOpen, setIsSpinnerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isXpRoadmapOpen, setIsXpRoadmapOpen] = useState(false);

  // Toast / Achievement alert
  const [achievementToast, setAchievementToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setAchievementToast(msg);
    toastTimerRef.current = setTimeout(() => {
      setAchievementToast(null);
      toastTimerRef.current = null;
    }, 4000);
  }, []);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Global Keyboard Shortcuts (Ctrl+K, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    activeTab,
    setActiveTab,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isTaskModalOpen,
    setIsTaskModalOpen,
    editingTask,
    setEditingTask,
    isOnboardingOpen,
    setIsOnboardingOpen,
    isSpinnerOpen,
    setIsSpinnerOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isXpRoadmapOpen,
    setIsXpRoadmapOpen,
    achievementToast,
    showToast
  };
}
