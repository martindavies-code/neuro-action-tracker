import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Priority, RecurrenceType, RoutineCategory, SubTask, SupportedLanguage, TaskItem } from '../types';
import { generateMagicSubTasks, calculateTaskDifficultyAndXP } from '../services/aiBreakdownService';
import { sound } from '../services/soundService';
import { IconRenderer } from './IconRenderer';
import { getTranslation } from '../services/i18nService';

interface TaskModalProps {
  isOpen: boolean;
  language?: SupportedLanguage;
  onClose: () => void;
  onSave: (taskData: Partial<TaskItem>) => void;
  onDelete?: (taskId: string) => void;
  initialTask?: TaskItem | null;
}

const ICONS = [
  'Sparkles',
  'Utensils',
  'Droplets',
  'Activity',
  'Pill',
  'CheckCircle2',
  'Moon',
  'Sun',
  'Flame',
  'Target',
  'Zap',
  'Smile',
  'BookOpen',
  'Coffee',
];

const PRESETS = [
  { title: '🪥 Brush Teeth', category: 'morning', priority: 'high', xp: 15, minutes: 2, icon: 'Sparkles', desc: 'Maintain dental hygiene & routine rhythm', recurrence: 'daily' },
  { title: '🥗 Eat Healthy Meal', category: 'morning', priority: 'high', xp: 20, minutes: 15, icon: 'Utensils', desc: 'Nourishing fuel for brain and energy', recurrence: 'daily' },
  { title: '💧 Drink 2 Glasses of Water', category: 'anytime', priority: 'medium', xp: 10, minutes: 1, icon: 'Droplets', desc: 'Hydrate body and mind', recurrence: 'daily' },
  { title: '🧘 5-Minute Stretch', category: 'afternoon', priority: 'medium', xp: 15, minutes: 5, icon: 'Activity', desc: 'Physical reset and gentle movement', recurrence: 'daily' },
  { title: '🧹 5-Minute Space Reset', category: 'evening', priority: 'low', xp: 15, minutes: 5, icon: 'CheckCircle2', desc: 'Clear visual clutter for calm thoughts', recurrence: 'daily' },
  { title: '🩺 Doctor / Prescription Call', category: 'afternoon', priority: 'high', xp: 25, minutes: 10, icon: 'Pill', desc: 'Single-use important medical errand', recurrence: 'one-off' },
  { title: '🪴 Water Houseplants', category: 'morning', priority: 'low', xp: 15, minutes: 5, icon: 'Droplets', desc: 'Weekly plant care routine', recurrence: 'custom_days', days: [0, 6] },
];

const DAYS_MAP = [
  { label: 'Mon', val: 1 },
  { label: 'Tue', val: 2 },
  { label: 'Wed', val: 3 },
  { label: 'Thu', val: 4 },
  { label: 'Fri', val: 5 },
  { label: 'Sat', val: 6 },
  { label: 'Sun', val: 0 },
];

