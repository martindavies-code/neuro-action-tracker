import React, { useMemo } from 'react';
import type { Badge, DayCompletionRecord, SupportedLanguage, TaskItem, UserStats } from '../types';
import { getLevelInfo, getCompanionStage } from '../services/gamificationService';
import { getTranslation } from '../services/i18nService';
import { IconRenderer } from './IconRenderer';
import { WeeklyBarChart } from './Charts/WeeklyBarChart';
import { RoutineDonutChart } from './Charts/RoutineDonutChart';
import { ConsistencyGrid } from './Charts/ConsistencyGrid';

interface ProgressDashboardProps {
  stats: UserStats;
  tasks: TaskItem[];
  badges: Badge[];
  past7Days: DayCompletionRecord[];
  language?: SupportedLanguage;
  onOpenXpRoadmap?: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  stats,
  tasks,
  badges,
  past7Days,
  language = 'auto',
  onOpenXpRoadmap,
}) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, language);
  const levelInfo = getLevelInfo(stats.xp);
  const companionInfo = getCompanionStage(undefined, stats.level);

  const activeTasks = useMemo(() => tasks.filter((t) => !t.archived), [tasks]);

  // Derived unique analytical metrics (Solves Flaw #7 Duplicated Info)
  const analytics = useMemo(() => {
    const totalWeeklyDone = past7Days.reduce((acc, d) => acc + d.completedCount, 0);
    const totalWeeklyScheduled = past7Days.reduce((acc, d) => acc + d.totalAvailable, 0);
    const weeklyRate = totalWeeklyScheduled > 0 ? Math.round((totalWeeklyDone / totalWeeklyScheduled) * 100) : 0;
    const unlockedBadges = badges.filter((b) => b.unlockedAt !== null);
    const inProgressBadges = badges.filter((b) => b.unlockedAt === null);

    return {
      totalWeeklyDone,
      totalWeeklyScheduled,
      weeklyRate,
      unlockedBadges,
      inProgressBadges,
    };
  }, [past7Days, badges]);

  return (
    <div id="progress-dashboard-view" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. HERO MODULE: Level, Next Unlock & Companion Evolution (Solves Flaw #1, #2, #3) */}
      <div className="dash-hero-card" id="dashboard-hero-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="level-circle-icon" title={`Level ${levelInfo.level}: ${levelInfo.levelTitle}`}>
              <span>{levelInfo.level}</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('current_rank')}
                </span>
                <span className="tag-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                  {companionInfo.formattedStage}
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 4px' }}>
                Level {levelInfo.level}: {levelInfo.levelTitle}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {stats.xp} Total XP •{' '}
                <strong style={{ color: 'var(--primary)' }}>
                  {levelInfo.xpNeededForNext - levelInfo.xpInCurrentLevel} XP needed
                </strong>{' '}
                to reach Level {levelInfo.level + 1}
              </p>
            </div>
          </div>

          {onOpenXpRoadmap && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onOpenXpRoadmap}
              style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: 'var(--radius-md)' }}
              id="dash-what-is-xp-btn"
            >
              <IconRenderer name="HelpCircle" size={15} />
              <span>{t('what_is_xp_btn')}</span>
            </button>
          )}
        </div>

        {/* Progress Track */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>Progress to Rank {levelInfo.level + 1}</span>
            <span>{levelInfo.progressPercent}%</span>
          </div>
          <div className="progress-track" style={{ height: '12px' }}>
            <div className="progress-fill" style={{ width: `${levelInfo.progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* 2. NON-REDUNDANT KEY SIGNALS (Solves Flaw #2 Visual Hierarchy & #7 Duplicated Info) */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          {/* Signal 1: Weekly Consistency Rate */}
          <div className="dash-card dash-metric-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconRenderer name="TrendingUp" size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  7-Day Consistency
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {analytics.weeklyRate}%
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              {analytics.totalWeeklyDone} of {analytics.totalWeeklyScheduled} routines completed this week
            </p>
          </div>

          {/* Signal 2: Active Streak Momentum */}
          <div className="dash-card dash-metric-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-fire-light)',
                  color: 'var(--accent-fire)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconRenderer name="Flame" size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('current_streak_label')}
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats.currentStreak} {t('days_count')}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              All-time personal best: <strong>{stats.longestStreak} days</strong>
            </p>
          </div>

          {/* Signal 3: Streak Shields Guarding Momentum */}
          <div className="dash-card dash-metric-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-purple-light)',
                  color: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconRenderer name="Shield" size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('shields_label')}
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats.streakShields} {t('active_count')}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Autoprotects rest days at midnight with 0 guilt
            </p>
          </div>

          {/* Signal 4: Lifetime Completions */}
          <div className="dash-card dash-metric-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-sun-light)',
                  color: 'var(--accent-sun)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconRenderer name="CheckCircle2" size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Wins Logged
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats.totalCompletions}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Across {activeTasks.length} customized brain routines
            </p>
          </div>
        </div>
      </div>

      {/* 3. VISUAL ROUTINE & HABIT ANALYTICS (Solves Flaw #1 Narrative & #5 Plot Labelling) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        <WeeklyBarChart data={past7Days} language={language} />
        <RoutineDonutChart tasks={tasks} language={language} />
      </div>

      {/* 4. 28-DAY HABIT MOMENTUM MATRIX */}
      <ConsistencyGrid tasks={tasks} language={language} />

      {/* 5. STRUCTURED MILESTONE ACHIEVEMENTS (Solves Flaw #4 Data Dump) */}
      <div className="dash-card" id="milestones-section">
        <div className="dash-card-header" style={{ marginBottom: '16px' }}>
          <div>
            <h3 className="dash-card-title" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              <IconRenderer name="Award" size={20} />
              <span>Milestone Badges ({analytics.unlockedBadges.length}/{badges.length} Unlocked)</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Dopamine milestones unlocked naturally through daily neurodivergent rhythm
            </p>
          </div>
        </div>

        {/* Unlocked Badges (Celebrating) */}
        {analytics.unlockedBadges.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '10px' }}>
              ✨ Unlocked Badges ({analytics.unlockedBadges.length})
            </span>
            <div className="badges-grid">
              {analytics.unlockedBadges.map((badge) => (
                <div key={badge.id} className="badge-item unlocked" id={`badge-card-${badge.id}`}>
                  <div className="badge-icon-box">
                    <IconRenderer name={badge.iconName || 'Award'} size={22} />
                  </div>
                  <h4 className="badge-title">{badge.title}</h4>
                  <p className="badge-desc">{badge.description}</p>
                  <span className="badge-requirement" style={{ color: 'var(--primary)', fontWeight: 800, marginTop: '4px' }}>
                    ✓ Unlocked
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Progress Badges (Clear Motivation & Goal Path) */}
        {analytics.inProgressBadges.length > 0 && (
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '10px' }}>
              🎯 Next Up to Unlock ({analytics.inProgressBadges.length})
            </span>
            <div className="badges-grid">
              {analytics.inProgressBadges.map((badge) => (
                <div key={badge.id} className="badge-item locked" id={`badge-card-${badge.id}`}>
                  <div className="badge-icon-box">
                    <IconRenderer name={badge.iconName || 'Award'} size={22} />
                  </div>
                  <h4 className="badge-title">{badge.title}</h4>
                  <p className="badge-desc">{badge.description}</p>
                  <span className="badge-requirement" style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '4px' }}>
                    Goal: {badge.requirement}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
