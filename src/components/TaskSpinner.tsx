import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SupportedLanguage, TaskItem } from '../types';
import { sound } from '../services/soundService';
import { getTodayIncompleteTasks } from '../services/storageService';
import { getTranslation } from '../services/i18nService';
import { IconRenderer } from './IconRenderer';

interface TaskSpinnerProps {
  tasks: TaskItem[];
  todayStr: string;
  language?: SupportedLanguage;
  isOpen: boolean;
  onClose: () => void;
  onSelectTaskToFocus: (task: TaskItem) => void;
}

export const TaskSpinner: React.FC<TaskSpinnerProps> = ({
  tasks,
  todayStr,
  language = 'auto',
  isOpen,
  onClose,
  onSelectTaskToFocus,
}) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, language);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const spinIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const handleClose = React.useCallback(() => {
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
    setIsSpinning(false);
    setSelectedTask(null);
    onClose();
  }, [onClose]);

  // Memoize incomplete tasks
  const incompleteTasks = React.useMemo(() => {
    return getTodayIncompleteTasks(tasks, todayStr);
  }, [tasks, todayStr]);

  // Cleanup interval on unmount
  React.useEffect(() => {
    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
        spinIntervalRef.current = null;
      }
    };
  }, []);

  const handleSpin = () => {
    if (incompleteTasks.length === 0 || isSpinning) return;

    setIsSpinning(true);
    let counter = 0;
    const totalSpins = 16 + Math.floor(Math.random() * 8);

    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
    }

    spinIntervalRef.current = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * incompleteTasks.length);
      setSelectedTask(incompleteTasks[randomIdx]);
      sound.playPop();

      counter++;
      if (counter >= totalSpins) {
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current);
        }
        spinIntervalRef.current = null;
        setIsSpinning(false);
        sound.playLevelUp();
      }
    }, 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: 'center', maxWidth: '480px' }}
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-sun-light)',
                    color: 'var(--accent-sun)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconRenderer name="Zap" size={20} />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {t('spinner_title')}
                </h2>
              </div>
              <button className="btn-icon" onClick={handleClose} aria-label="Close modal">
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {t('spinner_subtitle')}
            </p>

            {incompleteTasks.length === 0 ? (
              <div style={{ padding: '24px 0' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🌟</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {t('spinner_all_done')}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {t('spinner_all_done_sub')}
                </p>
              </div>
            ) : (
              <div>
                {/* Display Box */}
                <div
                  style={{
                    background: selectedTask ? 'var(--primary-light)' : 'var(--bg-surface-subtle)',
                    border: `2px ${selectedTask ? 'solid var(--primary)' : 'dashed var(--border-strong)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '28px 20px',
                    marginBottom: '20px',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {selectedTask ? (
                    <div>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-surface)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 10px',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <IconRenderer name={selectedTask.iconName || 'Sparkles'} size={24} />
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {selectedTask.title}
                      </h3>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {selectedTask.estimatedMinutes}m • +{selectedTask.xpValue} XP
                      </span>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>
                      <IconRenderer name="Target" size={32} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, display: 'block' }}>
                        {t('spinner_cta')}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                    onClick={handleSpin}
                    disabled={isSpinning}
                    id="spin-wheel-btn"
                  >
                    <IconRenderer name="RefreshCw" size={18} className={isSpinning ? 'animate-spin' : ''} />
                    <span>{isSpinning ? t('spinner_spinning') : t('spinner_spin_btn')}</span>
                  </button>

                  {selectedTask && !isSpinning && (
                    <button
                      className="btn-primary"
                      style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                      onClick={() => {
                        onSelectTaskToFocus(selectedTask);
                        handleClose();
                      }}
                      id="start-spun-task-btn"
                    >
                      <IconRenderer name="Target" size={18} />
                      <span>{t('spinner_start_task')}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
