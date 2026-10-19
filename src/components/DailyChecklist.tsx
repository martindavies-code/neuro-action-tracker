import React, { useState } from 'react';
import type { SensorySettings, SupportedLanguage, TaskItem, UserStats } from '../types';
import { IconRenderer } from './IconRenderer';
import { TaskCard } from './TaskCard';
import { CompanionWidget } from './CompanionWidget';
import { AmbientSoundBar } from './AmbientSoundBar';
import { SpoonBatteryWidget } from './SpoonBatteryWidget';
import { getTranslation } from '../services/i18nService';
import { isTaskScheduledForToday } from '../services/storageService';
import { triggerCelebration } from './ConfettiBurst';

interface DailyChecklistProps {
  tasks: TaskItem[];
  stats: UserStats;
  settings: SensorySettings;
  todayStr: string;
  language?: SupportedLanguage;
  onUpdateSettings: (newSettings: Partial<SensorySettings>) => void;
  onToggleComplete: (task: TaskItem, e?: React.MouseEvent) => void;
  onFocusTask: (task: TaskItem) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateModal: () => void;
  onStartFocusMode: () => void;
  onOpenSpinner: () => void;
  onOpenCommandPalette: () => void;
  onToggleSubTask?: (taskId: string, subTaskId: string) => void;
  onBreakdownTask?: (task: TaskItem) => void;
}