const TaskForm: React.FC<{
  initialTask?: TaskItem | null;
  language?: SupportedLanguage;
  onSave: (taskData: Partial<TaskItem>) => void;
  onDelete?: (taskId: string) => void;
  onClose: () => void;
}> = ({ initialTask, language = 'auto', onSave, onDelete, onClose }) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, language);
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [category, setCategory] = useState<RoutineCategory>(initialTask?.category || 'morning');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialTask?.estimatedMinutes || 5);
  const [iconName, setIconName] = useState(initialTask?.iconName || 'Sparkles');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(initialTask?.recurrenceType || (initialTask?.isOneOff ? 'one-off' : 'daily'));
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialTask?.daysOfWeek || [1, 2, 3, 4, 5]);
  const [subTasks, setSubTasks] = useState<SubTask[]>(initialTask?.subTasks || []);
  const [manualStepText, setManualStepText] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Dynamic AI Cognitive Effort & XP Evaluation
  const difficulty = React.useMemo(
    () => calculateTaskDifficultyAndXP(title, description, estimatedMinutes, priority, subTasks.length),
    [title, description, estimatedMinutes, priority, subTasks.length]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      estimatedMinutes: Math.max(1, Math.min(180, Number(estimatedMinutes) || 5)),
      xpValue: difficulty.xp,
      iconName,
      recurrenceType,
      daysOfWeek: recurrenceType === 'custom_days' ? (daysOfWeek && daysOfWeek.length > 0 ? daysOfWeek : [1, 2, 3, 4, 5]) : undefined,
      isOneOff: recurrenceType === 'one-off',
      subTasks,
    });
    onClose();
  };

  const handleMagicBreakdown = async () => {
    if (!title.trim()) return;
    setIsGeneratingAI(true);
    sound.playPop();
    try {
      const generated = await generateMagicSubTasks(title, description);
      setSubTasks(generated);
      sound.playLevelUp();
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    setTitle(p.title);
    setDescription(p.desc);
    setCategory(p.category as RoutineCategory);
    setPriority(p.priority as Priority);
    setEstimatedMinutes(p.minutes);
    setIconName(p.icon);
    setRecurrenceType(p.recurrence as RecurrenceType);
    if (p.days) setDaysOfWeek(p.days);
  };

  const toggleDay = (dayVal: number) => {
    if (daysOfWeek.includes(dayVal)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== dayVal));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, dayVal]);
    }
  };

  return (
    <div>
      {!initialTask && (
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            QUICK TEMPLATES:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyPreset(p)}
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="task-title-input">{t('task_title_label')} *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="task-title-input"
              type="text"
              className="form-input"
              placeholder="e.g. Clean Bedroom, Study for Exam, Laundry..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={handleMagicBreakdown}
              disabled={!title.trim() || isGeneratingAI}
              style={{
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
              }}
              title="Break down into gentle 1-minute steps"
            >
              <IconRenderer name="Sparkles" size={15} />
              <span>{isGeneratingAI ? 'Breaking Down...' : 'Magic AI'}</span>
            </button>
          </div>
        </div>

        {/* Micro-Steps Section in TaskModal */}
        <div style={{ padding: '12px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
              🌱 GENTLE MICRO-STEPS ({subTasks.length})
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleMagicBreakdown}
                disabled={!title.trim() || isGeneratingAI}
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 8px',
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                }}
                title="Auto-break down into gentle micro-steps"
                id="modal-auto-breakdown-btn"
              >
                <IconRenderer name="Sparkles" size={12} />
                <span>{isGeneratingAI ? 'Breaking Down...' : 'Auto Break Down'}</span>
              </button>
              {subTasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSubTasks([])}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-fire)', fontSize: '0.74rem', cursor: 'pointer' }}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {subTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              {subTasks.map((st, i) => (
                <div key={st.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{i + 1}.</span>
                    <span>{st.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubTasks(subTasks.filter((_, idx) => idx !== i))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', padding: '2px 6px' }}
                    title="Remove step"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Add custom 1-minute steps below or click <strong>🪄 Auto Break Down</strong>!
            </p>
          )}

          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Add a tiny step (e.g. Open document)..."
              value={manualStepText}
              onChange={(e) => setManualStepText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (manualStepText.trim()) {
                    setSubTasks([...subTasks, { id: 'st_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5), title: manualStepText.trim(), completed: false }]);
                    setManualStepText('');
                  }
                }
              }}
              style={{ padding: '5px 8px', fontSize: '0.8rem', flex: 1 }}
              id="modal-add-step-input"
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (manualStepText.trim()) {
                  setSubTasks([...subTasks, { id: 'st_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5), title: manualStepText.trim(), completed: false }]);
                  setManualStepText('');
                }
              }}
              style={{ padding: '5px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
              id="modal-add-step-btn"
            >
              + Add
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-desc-input">Gentle Note / Motivation (Optional)</label>
          <input
            id="task-desc-input"
            type="text"
            className="form-input"
            placeholder="Why this helps or how to do it easily..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Recurrence Selector */}
        <div className="form-group">
          <label className="form-label">How often does this task happen?</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => setRecurrenceType('daily')}
              style={{
                padding: '8px 4px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textAlign: 'center',
                background: recurrenceType === 'daily' ? 'var(--primary-light)' : 'var(--bg-surface-subtle)',
                color: recurrenceType === 'daily' ? 'var(--primary)' : 'var(--text-secondary)',
                border: `1.5px solid ${recurrenceType === 'daily' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
              }}
            >
              🔄 Daily Routine
            </button>

            <button
              type="button"
              onClick={() => setRecurrenceType('custom_days')}
              style={{
                padding: '8px 4px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textAlign: 'center',
                background: recurrenceType === 'custom_days' ? 'var(--primary-light)' : 'var(--bg-surface-subtle)',
                color: recurrenceType === 'custom_days' ? 'var(--primary)' : 'var(--text-secondary)',
                border: `1.5px solid ${recurrenceType === 'custom_days' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
              }}
            >
              📅 Specific Days
            </button>

            <button
              type="button"
              onClick={() => setRecurrenceType('one-off')}
              style={{
                padding: '8px 4px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textAlign: 'center',
                background: recurrenceType === 'one-off' ? 'var(--accent-sun-light)' : 'var(--bg-surface-subtle)',
                color: recurrenceType === 'one-off' ? 'var(--accent-sun)' : 'var(--text-secondary)',
                border: `1.5px solid ${recurrenceType === 'one-off' ? 'var(--accent-sun)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
              }}
            >
              📌 One-Off Task
            </button>
          </div>
        </div>

        {/* Days of week selector if custom_days */}
        {recurrenceType === 'custom_days' && (
          <div style={{ padding: '10px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Select Active Days:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setDaysOfWeek([1, 2, 3, 4, 5])}
                  style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', cursor: 'pointer' }}
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  onClick={() => setDaysOfWeek([0, 6])}
                  style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', cursor: 'pointer' }}
                >
                  Weekends
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
              {DAYS_MAP.map((d) => {
                const isSelected = daysOfWeek.includes(d.val);
                return (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => toggleDay(d.val)}
                    style={{
                      flex: 1,
                      padding: '6px 2px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-category-select">{t('routine_time_label')}</label>
            <select
              id="task-category-select"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as RoutineCategory)}
            >
              <option value="morning">🌅 Morning</option>
              <option value="afternoon">☀️ Afternoon</option>
              <option value="evening">🌙 Evening</option>
              <option value="anytime">🕒 Anytime</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-priority-select">{t('priority_label')}</label>
            <select
              id="task-priority-select"
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="high">🔥 High Priority</option>
              <option value="medium">⚡ Medium</option>
              <option value="low">🌿 Gentle / Low</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-time-input">Estimated Time (min)</label>
          <input
            id="task-time-input"
            type="number"
            min="1"
            max="120"
            className="form-input"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
          />
        </div>

        {/* Dynamic AI Cognitive Effort & XP Evaluation */}
        <div
          style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconRenderer name="Sparkles" size={15} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                AI Evaluated Reward & Difficulty
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 900,
                fontSize: '0.86rem',
                border: '1px solid rgba(45, 122, 88, 0.3)',
              }}
            >
              <span>{difficulty.tierLabel}</span>
              <span>•</span>
              <span>+{difficulty.xp} XP</span>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            🧠 <strong>Reasoning:</strong> {difficulty.reason}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            XP is automatically determined by AI assessing executive activation resistance, time duration, priority, and micro-step structure.
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Visual Icon</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setIconName(icon)}
                className={`btn-icon ${iconName === icon ? 'active' : ''}`}
                style={{
                  background: iconName === icon ? 'var(--primary-light)' : 'var(--bg-surface)',
                  borderColor: iconName === icon ? 'var(--primary)' : 'var(--border-subtle)',
                  color: iconName === icon ? 'var(--primary)' : 'var(--text-secondary)',
                }}
                aria-label={`Select icon ${icon}`}
              >
                <IconRenderer name={icon} size={18} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
          {initialTask && onDelete ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (window.confirm(t('confirm_delete_task'))) {
                  onDelete(initialTask.id);
                  onClose();
                }
              }}
              style={{
                color: 'var(--accent-fire)',
                borderColor: 'rgba(217, 72, 59, 0.35)',
                padding: '8px 14px',
                fontSize: '0.84rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              id="modal-delete-task-btn"
            >
              <IconRenderer name="Trash2" size={15} />
              <span>{t('delete_task')}</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t('cancel_btn')}
            </button>
            <button type="submit" className="btn-primary" id="save-task-btn">
              <span>{initialTask ? t('save_changes_btn') : t('add_task_btn')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  language = 'auto',
  onClose,
  onSave,
  onDelete,
  initialTask,
}) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, language);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px' }}
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {initialTask ? t('edit_task_title') : t('create_task_title')}
              </h2>
              <button className="btn-icon" onClick={onClose} aria-label="Close modal">
                ✕
              </button>
            </div>

            <TaskForm
              key={initialTask ? initialTask.id : 'new'}
              initialTask={initialTask}
              language={language}
              onSave={onSave}
              onDelete={onDelete}
              onClose={onClose}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
