import {resolveActiveLanguage} from '../services/i18nService';
import {StepHelper} from './StepHelper';
import {ui} from '../services/uiCopy';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Priority, RecurrenceType, RoutineCategory, SubTask, SupportedLanguage, TaskItem } from '../types';
import { calculateTaskDifficultyAndXP } from '../services/aiBreakdownService';
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
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(initialTask?.recurrenceType || 'one-off');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialTask?.daysOfWeek || [1, 2, 3, 4, 5]);
  const [subTasks, setSubTasks] = useState<SubTask[]>(initialTask?.subTasks || []);
  const [manualStepText, setManualStepText] = useState('');
  const [rewardOverride,setRewardOverride]=useState<number|null>(initialTask?.xpValue??null);

  // On-device effort estimate
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
      xpValue: rewardOverride ?? difficulty.xp,
      iconName,
      recurrenceType,
      daysOfWeek: recurrenceType === 'custom_days' ? (daysOfWeek && daysOfWeek.length > 0 ? daysOfWeek : [1, 2, 3, 4, 5]) : undefined,
      isOneOff: recurrenceType === 'one-off',
      subTasks,
    });
    onClose();
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
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="task-title-input">{t('task_title_label')} *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="task-title-input"
              type="text"
              className="form-input"
              placeholder={ui('What is one thing you want to do?',language)}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <details className="task-options" open={Boolean(initialTask)}><summary>{ui('More options',language)}</summary>
        {/* Micro-Steps Section in TaskModal */}
        <div style={{ padding: '12px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
               GENTLE MICRO-STEPS ({subTasks.length})
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <StepHelper title={title} description={description} language={language} existing={subTasks.length} onApply={setSubTasks}/>
              {subTasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSubTasks([])}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-fire)', fontSize: '0.74rem', cursor: 'pointer' }}
                >{ui('Clear all',language)}</button>
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
                    title={ui('Remove step',language)}
                  >

                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {ui('Add a tiny step',language)}
            </p>
          )}

          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              className="form-input"
              placeholder={ui('Add a tiny step',language)}
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
          <label className="form-label" htmlFor="task-desc-input">{ui('Task note (optional)',language)}</label>
          <input
            id="task-desc-input"
            type="text"
            className="form-input"
            placeholder={ui('Task note (optional)',language)}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Recurrence Selector */}
        <div className="form-group">
          <label className="form-label">{ui('How often?',language)}</label>
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
            >{ui('Daily',language)}</button>

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
            >{ui('Selected days',language)}</button>

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
            >{ui('Once',language)}</button>
          </div>
        </div>

        {/* Days of week selector if custom_days */}
        {recurrenceType === 'custom_days' && (
          <div style={{ padding: '10px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ui('Select active days',language)}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setDaysOfWeek([1, 2, 3, 4, 5])}
                  style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', cursor: 'pointer' }}
                >{ui('Weekdays',language)}</button>
                <button
                  type="button"
                  onClick={() => setDaysOfWeek([0, 6])}
                  style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', cursor: 'pointer' }}
                >{ui('Weekend',language)}</button>
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
                    {new Date(2026,10,1+d.val).toLocaleDateString(resolveActiveLanguage(language),{weekday:'short'})}
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
              <option value="morning">{t('filter_morning')}</option>
              <option value="afternoon">{t('filter_afternoon')}</option>
              <option value="evening">{t('filter_evening')}</option>
              <option value="anytime">{ui('Anytime',language)}</option>
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
              <option value="high">{t('priority_high')}</option>
              <option value="medium">{t('priority_medium')}</option>
              <option value="low">{t('priority_low')}</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-time-input">{ui('Estimated minutes',language)}</label>
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

        {/* On-device effort estimate */}
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
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>{ui('Suggested effort reward',language)}</span>
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
              <span>{ui('Suggested effort reward',language)}</span>
              <span>•</span>
              <span>+{difficulty.xp} XP</span>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
             {ui('This is an on-device estimate. You can change it.',language)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {ui('Every option is a preference, not a prescription.',language)}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{ui('Visual icon',language)}</label>
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
                aria-label={ui('Visual icon',language)+' '+(ICONS.indexOf(icon)+1)}
              >
                <IconRenderer name={icon} size={18} />
              </button>
            ))}
          </div>
        </div>

        <label className="form-label">{ui('My effort reward',language)}<select className="form-select" value={rewardOverride??difficulty.xp} onChange={e=>setRewardOverride(+e.target.value)}>{[0,5,10,15,20,25].map(v=><option key={v} value={v}>{v} XP</option>)}</select></label>
        </details>
        <div className="task-form-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
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
              <button className="btn-icon dialog-close" onClick={onClose} aria-label={ui('Close',language)}>×</button>
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
