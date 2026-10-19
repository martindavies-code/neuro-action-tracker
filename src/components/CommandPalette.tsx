import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SupportedLanguage, TaskItem } from '../types';
import { getTranslation } from '../services/i18nService';
import { IconRenderer } from './IconRenderer';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  todayStr: string;
  language?: SupportedLanguage;
  onToggleComplete: (task: TaskItem) => void;
  onFocusTask: (task: TaskItem) => void;
  onOpenCreateModal: () => void;
}

type QuickFilter = 'all' | 'todo' | 'completed' | 'morning' | 'afternoon' | 'evening' | 'high';

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  todayStr,
  language = 'auto',
  onToggleComplete,
  onFocusTask,
  onOpenCreateModal,
}) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, language);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<QuickFilter>('all');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredTasks = tasks.filter((taskItem) => {
    if (taskItem.archived) return false;

    // Search query matching
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      taskItem.title.toLowerCase().includes(q) ||
      taskItem.category.toLowerCase().includes(q) ||
      (taskItem.description && taskItem.description.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    const isDoneToday = Array.isArray(taskItem.completedDates) && taskItem.completedDates.includes(todayStr);

    // Quick filter matching
    if (activeFilter === 'todo') return !isDoneToday;
    if (activeFilter === 'completed') return isDoneToday;
    if (activeFilter === 'morning') return taskItem.category === 'morning';
    if (activeFilter === 'afternoon') return taskItem.category === 'afternoon';
    if (activeFilter === 'evening') return taskItem.category === 'evening';
    if (activeFilter === 'high') return taskItem.priority === 'high';

    return true;
  });

  const filterButtons: Array<{ id: QuickFilter; label: string }> = [
    { id: 'all', label: t('filter_all') },
    { id: 'todo', label: t('tab_today') },
    { id: 'completed', label: t('completed_banner') },
    { id: 'morning', label: `🌅 ${t('filter_morning')}` },
    { id: 'afternoon', label: `☀️ ${t('filter_afternoon')}` },
    { id: 'evening', label: `🌙 ${t('filter_evening')}` },
    { id: 'high', label: `🔥 ${t('priority_high')}` },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          onClick={onClose}
          id="task-search-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '20px' }}
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconRenderer name="Search" size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {t('search_title')}
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t('search_subtitle')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
              {t('esc_to_close')}
            </span>
            <button className="btn-icon" onClick={onClose} aria-label="Close search">
              ✕
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            background: 'var(--bg-surface-subtle)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '12px',
          }}
        >
          <IconRenderer name="Search" size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              fontWeight: 600,
            }}
            autoFocus
          />
          {query.trim() && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '2px 6px',
              }}
              title={t('clear_search_btn')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills & Quick Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {filterButtons.map((f) => {
              const isSelected = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-surface-subtle)',
                    color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <button
            className="btn-primary"
            style={{ padding: '5px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
            onClick={() => {
              onOpenCreateModal();
              onClose();
            }}
          >
            <IconRenderer name="Plus" size={14} />
            <span>{t('add_task_btn')}</span>
          </button>
        </div>

        {/* Task Results List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '180px', paddingRight: '4px' }}>
          {filteredTasks.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '36px 16px',
                textAlign: 'center',
                background: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
              <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                {t('search_no_match')}
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                {t('search_no_match_hint')}
              </span>
              <button
                className="btn-secondary"
                onClick={() => {
                  onOpenCreateModal();
                  onClose();
                }}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <IconRenderer name="Plus" size={14} />
                <span>{t('add_task_btn')}</span>
              </button>
            </div>
          ) : (
            filteredTasks.map((taskItem) => {
              const isCompleted = Array.isArray(taskItem.completedDates) && taskItem.completedDates.includes(todayStr);
              return (
                <div
                  key={taskItem.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isCompleted ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all var(--transition-fast)',
                    opacity: isCompleted ? 0.75 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <button
                      className={`task-checkbox-btn ${isCompleted ? 'checked' : ''}`}
                      style={{ width: '24px', height: '24px', flexShrink: 0 }}
                      onClick={() => onToggleComplete(taskItem)}
                      aria-label={isCompleted ? `Mark ${taskItem.title} incomplete` : `Mark ${taskItem.title} complete`}
                    >
                      {isCompleted && <IconRenderer name="Check" size={14} />}
                    </button>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: 'var(--text-primary)',
                            textDecoration: isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          {taskItem.title}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                          }}
                        >
                          {taskItem.category}
                        </span>
                        {taskItem.priority === 'high' && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                            }}
                          >
                            🔥 {t('priority_high')}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        <span>⏱ {taskItem.estimatedMinutes || 5}m</span>
                        <span>⚡ +{taskItem.xpValue || 15} XP</span>
                        {taskItem.isOneOff && <span>📌 {t('filter_oneoff')}</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginLeft: '12px', flexShrink: 0 }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      onClick={() => {
                        onFocusTask(taskItem);
                        onClose();
                      }}
                      title="Focus on this task in Focus Spotlight"
                    >
                      {t('tab_focus')} 🎯
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
