import React from 'react';
import type { SensorySettings, UserStats } from '../types';
import { IconRenderer } from './IconRenderer';
import { getTranslation } from '../services/i18nService';

interface HeaderProps {
  stats: UserStats;
  settings: SensorySettings;
  onUpdateSettings: (newSettings: Partial<SensorySettings>) => void;
  onOpenOnboarding: () => void;
  onOpenXpRoadmap: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  settings,
  onUpdateSettings,
  onOpenOnboarding,
  onOpenXpRoadmap,
  onOpenSettings,
}) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, settings.language);

  const toggleSound = () => {
    onUpdateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const cycleTheme = () => {
    const themes: Array<SensorySettings['theme']> = ['sage', 'sunset', 'slate', 'high-contrast'];
    const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
    onUpdateSettings({ theme: themes[nextIdx] });
  };

  return (
    <header className="app-header" role="banner">
      {/* Top row: Brand on left, sensory controls on right */}
      <div className="header-top-row">
        <div className="brand-section">
          <div className="brand-logo-badge" title="RhythmQuest Action Tracker">
            <IconRenderer name="Sparkles" size={18} />
          </div>
          <div className="brand-text-container">
            <h1 className="brand-title">RhythmQuest</h1>
            <p className="brand-subtitle">{t('brand_subtitle')}</p>
          </div>
        </div>

        {/* Sensory Controls & Save Progress */}
        <div className="header-controls" role="toolbar" aria-label="Sensory and Quick Settings">
          <button
            className="btn-icon"
            onClick={toggleSound}
            title={settings.soundEnabled ? 'Sound effects enabled (Click to mute)' : 'Sound muted (Click to enable)'}
            aria-label={settings.soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            <IconRenderer name={settings.soundEnabled ? 'Volume2' : 'VolumeX'} size={16} />
          </button>

          <button
            className="btn-icon"
            onClick={cycleTheme}
            title={`Current Theme: ${settings.theme} (Click to switch)`}
            aria-label={`Switch Theme. Current theme: ${settings.theme}`}
          >
            <IconRenderer name="Palette" size={16} />
          </button>

          <button
            className="btn-icon"
            onClick={onOpenOnboarding}
            title="Guided Tutorial Walkthrough"
            aria-label="Open guided tutorial walkthrough"
          >
            <IconRenderer name="HelpCircle" size={16} />
          </button>

          <button
            className="save-progress-btn"
            onClick={onOpenSettings}
            id="header-save-progress-btn"
            title="Progress is automatically saved in your browser (LocalStorage). Click to manage settings & backups."
            aria-label={`${t('sync_offline')} - Manage settings and backups`}
          >
            <span className="save-dot active" aria-hidden="true" />
            <span className="save-text">{t('sync_offline')}</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Game Status Pills */}
      <div className="header-status-row" role="region" aria-label="Game Progress and Streaks">
        <div
          className="level-badge-compact"
          onClick={onOpenXpRoadmap}
          style={{ cursor: 'pointer' }}
          title={`Level ${stats.level}: ${stats.levelTitle} (Click to view Level & Companion Roadmap)`}
          id="header-level-badge"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenXpRoadmap();
            }
          }}
          aria-label={`Level ${stats.level}: ${stats.levelTitle}. Open roadmap.`}
        >
          <IconRenderer name="Award" size={14} />
          <span>{t('level_badge')} {stats.level} • {stats.levelTitle}</span>
        </div>

        <div className="status-pill-group">
          <div
            className="status-pill xp-pill"
            onClick={onOpenXpRoadmap}
            style={{ cursor: 'pointer' }}
            title="XP fuels your Rank & Companion Evolution (Click to view guide)"
            id="header-xp-pill"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenXpRoadmap();
              }
            }}
            aria-label={`${stats.xp} Experience Points`}
          >
            <IconRenderer name="Zap" size={13} />
            <span>{stats.xp} XP</span>
          </div>

          <div
            className="status-pill streak-pill"
            title={`${stats.currentStreak} day routine streak`}
            aria-label={`${stats.currentStreak} day streak`}
          >
            <IconRenderer name="Flame" size={13} />
            <span>{stats.currentStreak}d {t('streak_badge')}</span>
          </div>

          {stats.streakShields > 0 && (
            <div
              className="status-pill shield-pill"
              title={`${stats.streakShields} Streak Shields active`}
              aria-label={`${stats.streakShields} streak shields active`}
            >
              <IconRenderer name="Shield" size={13} />
              <span>{stats.streakShields} {t('shields_badge')}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
