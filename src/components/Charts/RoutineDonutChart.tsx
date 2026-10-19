import React, { useMemo } from 'react';
import type { RoutineCategory, SupportedLanguage, TaskItem } from '../../types';
import { getTranslation } from '../../services/i18nService';

interface RoutineDonutChartProps {
  tasks: TaskItem[];
  language?: SupportedLanguage;
}

const CATEGORY_META: Record<RoutineCategory, { color: string; labelKey: Parameters<typeof getTranslation>[0]; emoji: string }> = {
  morning: { color: 'var(--accent-sun)', labelKey: 'filter_morning', emoji: '🌅' },
  afternoon: { color: 'var(--accent-blue)', labelKey: 'filter_afternoon', emoji: '☀️' },
  evening: { color: 'var(--accent-purple)', labelKey: 'filter_evening', emoji: '🌙' },
  anytime: { color: 'var(--primary)', labelKey: 'filter_all', emoji: '🕒' },
};

export const RoutineDonutChart: React.FC<RoutineDonutChartProps> = ({ tasks, language = 'auto' }) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, language);
  const activeTasks = tasks.filter((t) => !t.archived);

  const { counts, totalTasks, topCategory, topCategoryPercent, segments } = useMemo(() => {
    const c: Record<RoutineCategory, number> = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      anytime: 0,
    };

    activeTasks.forEach((t) => {
      c[t.category] = (c[t.category] || 0) + 1;
    });

    const total = activeTasks.length;

    let topCat: RoutineCategory = 'morning';
    let maxC = 0;
    (Object.keys(c) as RoutineCategory[]).forEach((cat) => {
      if (c[cat] > maxC) {
        maxC = c[cat];
        topCat = cat;
      }
    });

    const segs: Array<{ category: RoutineCategory; count: number; percent: number; rotation: number }> = [];
    let accPercent = 0;

    (Object.keys(c) as RoutineCategory[]).forEach((cat) => {
      const count = c[cat];
      if (count > 0 && total > 0) {
        const percent = count / total;
        const rotation = accPercent * 360 - 90;
        segs.push({ category: cat, count, percent, rotation });
        accPercent += percent;
      }
    });

    const topPct = total > 0 ? Math.round((maxC / total) * 100) : 0;

    return { counts: c, totalTasks: total, topCategory: topCat, topCategoryPercent: topPct, segments: segs };
  }, [activeTasks]);

  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="dash-card chart-card" id="routine-donut-chart-card">
      {/* Key Takeaway Headline (Solves Flaw #1 & #6) */}
      <div className="dash-card-header" style={{ marginBottom: '14px' }}>
        <div>
          <h3 className="dash-card-title" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            🕒 Daily Routine Balance
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {totalTasks > 0 ? (
              <>
                <strong style={{ color: CATEGORY_META[topCategory].color, fontWeight: 700 }}>
                  {CATEGORY_META[topCategory].emoji} {t(CATEGORY_META[topCategory].labelKey)} ({topCategoryPercent}%)
                </strong>{' '}
                is your largest energy block across {totalTasks} total routines
              </>
            ) : (
              'Add your first routines to see your time-of-day distribution'
            )}
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: '16px',
          flexWrap: 'wrap',
          padding: '6px 0',
        }}
      >
        {/* Donut graphic with high-contrast central callout */}
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="var(--bg-surface-subtle)"
              strokeWidth={strokeWidth}
            />

            {totalTasks === 0 ? (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="var(--border-medium)"
                strokeWidth={strokeWidth}
                strokeDasharray="4 4"
              />
            ) : (
              segments.map((seg) => {
                const strokeDashoffset = circumference - seg.percent * circumference;
                return (
                  <circle
                    key={seg.category}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={CATEGORY_META[seg.category].color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(${seg.rotation} ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
                  />
                );
              })
            )}
          </svg>

          {/* Central Callout (Clear, unambiguous summary) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {totalTasks}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Routines
            </span>
          </div>
        </div>

        {/* Direct Integrated Category Breakdown (Solves Flaw #5 Disconnected Legends) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flex: '1 1 180px',
            minWidth: '170px',
          }}
        >
          {(Object.keys(counts) as RoutineCategory[]).map((cat) => {
            const count = counts[cat];
            const percent = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
            const meta = CATEGORY_META[cat];

            return (
              <div
                key={cat}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: count > 0 ? 'var(--bg-surface-subtle)' : 'transparent',
                  border: count > 0 ? '1px solid var(--border-subtle)' : '1px dashed var(--border-subtle)',
                  opacity: count > 0 ? 1 : 0.5,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>{meta.emoji}</span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {t(meta.labelKey)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {percent}%
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: count > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                      background: count > 0 ? 'var(--bg-surface)' : 'transparent',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: count > 0 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
