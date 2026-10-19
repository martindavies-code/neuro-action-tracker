import React, { useRef, useState, useEffect } from 'react';
import type { Priority, SensorySettings, SupportedLanguage, TaskItem } from '../types';
import { sound } from '../services/soundService';
import { speechService } from '../services/speechService';
import { IconRenderer } from './IconRenderer';
import { getTranslation } from '../services/i18nService';
import { COMPANION_DEFINITIONS } from '../services/gamificationService';

interface SettingsPanelProps {
  tasks: TaskItem[];
  settings: SensorySettings;
  onUpdateSettings: (newSettings: Partial<SensorySettings>) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateModal: () => void;
  onChangePriority: (taskId: string, newPriority: Priority) => void;
  onResetData: () => void;
  onExportJSON: () => void;
  onImportJSON: (jsonStr: string) => void;
  onReplayTutorial: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  tasks,
  settings,
  onUpdateSettings,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal,
  onChangePriority,
  onResetData,
  onExportJSON,
  onImportJSON,
  onReplayTutorial,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt: () => void; userChoice: Promise<{ outcome: string }> } | null>(null);
  const [isInstalled, setIsInstalled] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as { prompt: () => void; userChoice: Promise<{ outcome: string }> });
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleTestSound = () => {
    sound.playLevelUp();
  };

  const handleTestTTS = () => {
    speechService.speak('Welcome to RhythmQuest. Your sensory and reading settings are now active.', settings.language);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportJSON(content);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, settings.language);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 0. Language & Localization (Defaults to Device Language) */}
      <div className="dash-card" id="settings-language-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <IconRenderer name="Target" size={18} />
            <span>{t('language_label')}</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t('language_auto')}
          </span>
        </div>

        <div style={{ maxWidth: '440px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="language-selector">{t('language_label')}</label>
            <select
              id="language-selector"
              className="form-select"
              value={settings.language || 'auto'}
              onChange={(e) => onUpdateSettings({ language: e.target.value as SupportedLanguage })}
            >
              <option value="auto">{t('language_auto')}</option>
              <option value="en">🇺🇸 English (English)</option>
              <option value="es">🇪🇸 Español (Spanish)</option>
              <option value="fr">🇫🇷 Français (French)</option>
              <option value="de">🇩🇪 Deutsch (German)</option>
              <option value="ja">🇯🇵 日本語 (Japanese)</option>
              <option value="pt">🇧🇷 Português (Portuguese)</option>
              <option value="it">🇮🇹 Italiano (Italian)</option>
              <option value="zh">🇨🇳 中文 (Chinese)</option>
              <option value="ko">🇰🇷 한국어 (Korean)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1. Dyslexia & Neuro-Reading Suite */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <IconRenderer name="Eye" size={18} />
            <span>Dyslexia & Visual Reading Accommodations</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Reduces visual crowding and reading fatigue
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {/* Lexend Dyslexia Font */}
          <div className="form-group">
            <label className="form-label" htmlFor="dyslexic-font-toggle">Accessible Reading Font</label>
            <button
              id="dyslexic-font-toggle"
              type="button"
              className={`btn-secondary ${settings.dyslexicFont ? 'active' : ''}`}
              style={{
                justifyContent: 'space-between',
                background: settings.dyslexicFont ? 'var(--primary-light)' : 'var(--bg-surface)',
                borderColor: settings.dyslexicFont ? 'var(--primary)' : 'var(--border-medium)',
              }}
              onClick={() => onUpdateSettings({ dyslexicFont: !settings.dyslexicFont })}
            >
              <span>{settings.dyslexicFont ? '✓ Lexend Dyslexic Font' : 'Standard Font'}</span>
              <IconRenderer name="Eye" size={15} />
            </button>
          </div>

          {/* Bionic Reading Fixation Anchor Mode */}
          <div className="form-group">
            <label className="form-label" htmlFor="bionic-reading-toggle">Bionic Reading Fixation Mode</label>
            <button
              id="bionic-reading-toggle"
              type="button"
              className={`btn-secondary ${settings.bionicReading ? 'active' : ''}`}
              style={{
                justifyContent: 'space-between',
                background: settings.bionicReading ? 'var(--primary-light)' : 'var(--bg-surface)',
                borderColor: settings.bionicReading ? 'var(--primary)' : 'var(--border-medium)',
              }}
              onClick={() => onUpdateSettings({ bionicReading: !settings.bionicReading })}
            >
              <span>{settings.bionicReading ? '✓ Bionic Anchoring ON' : 'Standard Text'}</span>
              <IconRenderer name="Target" size={15} />
            </button>
          </div>

          {/* Text to Speech Test */}
          <div className="form-group">
            <label className="form-label">Speech & Read-Aloud (TTS)</label>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleTestTTS}
              style={{ justifyContent: 'space-between' }}
            >
              <span>🔊 Test Read-Aloud Voice</span>
              <IconRenderer name="Volume2" size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Autistic & Sensory Comfort Preferences */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <IconRenderer name="Palette" size={18} />
            <span>Autistic & Sensory Comfort Settings</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Customizable for your sensory threshold
          </span>
        </div>

        {/* Companion Mascot Selector Cards */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
            🐾 Rhythm Companion Mascot
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
            {Object.values(COMPANION_DEFINITIONS).map((comp) => {
              const isSelected = (settings.companionChoice || 'pip') === comp.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    onUpdateSettings({ companionChoice: comp.id });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{comp.defaultEmoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {comp.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {comp.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>

          {/* Theme Palette */}
          <div className="form-group">
            <label className="form-label" htmlFor="theme-selector">Color Theme Palette</label>
            <select
              id="theme-selector"
              className="form-select"
              value={settings.theme}
              onChange={(e) => onUpdateSettings({ theme: e.target.value as SensorySettings['theme'] })}
            >
              <option value="sage">🌿 Calm Sage & Forest (Soothing)</option>
              <option value="sunset">🌅 Warm Sunset & Terracotta (Cozy)</option>
              <option value="slate">🌙 Slate Dark Mode (Low Eye Strain)</option>
              <option value="high-contrast">⚪⚫ High Contrast (Maximum Clarity)</option>
            </select>
          </div>

          {/* Celebration Intensity */}
          <div className="form-group">
            <label className="form-label" htmlFor="intensity-selector">Celebration Intensity</label>
            <select
              id="intensity-selector"
              className="form-select"
              value={settings.celebrationIntensity}
              onChange={(e) => onUpdateSettings({ celebrationIntensity: e.target.value as SensorySettings['celebrationIntensity'] })}
            >
              <option value="gentle">🌱 Gentle (Minimal particles)</option>
              <option value="normal">✨ Balanced (Pleasant sparkle)</option>
              <option value="vibrant">🎉 Vibrant (Joyful bursts)</option>
            </select>
          </div>

          {/* Reduced Motion */}
          <div className="form-group">
            <label className="form-label" htmlFor="reduced-motion-toggle">Reduced Motion</label>
            <button
              id="reduced-motion-toggle"
              type="button"
              className={`btn-secondary ${settings.reducedMotion ? 'active' : ''}`}
              style={{
                justifyContent: 'space-between',
                background: settings.reducedMotion ? 'var(--primary-light)' : 'var(--bg-surface)',
                borderColor: settings.reducedMotion ? 'var(--primary)' : 'var(--border-medium)',
              }}
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
            >
              <span>{settings.reducedMotion ? '✓ Reduced Motion Enabled' : 'Gentle Animations'}</span>
              <IconRenderer name="Activity" size={15} />
            </button>
          </div>

          {/* Sound Volume & Toggle */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" htmlFor="sound-volume-slider" style={{ marginBottom: 0 }}>
                Acoustic Chimes & Feedback
              </label>
              <button
                type="button"
                onClick={handleTestSound}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}
              >
                Test Sound ♫
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn-icon"
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                title="Toggle Sound"
              >
                <IconRenderer name={settings.soundEnabled ? 'Volume2' : 'VolumeX'} size={16} />
              </button>
              <input
                id="sound-volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                disabled={!settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                style={{ flex: 1, accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '32px' }}>
                {Math.round(settings.soundVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Routine Task & Priority Manager */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <IconRenderer name="Sliders" size={18} />
            <span>Routine Task & Priority Manager</span>
          </h3>
          <button className="btn-primary" onClick={onOpenCreateModal} id="settings-add-task-btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            <IconRenderer name="Plus" size={15} />
            <span>Create Task</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.filter((t) => !t.archived).map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <IconRenderer name={task.iconName || 'CheckCircle2'} size={16} />
                </div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block' }}>
                    {task.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {task.category.toUpperCase()} • {task.estimatedMinutes}m • +{task.xpValue} XP
                  </span>
                </div>
              </div>

              {/* Priority Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor={`priority-select-${task.id}`} style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Priority:
                </label>
                <select
                  id={`priority-select-${task.id}`}
                  className="form-select"
                  value={task.priority}
                  onChange={(e) => onChangePriority(task.id, e.target.value as Priority)}
                  style={{ padding: '3px 8px', fontSize: '0.8rem', minHeight: '30px' }}
                >
                  <option value="high">🔥 High</option>
                  <option value="medium">⚡ Medium</option>
                  <option value="low">🌿 Gentle</option>
                </select>

                <button
                  className="btn-icon"
                  onClick={() => onEditTask(task)}
                  title="Edit task details"
                  style={{ width: '30px', height: '30px', minWidth: '30px', minHeight: '30px' }}
                >
                  <IconRenderer name="Edit2" size={13} />
                </button>

                <button
                  className="btn-icon"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
                      onDeleteTask(task.id);
                    }
                  }}
                  title="Delete task"
                  style={{ color: 'var(--accent-fire)', width: '30px', height: '30px', minWidth: '30px', minHeight: '30px' }}
                  id={`settings-delete-task-${task.id}`}
                >
                  <IconRenderer name="Trash2" size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Data Management & Interactive Tutorial */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <IconRenderer name="RefreshCw" size={18} />
            <span>Data, Backups & Tutorial</span>
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={onExportJSON} id="export-backup-btn" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
            <IconRenderer name="Download" size={14} />
            <span>Export Backup JSON</span>
          </button>

          <button
            className="btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            id="import-backup-btn"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          >
            <IconRenderer name="Upload" size={14} />
            <span>Import Backup JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <button className="btn-secondary" onClick={onReplayTutorial} id="replay-tour-btn" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
            <IconRenderer name="HelpCircle" size={14} />
            <span>Replay Guided Tutorial</span>
          </button>
        </div>
      </div>

      {/* 4. Progressive Web App (PWA) Mobile Installation */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <IconRenderer name="Sparkles" size={18} />
            <span>📱 Mobile App & Offline Installation</span>
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
          Install RhythmQuest directly onto your iPhone, Android, or PC home screen. Opens in full screen and works 100% offline!
        </p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {deferredPrompt ? (
            <button className="btn-primary" onClick={handleInstallClick} id="install-pwa-btn">
              <span>📱 Install App to Home Screen</span>
            </button>
          ) : isInstalled ? (
            <div style={{ background: 'var(--success-light)', color: 'var(--primary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 700 }}>
              ✓ App is installed on this device
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-surface-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              💡 <strong>On iPhone / iPad:</strong> Tap the Safari Share button (<strong>↑</strong>) and select <strong>"Add to Home Screen"</strong>. On Android / Chrome, click Install in your browser menu.
            </div>
          )}
        </div>
      </div>

      {/* 5. Danger Zone: Delete All Data & Reset Account */}
      <div className="dash-card" style={{ borderColor: 'rgba(217, 72, 59, 0.35)', background: 'var(--bg-surface)' }}>
        <div className="dash-card-header">
          <h3 className="dash-card-title" style={{ color: 'var(--accent-fire)' }}>
            <IconRenderer name="Trash2" size={18} />
            <span>{t('danger_zone_title')}</span>
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
          {t('danger_zone_desc')}
        </p>
        <div>
          <button
            type="button"
            className="btn-primary"
            onClick={onResetData}
            id="delete-all-data-btn"
            style={{
              background: 'var(--accent-fire)',
              borderColor: 'var(--accent-fire)',
              color: '#ffffff',
              padding: '8px 18px',
              fontSize: '0.85rem',
              fontWeight: 800,
            }}
          >
            <IconRenderer name="Trash2" size={15} />
            <span>{t('reset_account_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