export const DailyChecklist: React.FC<DailyChecklistProps> = ({
  tasks,
  stats,
  settings,
  todayStr,
  language,
  onUpdateSettings,
  onToggleComplete,
  onFocusTask,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal,
  onStartFocusMode,
  onOpenSpinner,
  onOpenCommandPalette,
  onToggleSubTask,
  onBreakdownTask,
}) => {
  const currentLang = language || settings.language || 'auto';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, currentLang);
  const [selectedFilter, setSelectedFilter] = useState<string>('today');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const hasCelebratedAllDoneRef = React.useRef(false);

  const activeTasks = tasks.filter((taskItem) => !taskItem.archived);

  // Check if a task is scheduled for today
  const isScheduledToday = (task: TaskItem) => isTaskScheduledForToday(task, todayStr);

  // Filter tasks by selected tab and priority
  const filteredTasks = activeTasks.filter((task) => {
    // Energy battery filter (Spoon Theory):
    if (selectedFilter !== 'all') {
      const isDone = Array.isArray(task.completedDates) && task.completedDates.includes(todayStr);
      const estMins = task.estimatedMinutes ?? 5;

      if (!isDone) {
        if (settings.energyBattery === 'low') {
          // Gentle Mode: shows only quick 1–5 min micro-wins (low/medium priority)
          const isMicro = (task.priority === 'low' || task.priority === 'medium') && estMins <= 5;
          if (!isMicro) return false;
        } else if (settings.energyBattery === 'moderate') {
          // Steady Pace: hides heavy tasks (>15 mins) to prevent daily fatigue
          const isManageable = estMins <= 15;
          if (!isManageable) return false;
        }
        // High Energy ('full'): shows all routine tasks including 20+ min deep focus
      }
    }

    let matchTab = true;
    if (selectedFilter === 'today') {
      matchTab = isScheduledToday(task);
    } else if (selectedFilter === 'one-off') {
      matchTab = Boolean(task.isOneOff || task.recurrenceType === 'one-off');
    } else if (selectedFilter === 'morning' || selectedFilter === 'afternoon' || selectedFilter === 'evening' || selectedFilter === 'anytime') {
      matchTab = task.category === selectedFilter;
    } else if (selectedFilter === 'all') {
      matchTab = true;
    }

    const matchPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    return matchTab && matchPriority;
  });

  // Calculate today's stats from tasks scheduled for today
  const todayTasksList = activeTasks.filter((taskItem) => isScheduledToday(taskItem));
  const completedTodayCount = todayTasksList.filter((taskItem) => taskItem.completedDates.includes(todayStr)).length;
  const totalTasks = todayTasksList.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTodayCount / totalTasks) * 100) : 0;

  const incompleteTasks = todayTasksList.filter((taskItem) => !taskItem.completedDates.includes(todayStr));

  React.useEffect(() => {
    if (totalTasks > 0 && completedTodayCount === totalTasks && !hasCelebratedAllDoneRef.current) {
      triggerCelebration(settings, { type: 'massive' });
      hasCelebratedAllDoneRef.current = true;
    } else if (completedTodayCount < totalTasks) {
      hasCelebratedAllDoneRef.current = false;
    }
  }, [completedTodayCount, totalTasks, settings]);

  return (
    <div>
      {/* Companion Encourager with Custom Species & TTS */}
      {settings.showCompanion && (
        <CompanionWidget
          stats={stats}
          completedTodayCount={completedTodayCount}
          companionChoice={settings.companionChoice}
          language={settings.language}
        />
      )}

      {/* Autistic Spoon Theory / Sensory Battery Widget */}
      <SpoonBatteryWidget
        battery={settings.energyBattery}
        language={settings.language}
        onChangeBattery={(b) => onUpdateSettings({ energyBattery: b })}
      />

      {/* Ambient Lo-Fi / Soundscape Focus Bar */}
      <AmbientSoundBar language={settings.language} />

      {/* Daily Progress & Motivation Banner */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '18px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t('checklist_title')}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {completedTodayCount === totalTasks && totalTasks > 0
                ? t('all_done_title')
                : `${completedTodayCount} / ${totalTasks} ${t('substeps_progress')} (${progressPercent}%)`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary"
              onClick={onOpenCommandPalette}
              title="Search & Filter Tasks (Ctrl+K)"
              id="search-tasks-btn"
              style={{ padding: '6px 10px', fontSize: '0.82rem' }}
            >
              <IconRenderer name="Search" size={14} />
              <span>{t('command_menu_btn')}</span>
            </button>

            {incompleteTasks.length > 0 && (
              <>
                <button
                  className="btn-secondary"
                  onClick={onOpenSpinner}
                  title="Overcome task paralysis with the Wheel of Small Wins"
                  id="open-spinner-btn"
                  style={{ borderColor: 'var(--accent-sun)', color: 'var(--accent-sun)', padding: '6px 10px', fontSize: '0.82rem' }}
                >
                  <IconRenderer name="Zap" size={14} />
                  <span>{t('task_roulette_btn')} 🎲</span>
                </button>

                <button
                  className="btn-secondary"
                  onClick={onStartFocusMode}
                  title="Focus on 1 single task at a time to reduce overwhelm"
                  id="start-focus-mode-btn"
                  style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                >
                  <IconRenderer name="Target" size={14} />
                  <span>{t('tab_focus')}</span>
                </button>
              </>
            )}

            <button
              className="btn-primary"
              onClick={onOpenCreateModal}
              id="add-new-task-btn"
              style={{ padding: '6px 14px', fontSize: '0.86rem' }}
            >
              <IconRenderer name="Plus" size={16} />
              <span>{t('add_task_btn')}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-track" style={{ height: '10px' }}>
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter and Category Tabs */}
      <div className="action-bar">
        <div className="filter-pills">
          <button
            className={`filter-pill ${selectedFilter === 'today' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('today')}
          >
            {t('filter_today')} ({todayTasksList.length})
          </button>
          <button
            className={`filter-pill ${selectedFilter === 'one-off' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('one-off')}
          >
            📌 {t('filter_oneoff')}
          </button>
          <button
            className={`filter-pill ${selectedFilter === 'morning' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('morning')}
          >
            🌅 {t('filter_morning')}
          </button>
          <button
            className={`filter-pill ${selectedFilter === 'afternoon' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('afternoon')}
          >
            ☀️ {t('filter_afternoon')}
          </button>
          <button
            className={`filter-pill ${selectedFilter === 'evening' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('evening')}
          >
            🌙 {t('filter_evening')}
          </button>
          <button
            className={`filter-pill ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            📅 {t('filter_all')} ({activeTasks.length})
          </button>
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            className="form-select"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            style={{ padding: '4px 10px', fontSize: '0.82rem', minHeight: '34px' }}
          >
            <option value="all">{t('priority_all')}</option>
            <option value="high">🔥 {t('priority_high')}</option>
            <option value="medium">⚡ {t('priority_medium')}</option>
            <option value="low">🌿 {t('priority_low')}</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="tasks-container">
        {filteredTasks.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                margin: '0 auto 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconRenderer name="Sparkles" size={24} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {t('empty_filtered')}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {t('checklist_subtitle')}
            </p>
            <button className="btn-primary" onClick={onOpenCreateModal} style={{ margin: '0 auto' }}>
              <IconRenderer name="Plus" size={15} />
              <span>{t('add_task_btn')}</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isCompletedToday={task.completedDates.includes(todayStr)}
              language={settings.language}
              bionicReading={settings.bionicReading}
              onToggleComplete={onToggleComplete}
              onFocusTask={onFocusTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onToggleSubTask={onToggleSubTask}
              onBreakdownTask={onBreakdownTask}
            />
          ))
        )}
      </div>
    </div>
  );
};
