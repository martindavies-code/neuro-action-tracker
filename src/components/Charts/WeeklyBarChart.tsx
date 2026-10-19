import React, { useState, useMemo } from 'react';
import type { DayCompletionRecord, SupportedLanguage } from '../../types';
import { resolveActiveLanguage } from '../../services/i18nService';

interface WeeklyBarChartProps {
  data: DayCompletionRecord[];
  language?: SupportedLanguage;
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ data, language = 'auto' }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Key estimates & analytical takeaway (solves "Key estimates buried" & "No user journey")
  const statsSummary = useMemo(() => {
    const totalDone = data.reduce((sum, d) => sum + d.completedCount, 0);
    const totalScheduled = data.reduce((sum, d) => sum + d.totalAvailable, 0);
    const ratePercent = totalScheduled > 0 ? Math.round((totalDone / totalScheduled) * 100) : 0;
    const totalXp = data.reduce((sum, d) => sum + d.xpEarned, 0);

    // Find best performing day
    let bestDay = '';
    let bestCount = -1;
    data.forEach((d) => {
      if (d.completedCount > bestCount) {
        bestCount = d.completedCount;
        bestDay = d.date;
      }
    });

    return { totalDone, totalScheduled, ratePercent, totalXp, bestDay, bestCount };
  }, [data]);

  const maxTasks = Math.max(1, ...data.map((d) => Math.max(d.totalAvailable, d.completedCount)));
  const chartHeight = 150;
  const barWidth = 34;
  const gap = 16;
  const leftMargin = 38;
  const svgWidth = data.length * (barWidth + gap) + leftMargin + 16;

  // Cross-browser safe localized weekday formatter
  const formatDayName = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const locale = resolveActiveLanguage(language);
        return d.toLocaleDateString(locale, { weekday: 'short' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="dash-card chart-card" id="weekly-bar-chart-card">
      {/* Actionable Narrative Header with Direct Insight (Solves Flaw #1 & #6) */}
      <div className="dash-card-header" style={{ marginBottom: '12px' }}>
        <div>
          <h3 className="dash-card-title" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            📊 7-Day Completion Flow
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            <strong style={{ color: 'var(--primary)', fontWeight: 700 }}>{statsSummary.ratePercent}% consistency</strong> this week • {statsSummary.totalDone} of {statsSummary.totalScheduled} routines completed (+{statsSummary.totalXp} XP)
          </p>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto', padding: '4px 0' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${chartHeight + 44}`}
          style={{ width: '100%', minWidth: '320px', maxHeight: '210px', overflow: 'visible' }}
          role="img"
          aria-label="7-Day completion chart"
        >
          {/* Explicit Y-axis label (Solves Flaw #5 Counterintuitive plot labelling) */}
          <text
            x="4"
            y="12"
            fill="var(--text-muted)"
            fontSize="9"
            fontWeight="600"
            fontFamily="inherit"
          >
            ROUTINES
          </text>

          {/* Grid lines with clear scale numbers */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = chartHeight - ratio * (chartHeight - 30);
            const val = Math.round(ratio * maxTasks);
            return (
              <g key={i}>
                <line
                  x1={leftMargin}
                  y1={y}
                  x2={svgWidth - 10}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={leftMargin - 6}
                  y={y + 3.5}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="inherit"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, idx) => {
            const x = leftMargin + 8 + idx * (barWidth + gap);
            const percent = maxTasks > 0 ? d.completedCount / maxTasks : 0;
            const barHeight = Math.max(d.completedCount > 0 ? 8 : 4, percent * (chartHeight - 30));
            const y = chartHeight - barHeight;
            const isHovered = hoveredIdx === idx;
            const dayName = formatDayName(d.date);
            const is100Percent = d.totalAvailable > 0 && d.completedCount >= d.totalAvailable;

            return (
              <g
                key={d.date}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Background slot (visual target container) */}
                <rect
                  x={x}
                  y="20"
                  width={barWidth}
                  height={chartHeight - 20}
                  rx="6"
                  fill="var(--bg-surface-subtle)"
                />

                {/* Filled bar with harmonious palette (Solves Flaw #8) */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  fill={is100Percent ? 'var(--primary)' : d.completedCount > 0 ? 'var(--xp-gold)' : 'var(--border-subtle)'}
                  opacity={isHovered ? 1 : 0.9}
                  style={{
                    transition: 'all 0.25s ease',
                    filter: isHovered ? 'drop-shadow(0 2px 8px var(--primary-glow))' : 'none',
                  }}
                />

                {/* Direct Inline Score on Top of Bar (Solves Flaw #5) */}
                {d.completedCount > 0 ? (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    fill={isHovered ? 'var(--primary)' : 'var(--text-primary)'}
                    fontSize="10.5"
                    fontWeight="800"
                    textAnchor="middle"
                    fontFamily="inherit"
                  >
                    {d.completedCount}/{d.totalAvailable}
                  </text>
                ) : (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - 6}
                    fill="var(--text-muted)"
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="inherit"
                  >
                    0
                  </text>
                )}

                {/* Day label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  fill={isHovered ? 'var(--primary)' : 'var(--text-secondary)'}
                  fontSize="12"
                  fontWeight={isHovered ? '800' : '600'}
                  textAnchor="middle"
                  fontFamily="inherit"
                >
                  {dayName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip info with clear non-redundant context */}
      {hoveredIdx !== null && (
        <div
          style={{
            marginTop: '10px',
            padding: '8px 12px',
            background: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            📅 {data[hoveredIdx].date} ({formatDayName(data[hoveredIdx].date)})
          </span>
          <span>
            <strong>{data[hoveredIdx].completedCount}</strong> of <strong>{data[hoveredIdx].totalAvailable}</strong> done ({data[hoveredIdx].totalAvailable > 0 ? Math.round((data[hoveredIdx].completedCount / data[hoveredIdx].totalAvailable) * 100) : 0}%) •{' '}
            <span style={{ color: 'var(--xp-gold)', fontWeight: 700 }}>
              +{data[hoveredIdx].xpEarned} XP
            </span>
          </span>
        </div>
      )}
    </div>
  );
};
