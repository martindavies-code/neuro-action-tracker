import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Priority, RoutineCategory, TaskItem, UserStats } from '../types';
import { sound } from '../services/soundService';
import { IconRenderer } from './IconRenderer';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onAddTask: (taskData: Partial<TaskItem>) => TaskItem;
  onCompleteTask: (task: TaskItem) => void;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  stats,
  onAddTask,
  onCompleteTask,
  onUpdateStats,
}) => {
  const [step, setStep] = useState(1);
  const [interactiveTaskTitle, setInteractiveTaskTitle] = useState('Pack bag or tidy 1 surface');
  const [interactiveCategory, setInteractiveCategory] = useState<RoutineCategory>('evening');
  const [interactivePriority, setInteractivePriority] = useState<Priority>('high');
  const [createdTask, setCreatedTask] = useState<TaskItem | null>(null);
  const [hasCompletedDemoTask, setHasCompletedDemoTask] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const isReplay = Boolean(stats.tutorialXpAwarded);

  const handleCreateInteractiveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactiveTaskTitle.trim()) return;

    sound.playPop();
    const newTask = onAddTask({
      title: interactiveTaskTitle.trim(),
      description: 'Practice task created during tutorial',
      category: interactiveCategory,
      priority: interactivePriority,
      xpValue: isReplay ? 0 : 20,
      estimatedMinutes: 5,
      iconName: 'Zap',
      recurrenceType: 'daily',
    });

    setCreatedTask(newTask);
    setStep(3); // Advance to complete step
  };

  const handleInteractiveComplete = () => {
    if (!createdTask || hasCompletedDemoTask) return;
    setHasCompletedDemoTask(true);
    sound.playLevelUp();
    onCompleteTask(createdTask);

    if (!stats.tutorialXpAwarded) {
      onUpdateStats({ tutorialXpAwarded: true });
    }

    setTimeout(() => {
      setStep(4);
    }, 900);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="onboarding-overlay" 
          id="onboarding-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="onboarding-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Step Indicator Header */}
            <div className="onboarding-step-indicator">
              <div className="step-dots">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`step-dot ${s === step ? 'active' : s < step ? 'completed' : ''}`}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                STEP {step} OF 5 {isReplay ? '• (Replay Mode)' : ''}
              </span>
            </div>

            {/* STEP 1: Welcome & Overview */}
            {step === 1 && (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}
                >
                  <IconRenderer name="Sparkles" size={30} />
                </div>

                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Welcome to RhythmQuest!
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
                  Designed for neurodivergent minds (ADHD, Autism, Executive Dysfunction).
                  Built with visual clarity, shame-free streak shields, and sensory pacing.
                </p>

                <div
                  style={{
                    background: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    textAlign: 'left',
                    marginBottom: '20px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <IconRenderer name="Check" size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Interactive Worked Example
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {isReplay
                      ? 'Replaying the tutorial will not grant duplicate XP, but allows you to practice anytime.'
                      : 'We will walk you through creating and completing your first task right now for +20 XP!'}
                  </p>
                </div>

                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                  onClick={() => {
                    sound.playPop();
                    setStep(2);
                  }}
                  id="onboarding-start-btn"
                >
                  <span>Let's Try It Together →</span>
                </button>
              </div>
            )}

            {/* STEP 2: Interactive Task Creation */}
            {step === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
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
                    <IconRenderer name="Plus" size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Worked Example: Add a Task
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Try editing or submitting this practice action item:
                    </p>
                  </div>
                </div>

                <div className="onboarding-interactive-box">
                  <form onSubmit={handleCreateInteractiveTask}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="onboard-task-input">Task Title</label>
                      <input
                        id="onboard-task-input"
                        type="text"
                        className="form-input"
                        value={interactiveTaskTitle}
                        onChange={(e) => setInteractiveTaskTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                      <div>
                        <label className="form-label" htmlFor="onboard-cat-select">Routine</label>
                        <select
                          id="onboard-cat-select"
                          className="form-select"
                          value={interactiveCategory}
                          onChange={(e) => setInteractiveCategory(e.target.value as RoutineCategory)}
                        >
                          <option value="morning">🌅 Morning</option>
                          <option value="afternoon">☀️ Afternoon</option>
                          <option value="evening">🌙 Evening</option>
                          <option value="anytime">🕒 Anytime</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label" htmlFor="onboard-prio-select">Priority</label>
                        <select
                          id="onboard-prio-select"
                          className="form-select"
                          value={interactivePriority}
                          onChange={(e) => setInteractivePriority(e.target.value as Priority)}
                        >
                          <option value="high">🔥 High Priority</option>
                          <option value="medium">⚡ Medium</option>
                          <option value="low">🌿 Gentle</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      id="onboarding-create-task-btn"
                    >
                      <IconRenderer name="Plus" size={16} />
                      <span>Add to My Routine {isReplay ? '(Practice)' : '(+20 XP)'}</span>
                    </button>
                  </form>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button className="btn-secondary" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Step 1 of 2 in practice
                  </span>
                </div>
              </div>
            )}

            {/* STEP 3: Interactive Task Completion */}
            {step === 3 && createdTask && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconRenderer name="Check" size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Worked Example: Complete Your Task
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Click the checkbox below to feel the gentle reward chime:
                    </p>
                  </div>
                </div>

                <div className="onboarding-interactive-box">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: hasCompletedDemoTask ? 'var(--primary-light)' : 'var(--bg-surface)',
                      border: `2px solid ${hasCompletedDemoTask ? 'var(--primary)' : 'var(--border-strong)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        className={`task-checkbox-btn ${hasCompletedDemoTask ? 'checked' : ''}`}
                        onClick={handleInteractiveComplete}
                        id="onboarding-task-checkbox"
                        style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                        aria-label="Complete task in tutorial"
                      >
                        {hasCompletedDemoTask && <IconRenderer name="Check" size={18} />}
                      </button>

                      <div>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '1rem',
                            textDecoration: hasCompletedDemoTask ? 'line-through' : 'none',
                            color: hasCompletedDemoTask ? 'var(--text-muted)' : 'var(--text-primary)',
                          }}
                        >
                          {createdTask.title}
                        </span>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                          <span className="tag-badge tag-priority-high">🔥 HIGH</span>
                          <span className="tag-badge tag-category">🌙 EVENING</span>
                        </div>
                      </div>
                    </div>

                    <div className="task-xp-badge" style={{ fontSize: '0.85rem' }}>
                      +{createdTask.xpValue} XP
                    </div>
                  </div>

                  {hasCompletedDemoTask && (
                    <div
                      style={{
                        marginTop: '14px',
                        padding: '10px',
                        background: 'var(--success-light)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        fontSize: '0.85rem',
                        animation: 'popCelebration 0.4s ease',
                      }}
                    >
                      🎉 Fantastic! You completed your first action step!
                    </div>
                  )}
                </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-primary"
                onClick={() => setStep(4)}
                id="onboarding-next-after-complete"
              >
                <span>Streak Shields & Rest Days →</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Deep Dive on Streak Shields & Automatic Rest */}
        {step === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-blue-light)',
                  color: 'var(--accent-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconRenderer name="Shield" size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  🛡️ Streak Shields: Zero Guilt on Bad Days
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Built specifically for chronic fatigue, burnout, and bed-rest days
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '1.2rem' }}>🛋️</span>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Automatic Protection (No Action Required)
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Some days you cannot get out of bed or open your phone. If you miss a day, your Streak Shield <strong>automatically activates at midnight</strong> to keep your streak alive. You don't have to press anything.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '1.2rem' }}>🎁</span>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    How You Earn Shields
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    You start with <strong>2 Welcome Shields</strong> right away! Every 3 days of continuous routine automatically crafts <strong>+1 new shield</strong> (up to 3 max stored).
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '1.2rem' }}>📅</span>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    One-Off & Day-Specific Tasks
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Create single-use tasks (like doctor appointments) or routines that only appear on specific days of the week (e.g. watering plants on Sundays).
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(3)}>
                ← Back
              </button>
              <button className="btn-primary" onClick={() => setStep(5)} id="onboarding-step4-next">
                <span>Final Step →</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Ready to Go */}
        {step === 5 && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--success-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <IconRenderer name="Award" size={30} />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              You're Ready to Flow!
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              Your rhythm is set. Use Focus Mode when overwhelmed, change your Sensory Battery as energy shifts, and let Streak Shields protect you guilt-free.
            </p>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem' }}
              onClick={() => {
                sound.playLevelUp();
                onClose();
              }}
              id="onboarding-finish-btn"
            >
              <IconRenderer name="Sparkles" size={18} />
              <span>Enter My Action Tracker</span>
            </button>
          </div>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
