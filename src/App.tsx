import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TaskItem } from './types';
import { getTodayIncompleteTasks, isTaskScheduledForToday, setOnboardingCompleted } from './services/storageService';
import { Header } from './components/Header';
import { DailyChecklist } from './components/DailyChecklist';
import { FocusMode } from './components/FocusMode';
import { ProgressDashboard } from './components/ProgressDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { TaskModal } from './components/TaskModal';
import { OnboardingModal } from './components/OnboardingModal';
import { TaskSpinner } from './components/TaskSpinner';
import { CommandPalette } from './components/CommandPalette';
import { XpRoadmapModal } from './components/XpRoadmapModal';
import { IconRenderer } from './components/IconRenderer';
import { getTranslation } from './services/i18nService';

import { useUIState } from './hooks/useUIState';
import { useTaskState } from './hooks/useTaskState';

export const App: React.FC = () => {
  const [focusTask, setFocusTask] = useState<TaskItem | null>(null);

  // Initialize UI State
  const uiState = useUIState();
  const {
    activeTab,
    setActiveTab,
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
  } = uiState;

  // Initialize Task State
  const taskState = useTaskState(
    showToast,
    focusTask,
    setFocusTask
  );

  const {
    tasks,
    settings,
    setStats,
    badges,
    todayStr,
    past7Days,
    computedStats,
    handleUpdateSettings,
    handleToggleComplete,
    handleToggleSubTask,
    handleAddSubTask,
    handleBreakdownTask,
    handleSetSubTasks,
    handleSaveTask,
    handleDirectAddTask,
    handleDeleteTask,
    handleChangePriority,
    handleExportJSON,
    handleImportJSON,
    handleResetData,
  } = taskState;

  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, settings.language);

  // Focus Mode Actions
  const handleOpenFocusMode = (task?: TaskItem) => {
    if (task) {
      setFocusTask(task);
    } else {
      const activeIncomplete = getTodayIncompleteTasks(tasks, todayStr)
        .sort((a, b) => {
          const priorityScore = { high: 3, medium: 2, low: 1 };
          return priorityScore[b.priority] - priorityScore[a.priority];
        });

      if (activeIncomplete.length > 0) {
        setFocusTask(activeIncomplete[0]);
      } else {
        const todayTasks = tasks.filter((t_item) => isTaskScheduledForToday(t_item, todayStr));
        setFocusTask(todayTasks[0] || tasks[0] || null);
      }
    }
    setActiveTab('focus');
  };

  const handleNextFocusTask = () => {
    const activeIncomplete = getTodayIncompleteTasks(tasks, todayStr).filter(
      (t_item) => t_item.id !== focusTask?.id
    );
    if (activeIncomplete.length > 0) {
      setFocusTask(activeIncomplete[0]);
    } else {
      setActiveTab('today');
      showToast(t('all_tasks_done_toast'));
    }
  };

  const handleCompleteInFocus = (task: TaskItem, e?: React.MouseEvent) => {
    handleToggleComplete(task, e, true);
    const activeIncomplete = getTodayIncompleteTasks(tasks, todayStr).filter(
      (t_item) => t_item.id !== task.id
    );
    if (activeIncomplete.length > 0) {
      setFocusTask(activeIncomplete[0]);
    } else {
      setActiveTab('today');
      showToast(t('all_tasks_done_toast'));
    }
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {achievementToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'var(--bg-surface)',
            border: '2px solid var(--primary)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            animation: 'slideIn 0.3s ease',
          }}
        >
          <span>{achievementToast}</span>
        </div>
      )}

      {/* Header */}
      <Header
        stats={computedStats}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenSettings={() => setActiveTab('settings')}
        onOpenXpRoadmap={() => setIsXpRoadmapOpen(true)}
      />

      {/* Main Navigation Tabs */}
      <nav className="main-nav">
        <button
          className={`nav-tab-btn ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
          id="tab-today-btn"
        >
          <IconRenderer name="Sparkles" size={17} />
          <span>{t('tab_today')}</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'focus' ? 'active' : ''}`}
          onClick={() => handleOpenFocusMode()}
          id="tab-focus-btn"
        >
          <IconRenderer name="Target" size={17} />
          <span>{t('tab_focus')}</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          id="tab-dashboard-btn"
        >
          <IconRenderer name="Trophy" size={17} />
          <span>{t('tab_dashboard')}</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          id="tab-settings-btn"
        >
          <IconRenderer name="Palette" size={17} />
          <span>{t('tab_settings')}</span>
        </button>
      </nav>

      {/* Dynamic Viewport Container */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DailyChecklist
                tasks={tasks}
                stats={computedStats}
                settings={settings}
                todayStr={todayStr}
                language={settings.language}
                onUpdateSettings={handleUpdateSettings}
                onToggleComplete={handleToggleComplete}
                onFocusTask={handleOpenFocusMode}
                onEditTask={(t_item) => {
                  setEditingTask(t_item);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onOpenCreateModal={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                onStartFocusMode={() => handleOpenFocusMode()}
                onOpenSpinner={() => setIsSpinnerOpen(true)}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                onToggleSubTask={handleToggleSubTask}
                onBreakdownTask={handleBreakdownTask}
              />
            </motion.div>
          )}

          {activeTab === 'focus' && (
            <motion.div
              key="focus"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {focusTask ? (
                <FocusMode
                  key={focusTask.id}
                  task={focusTask}
                  language={settings.language}
                  onComplete={handleCompleteInFocus}
                  onNextTask={handleNextFocusTask}
                  onExit={() => setActiveTab('today')}
                  onToggleSubTask={handleToggleSubTask}
                  onAddSubTask={handleAddSubTask}
                  onSetSubTasks={handleSetSubTasks}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', margin: '20px auto', maxWidth: '480px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎯</div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {t('ready_to_focus')}
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 auto 20px', lineHeight: 1.5 }}>
                    {t('no_active_tasks_focus')}
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                  >
                    <IconRenderer name="Plus" size={16} />
                    <span>{t('create_task_action')}</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ProgressDashboard
                stats={computedStats}
                tasks={tasks}
                badges={badges}
                past7Days={past7Days}
                language={settings.language}
                onOpenXpRoadmap={() => setIsXpRoadmapOpen(true)}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SettingsPanel
                tasks={tasks}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onEditTask={(t_item) => {
                  setEditingTask(t_item);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onOpenCreateModal={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                onChangePriority={handleChangePriority}
                onResetData={handleResetData}
                onExportJSON={handleExportJSON}
                onImportJSON={handleImportJSON}
                onReplayTutorial={() => setIsOnboardingOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Interactive Modal Drawers */}
      <TaskModal
        isOpen={isTaskModalOpen}
        language={settings.language}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={(taskData) => handleSaveTask(taskData, editingTask)}
        onDelete={handleDeleteTask}
        initialTask={editingTask}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          setOnboardingCompleted(true);
        }}
        stats={computedStats}
        onAddTask={handleDirectAddTask}
        onCompleteTask={(t_item) => handleToggleComplete(t_item)}
        onUpdateStats={(newStats) => {
          setStats((prev) => ({ ...prev, ...newStats }));
        }}
      />

      <TaskSpinner
        tasks={tasks}
        todayStr={todayStr}
        language={settings.language}
        isOpen={isSpinnerOpen}
        onClose={() => setIsSpinnerOpen(false)}
        onSelectTaskToFocus={(t_item) => handleOpenFocusMode(t_item)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        todayStr={todayStr}
        language={settings.language}
        onToggleComplete={(t_item) => handleToggleComplete(t_item)}
        onFocusTask={(t_item) => handleOpenFocusMode(t_item)}
        onOpenCreateModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
      />

      <XpRoadmapModal
        isOpen={isXpRoadmapOpen}
        onClose={() => setIsXpRoadmapOpen(false)}
        stats={computedStats}
        companionChoice={settings.companionChoice}
        onSelectCompanion={(choice) => handleUpdateSettings({ companionChoice: choice })}
      />
    </div>
  );
};
