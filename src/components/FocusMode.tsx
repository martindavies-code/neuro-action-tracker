import React, { useState, useEffect } from 'react';
import type { SubTask, SupportedLanguage, TaskItem } from '../types';
import { IconRenderer } from './IconRenderer';
import { VisualTimeTimer } from './VisualTimeTimer';
import { sound } from '../services/soundService';
import { generateMagicSubTasks } from '../services/aiBreakdownService';
import { getTranslation } from '../services/i18nService';

interface FocusModeProps {
  task: TaskItem;
  language?: SupportedLanguage;
  onComplete: (task: TaskItem, e?: React.MouseEvent) => void;
  onNextTask: () => void;
  onExit: () => void;
  onToggleSubTask?: (taskId: string, subTaskId: string) => void;
  onAddSubTask?: (taskId: string, title: string) => void;
  onSetSubTasks?: (taskId: string, subTasks: SubTask[]) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({
  task,
  language = 'auto',
  onComplete,
  onNextTask,
  onExit,
  onToggleSubTask,
  onAddSubTask,
  onSetSubTasks,
}) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, language);
  const [totalSeconds, setTotalSeconds] = useState((task.estimatedMinutes || 5) * 60);
  const [timeLeft, setTimeLeft] = useState((task.estimatedMinutes || 5) * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Sync state whenever active focus task changes
  useEffect(() => {
    const secs = (task.estimatedMinutes || 5) * 60;
    setTotalSeconds(secs);
    setTimeLeft(secs);
    setIsRunning(false);
    setNewSubTaskTitle('');
  }, [task.id, task.estimatedMinutes]);

  const subTasks = task.subTasks || [];

  // When timer reaches 0, stop running & play gentle cue
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          sound.playPop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleSetPreset = (mins: number) => {
    sound.playPop();
    const secs = mins * 60;
    setTotalSeconds(secs);
    setTimeLeft(secs);
    setIsRunning(false);
  };

  const handleAddSubTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim()) return;
    if (onAddSubTask) {
      onAddSubTask(task.id, newSubTaskTitle.trim());
      setNewSubTaskTitle('');
    }
  };

  const handleToggleStep = (subTaskId: string) => {
    if (onToggleSubTask) {
      onToggleSubTask(task.id, subTaskId);
    }
  };

  const handleDeleteStep = (subTaskId: string) => {
    if (onSetSubTasks) {
      const filtered = subTasks.filter((st) => st.id !== subTaskId);
      onSetSubTasks(task.id, filtered);
    }
  };

  const handleMagicBreakdown = async () => {
    if (isGeneratingAI) return;
    setIsGeneratingAI(true);
    sound.playPop();

    try {
      const generated = await generateMagicSubTasks(task.title, task.description);
      if (onSetSubTasks) {
        onSetSubTasks(task.id, generated);
      }
      sound.playLevelUp();
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="focus-view">
      <div className="focus-card">
        <div className="focus-badge">
          <IconRenderer name="Target" size={14} />
          <span>{t('focus_title')}</span>
        </div>

        <h2 className="focus-task-title" style={{ fontSize: '1.45rem' }}>{task.title}</h2>
        {task.description && <p className="focus-task-desc">{task.description}</p>}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <span className={`tag-badge tag-priority-${task.priority}`}>
            {task.priority === 'high' ? `🔥 ${t('priority_high')}` : task.priority === 'medium' ? `⚡ ${t('priority_medium')}` : `🌿 ${t('priority_low')}`}
          </span>
          <span className="tag-badge tag-category">
            {task.category === 'morning' ? `🌅 ${t('filter_morning')}` : task.category === 'afternoon' ? `☀️ ${t('filter_afternoon')}` : task.category === 'evening' ? `🌙 ${t('filter_evening')}` : `🕒 ${t('filter_all')}`}
          </span>
          <span className="task-xp-badge">
            +{task.xpValue} XP
          </span>
        </div>

        {/* Visual Arc Time Timer */}
        <VisualTimeTimer
          timeLeft={timeLeft}
          totalSeconds={totalSeconds}
          isRunning={isRunning}
          language={language}
          onTogglePlay={() => setIsRunning(!isRunning)}
          onReset={() => {
            setIsRunning(false);
            setTimeLeft(totalSeconds);
          }}
          onSetPresetMinutes={handleSetPreset}
        />

        {/* Bite-sized Sub-tasks (Micro-steps) */}
        <div style={{ marginTop: '28px', textAlign: 'left', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              🌱 {t('micro_steps_title')}:
            </span>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleMagicBreakdown}
              disabled={isGeneratingAI}
              style={{ fontSize: '0.75rem', padding: '4px 10px', color: 'var(--primary)', borderColor: 'var(--primary)' }}
              title="Auto-break this task into gentle 1-minute steps"
              id="magic-breakdown-btn"
            >
              <IconRenderer name="Sparkles" size={13} />
              <span>{isGeneratingAI ? 'Breaking Down...' : t('auto_break_down')}</span>
            </button>
          </div>

          {subTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {subTasks.map((st) => (
                <div
                  key={st.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    fontSize: '0.88rem',
                    padding: '4px 0',
                    color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, textDecoration: st.completed ? 'line-through' : 'none' }}>
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleStep(st.id)}
                      style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <span>{st.title}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteStep(st.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', padding: '2px 6px' }}
                    title="Remove step"
                    aria-label="Remove step"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              {t('type_micro_step')}
            </p>
          )}

          <form onSubmit={handleAddSubTaskSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder={t('type_micro_step')}
              value={newSubTaskTitle}
              onChange={(e) => setNewSubTaskTitle(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '0.82rem', flex: 1 }}
              id="focus-add-step-input"
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              disabled={!newSubTaskTitle.trim()}
              id="focus-add-step-btn"
            >
              {t('add_step_btn')}
            </button>
          </form>
        </div>
      </div>

      {/* Complete Button */}
      <button
        className="focus-complete-btn"
        onClick={(e) => onComplete(task, e)}
        id="focus-complete-btn"
      >
        <IconRenderer name="Check" size={24} />
        <span>{t('complete_claim_xp')} (+{task.xpValue} XP)</span>
      </button>

      {/* Bottom Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '20px' }}>
        <button className="btn-secondary" onClick={onExit}>
          ← {t('back_to_checklist')}
        </button>
        <button className="btn-secondary" onClick={onNextTask}>
          {t('skip_next_task')} →
        </button>
      </div>
    </div>
  );
};
