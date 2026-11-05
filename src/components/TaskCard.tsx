import {StepHelper} from './StepHelper';
import {ui} from '../services/uiCopy';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { SupportedLanguage, TaskItem, SubTask } from '../types';
import { speechService } from '../services/speechService';
import { IconRenderer } from './IconRenderer';
import { BionicText } from './BionicText';
import { getTranslation } from '../services/i18nService';

interface TaskCardProps {
  task: TaskItem;
  isCompletedToday: boolean;
  language?: SupportedLanguage;
  bionicReading?: boolean;
  onToggleComplete: (task: TaskItem, e?: React.MouseEvent) => void;
  onFocusTask: (task: TaskItem) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubTask?: (taskId: string, subTaskId: string) => void;
  onSetSubTasks?: (taskId:string,steps:SubTask[]) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isCompletedToday,
  language = 'auto',
  bionicReading = false,
  onToggleComplete,
  onFocusTask,
  onEditTask,
  onDeleteTask,
  onToggleSubTask,
  onSetSubTasks,
}) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, language);
  const [showSubTasks, setShowSubTasks] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);

  React.useEffect(() => {
    return () => {
      if (isReadingAloud) {
        speechService.stop();
      }
    };
  }, [isReadingAloud]);

  const handleReadAloud = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReadingAloud) {
      speechService.stop();
      setIsReadingAloud(false);
      return;
    }
    setIsReadingAloud(true);
    const speechText = `${task.title}. ${task.description || ''}.`;
    speechService.speak(
      speechText,
      language,
      () => setIsReadingAloud(false),
      () => setIsReadingAloud(false)
    );
  };

  const getPriorityTag = () => {
    switch (task.priority) {
      case 'high':
        return <span className="tag-badge tag-priority-high"> {t('priority_high')}</span>;
      case 'medium':
        return <span className="tag-badge tag-priority-medium"> {t('priority_medium')}</span>;
      case 'low':
        return <span className="tag-badge tag-priority-low"> {t('priority_low')}</span>;
      default:
        return null;
    }
  };

  const getCategoryLabel = () => {
    switch (task.category) {
      case 'morning':
        return ` ${t('filter_morning')}`;
      case 'afternoon':
        return ` ${t('filter_afternoon')}`;
      case 'evening':
        return ` ${t('filter_evening')}`;
      case 'anytime':
        return ` ${t('filter_all')}`;
    }
  };

  const getRecurrenceBadge = () => {
    if (task.isOneOff || task.recurrenceType === 'one-off') {
      return (
        <span
          className="tag-badge"
          style={{
            background: 'var(--accent-sun-light)',
            color: 'var(--accent-sun)',
            border: '1px solid rgba(230, 140, 25, 0.3)',
          }}
        >
           {t('filter_oneoff')}
        </span>
      );
    }
    if (task.recurrenceType === 'custom_days' && task.daysOfWeek && task.daysOfWeek.length > 0) {
      const daysLabels = Array.from({length:7},(_,i)=>new Intl.DateTimeFormat(language==='auto'?undefined:language,{weekday:'short'}).format(new Date(2026,0,4+i)));
      const text = task.daysOfWeek.map((d) => daysLabels[d]).join(', ');
      return (
        <span
          className="tag-badge"
          style={{
            background: 'var(--accent-purple-light)',
            color: 'var(--accent-purple)',
            border: '1px solid rgba(117, 91, 180, 0.3)',
          }}
        >
           {text}
        </span>
      );
    }
    return null;
  };

  const subTasksCompleted = task.subTasks ? task.subTasks.filter((st) => st.completed).length : 0;
  const totalSubTasks = task.subTasks ? task.subTasks.length : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      className={`task-card ${isCompletedToday ? 'completed' : ''}`}
      id={`task-card-${task.id}`}
    >
      {/* Top Main Row: Checkbox + Icon + Title/Description + Meta Tags */}
      <div className="task-main-row">
        {/* Checkbox button */}
        <button
          className={`task-checkbox-btn ${isCompletedToday ? 'checked' : ''}`}
          onClick={(e) => onToggleComplete(task, e)}
          aria-label={isCompletedToday ? ui('Mark incomplete',language)+': '+task.title : ui('Mark complete',language)+': '+task.title}
          id={`task-check-${task.id}`}
        >
          {isCompletedToday && <IconRenderer name="Check" size={18} />}
        </button>

        {/* Category / Task Icon */}
        <div className="task-icon-wrapper" title={task.category==='anytime'?ui('Anytime',language):t(('filter_'+task.category) as 'filter_morning')}>
          <IconRenderer name={task.iconName || 'CheckCircle2'} size={20} />
        </div>

        {/* Content with Bionic Reading */}
        <div className="task-content">
          <div className="task-header-line">
            <span className="task-title">
              <BionicText text={task.title} enabled={bionicReading} />
            </span>

            {/* Read Aloud TTS button for Dyslexia */}
            <button
              type="button"
              onClick={handleReadAloud}
              title={ui('Read aloud',language)}
              style={{
                fontSize: '0.82rem',
                opacity: isReadingAloud ? 1 : 0.65,
                color: isReadingAloud ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px 4px',
                display: 'inline-flex',
                alignItems: 'center',
                background: 'none',
                border: 'none',
              }}
              aria-label={ui('Read aloud',language)}
            ><IconRenderer name="Volume2" size={15}/>
            </button>
          </div>

          {task.description && (
            <p className="task-description">
              <BionicText text={task.description} enabled={bionicReading} />
            </p>
          )}

          {/* Meta Tags Row */}
          <div className="task-meta-tags">
            {getPriorityTag()}
            <span className="tag-badge tag-category">{getCategoryLabel()}</span>
            {getRecurrenceBadge()}
            {task.estimatedMinutes && (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <IconRenderer name="Clock" size={12} />
                {task.estimatedMinutes}m
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions Toolbar */}
      <div className="task-actions-row">
        <div className="task-actions-left">
          {/* Sub-tasks chip or 1-click Magic Breakdown */}
          {totalSubTasks > 0 ? (
            <button
              type="button"
              onClick={() => setShowSubTasks(!showSubTasks)}
              className="task-subtasks-toggle-btn"
            >
               {subTasksCompleted}/{totalSubTasks} {t('steps_label')} {showSubTasks ? '▲' : '▼'}
            </button>
          ) : (
            onSetSubTasks && <StepHelper title={task.title} description={task.description} language={language} existing={totalSubTasks} onApply={steps=>onSetSubTasks(task.id,steps)}/>
          )}
        </div>

        <div className="task-actions-right">
          <div className="task-xp-badge" title={`${task.xpValue} XP`}>
            +{task.xpValue} XP
          </div>

          {!isCompletedToday && (
            <button
              className="btn-icon"
              onClick={() => onFocusTask(task)}
              title={ui('Start this action',language)}
              aria-label={ui('Start this action',language)}
              style={{ color: 'var(--primary)' }}
            >
              <IconRenderer name="Target" size={15} />
            </button>
          )}

          <button
            className="btn-icon"
            onClick={() => onEditTask(task)}
            title={ui('Task details',language)}
            aria-label={ui('Task details',language)}
            id={`edit-task-${task.id}`}
          >
            <IconRenderer name="Edit2" size={14} />
          </button>

          <button
            className="btn-icon"
            onClick={() => {
              if (window.confirm(t('confirm_delete_task'))) {
                onDeleteTask(task.id);
              }
            }}
            title={t('delete_task')}
            aria-label={t('delete_task')}
            style={{ color: 'var(--accent-fire)' }}
            id={`delete-task-${task.id}`}
          >
            <IconRenderer name="Trash2" size={14} />
          </button>
        </div>
      </div>

      {/* Expandable Sub-Tasks List */}
      {showSubTasks && task.subTasks && task.subTasks.length > 0 && (
        <div className="task-subtasks-drawer">
          {task.subTasks.map((st) => (
            <div
              key={st.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: st.completed ? 'line-through' : 'none',
              }}
            >
              <input
                type="checkbox"
                checked={st.completed}
                onChange={() => onToggleSubTask && onToggleSubTask(task.id, st.id)}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <span>
                <BionicText text={st.title} enabled={bionicReading} />
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
