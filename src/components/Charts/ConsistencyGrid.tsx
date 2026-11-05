import {ui} from '../../services/uiCopy';
import {resolveActiveLanguage} from '../../services/i18nService';
import React, { useMemo } from 'react';
import { getDateMinusDays, getPast7DaysCompletion, taskCreatedDate } from '../../services/storageService';
import { getTranslation } from '../../services/i18nService';
import type { SupportedLanguage, TaskItem } from '../../types';

interface ConsistencyGridProps {
  tasks: TaskItem[];
  language?: SupportedLanguage;
}

export const ConsistencyGrid: React.FC<ConsistencyGridProps> = ({ tasks, language = 'auto' }) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, language);
  const activeTasks = tasks;
  const first=tasks.map(taskCreatedDate).filter(Boolean).sort()[0];
  const totalDays = 28; // 4 weeks

  const { dayBoxes, activeDaysCount, consistencyPercent, totalCompletedInMonth } = useMemo(() => {
    const boxes = [];
    let activeDays = 0;
    let totalCompleted = 0;

    for (let i = totalDays - 1; i >= 0; i--) {
      const dateStr = getDateMinusDays(i);
      if(!first || dateStr<first)continue;
      const completedCount = activeTasks.filter(
        (t) => Array.isArray(t.completedDates) && t.completedDates.includes(dateStr)
      ).length;

      if (completedCount > 0) {
        activeDays++;
        totalCompleted += completedCount;
      }

      const record=getPast7DaysCompletion(activeTasks,dateStr,1)[0];
      const ratio=record.totalAvailable?record.completedCount/record.totalAvailable:0;

      let bg = 'var(--bg-surface-subtle)';
      let border = 'var(--border-subtle)';

      if (completedCount > 0) {
        if (ratio >= 0.8) {
          bg = 'var(--primary)';
          border = 'var(--primary)';
        } else if (ratio >= 0.4) {
          bg = 'var(--primary-hover)';
          border = 'var(--primary-hover)';
        } else {
          bg = 'var(--primary-light)';
          border = 'var(--border-medium)';
        }
      }

      boxes.push({
        dateStr,
        completedCount,
        ratio,
        bg,
        border,
      });
    }

    const pct = boxes.length ? Math.round((activeDays / boxes.length) * 100) : 0;
    return {
      dayBoxes: boxes,
      activeDaysCount: activeDays,
      consistencyPercent: pct,
      totalCompletedInMonth: totalCompleted,
    };
  }, [activeTasks, totalDays,first]);

  const weekdays = Array.from({length:7},(_,i)=>new Date(2026,10,2+i).toLocaleDateString(resolveActiveLanguage(language),{weekday:'short'}));

  return (
    <div className="dash-card chart-card" id="consistency-grid-card">
      {/* Actionable Key Estimate Headline (Solves Flaw #6 & #1) */}
      <div className="dash-card-header" style={{ marginBottom: '14px' }}>
        <div>
          <h3 className="dash-card-title" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
             {ui('Last 28 days',language)}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            <strong style={{ color: 'var(--primary)', fontWeight: 700 }}>
              {ui('Active days',language)}: {activeDaysCount} / {dayBoxes.length} ({consistencyPercent}%)
            </strong>{' '}
            • {ui('Done',language)}: {totalCompletedInMonth}
          </p>
        </div>
      </div>

      {/* Weekday Column Headers (Solves Flaw #5 Plot Labelling) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          marginBottom: '6px',
          textAlign: 'center',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
        }}
      >
        {weekdays.map((day, idx) => (
          <div key={idx}>{day}</div>
        ))}
      </div>

      {/* 4-Week Grid of Activity Cells */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
        }}
      >
        {dayBoxes.length>0&&Array.from({length:(new Date(dayBoxes[0].dateStr+'T12:00:00').getDay()+6)%7},(_,i)=><div key={'empty-'+i}/>)}
        {dayBoxes.map((box) => (
          <div
            key={box.dateStr}
            title={`${box.dateStr}: ${box.completedCount} ${ui('Done',language)}`}
            style={{
              aspectRatio: '1',
              borderRadius: 'var(--radius-sm)',
              background: box.bg,
              border: `1px solid ${box.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: box.ratio >= 0.4 ? 'var(--text-inverse)' : 'var(--text-primary)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              cursor: 'pointer',
            }}
          >
            {box.completedCount > 0 ? box.completedCount : ''}
          </div>
        ))}
      </div>

      {/* Clear, Accessible Intensity Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '14px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.76rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span>{ui('Daily completion intensity',language)}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{t('less_active')}</span>
          <span
            style={{
              width: '14px',
              height: '14px',
              background: 'var(--bg-surface-subtle)',
              borderRadius: '3px',
              border: '1px solid var(--border-subtle)',
            }}
            title="0"
          />
          <span
            style={{
              width: '14px',
              height: '14px',
              background: 'var(--primary-light)',
              borderRadius: '3px',
              border: '1px solid var(--border-medium)',
            }}
            title="1–39%"
          />
          <span
            style={{
              width: '14px',
              height: '14px',
              background: 'var(--primary-hover)',
              borderRadius: '3px',
            }}
            title="40–79%"
          />
          <span
            style={{
              width: '14px',
              height: '14px',
              background: 'var(--primary)',
              borderRadius: '3px',
            }}
            title="80–100%"
          />
          <span>{t('more_active')}</span>
        </div>
      </div>
    </div>
  );
};
