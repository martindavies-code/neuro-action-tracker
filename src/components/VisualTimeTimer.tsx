import React from 'react';
import type { SupportedLanguage } from '../types';
import { getTranslation } from '../services/i18nService';

interface VisualTimeTimerProps {
  timeLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  language?: SupportedLanguage;
  onTogglePlay: () => void;
  onReset: () => void;
  onSetPresetMinutes: (mins: number) => void;
}

export const VisualTimeTimer: React.FC<VisualTimeTimerProps> = ({
  timeLeft,
  totalSeconds,
  isRunning,
  language = 'auto',
  onTogglePlay,
  onReset,
  onSetPresetMinutes,
}) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, language);
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalSeconds > 0 ? Math.max(0, Math.min(1, timeLeft / totalSeconds)) : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* SVG Time Disc */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--bg-surface-subtle)"
            strokeWidth={strokeWidth}
          />
          {/* Active shrinking arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={progressRatio > 0.3 ? 'var(--primary)' : 'var(--accent-fire)'}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
          />
        </svg>

        {/* Center Time Display */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
          }}
        >
          <span
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {minutes}:{seconds < 10 ? '0' : ''}{seconds}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            {isRunning ? t('focus_flowing') : t('focus_paused')}
          </span>
        </div>
      </div>

      {/* Preset Minutes Chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[2, 5, 10, 15, 25].map((m) => (
          <button
            key={m}
            type="button"
            className="filter-pill"
            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            onClick={() => onSetPresetMinutes(m)}
          >
            {m}m
          </button>
        ))}
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="button"
          className="btn-primary"
          style={{ padding: '8px 20px', fontSize: '0.9rem' }}
          onClick={onTogglePlay}
        >
          {isRunning ? t('pause_focus') : t('start_focus')}
        </button>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          onClick={onReset}
        >
          {t('reset_timer')}
        </button>
      </div>
    </div>
  );
};
