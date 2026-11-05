import {ui} from '../services/uiCopy';
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
          <div className="brand-logo-badge" title="RhythmQuest">
            <IconRenderer name="Sparkles" size={18} />
          </div>
          <div className="brand-text-container">
            <h1 className="brand-title">RhythmQuest</h1>
            <p className="brand-subtitle">{t('brand_subtitle')}</p>
          </div>
        </div>

        {/* Sensory Controls & Save Progress */}
        <div className="header-controls" role="toolbar" aria-label={t('tab_settings')}>
          <button
            className="btn-icon"
            onClick={toggleSound}
            title={ui('Sound on/off',settings.language)}
            aria-label={ui('Sound on/off',settings.language)}
          >
            <IconRenderer name={settings.soundEnabled ? 'Volume2' : 'VolumeX'} size={16} />
          </button>

          <button
            className="btn-icon"
            onClick={cycleTheme}
            title={ui('Theme',settings.language)}
            aria-label={ui('Theme',settings.language)}
          >
            <IconRenderer name="Palette" size={16} />
          </button>

          <button
            className="btn-icon"
            onClick={onOpenOnboarding}
            title={ui('Replay tutorial',settings.language)}
            aria-label={ui('Replay tutorial',settings.language)}
          >
            <IconRenderer name="HelpCircle" size={16} />
          </button>

          <button
            className="save-progress-btn"
            onClick={onOpenSettings}
            id="header-save-progress-btn"
            title={ui('Stored on this device',settings.language)}
            aria-label={t('tab_settings')}
          >
            <span className="save-dot active" aria-hidden="true" />
            <span className="save-text">{t('sync_offline')}</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Game Status Pills */}
      <div className="header-status-row" role="region" aria-label={ui('Optional rewards',settings.language)}>
        <div
          className="level-badge-compact reward-xp"
          onClick={onOpenXpRoadmap}
          style={{ cursor: 'pointer' }}
          title={ui('Level',settings.language)+' '+stats.level}
          id="header-level-badge"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenXpRoadmap();
            }
          }}
          aria-label={ui('Level',settings.language)+' '+stats.level}
        >
          <IconRenderer name="Award" size={14} />
          <span>{t('level_badge')} {stats.level}</span>
        </div>

        <div className="status-pill-group">
          <div
            className="status-pill xp-pill"
            onClick={onOpenXpRoadmap}
            style={{ cursor: 'pointer' }}
            title={ui('Optional rewards',settings.language)}
            id="header-xp-pill"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenXpRoadmap();
              }
            }}
            aria-label={`${stats.xp} XP`}
          >
            <IconRenderer name="Zap" size={13} />
            <span>{stats.xp} XP</span>
          </div>

          <div
            className="status-pill streak-pill"
            title={stats.currentStreak+' '+t('streak_badge')}
            aria-label={stats.currentStreak+' '+t('streak_badge')}
          >
            <IconRenderer name="Flame" size={13} />
            <span>{stats.currentStreak} {t('streak_badge')}</span>
          </div>

          {stats.streakShields > 0 && (
            <div
              className="status-pill shield-pill"
              title={stats.streakShields+' '+t('shields_badge')}
              aria-label={stats.streakShields+' '+t('shields_badge')}
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
