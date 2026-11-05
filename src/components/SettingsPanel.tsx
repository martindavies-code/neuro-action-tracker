import {CompanionArt} from './CompanionArt';
import {ui} from '../services/uiCopy';
import {previewBackup,restoreSafetyBackup} from '../services/storageService';
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
    speechService.speak(ui('A small start is enough',settings.language), settings.language);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        try{const info=previewBackup(content);if(window.confirm(ui('Import replaces current data. A recovery copy is saved first.',settings.language)+' ('+info.tasks+')'))onImportJSON(content);}catch{window.alert(ui('Invalid backup. Nothing was changed.',settings.language));}
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
      <section className="dash-card"><h2>{ui('Make this space yours',settings.language)}</h2><p>{ui('Every option is a preference, not a prescription.',settings.language)}</p><div className="profile-options">{(['quiet','playful','custom'] as const).map(profile=><button className="btn-secondary" key={profile} aria-pressed={settings.profile===profile} onClick={()=>onUpdateSettings(profile==='custom'?{profile}:{profile,showXp:profile==='playful',showStreaks:profile==='playful',showQuotes:profile==='playful',showCompanion:profile==='playful',showCelebrations:profile==='playful',soundEnabled:profile==='playful',reducedMotion:profile==='quiet'})}>{ui(profile[0].toUpperCase()+profile.slice(1),settings.language)}</button>)}</div><div className="preference-grid">{([['showXp','XP and levels'],['showStreaks','Streaks and shields'],['showQuotes','Companion quotes'],['showCompanion','Companion'],['showCelebrations','Celebrations'],['compactView','Compact task cards'],['readingRuler','Reading guide']] as const).map(([key,label])=><label key={key}><input type="checkbox" checked={Boolean(settings[key])} onChange={e=>onUpdateSettings({[key]:e.target.checked,profile:'custom'})}/>{ui(label,settings.language)}</label>)}</div></section>
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
              <option value="en"> English (English)</option>
              <option value="es"> Español (Spanish)</option>
              <option value="fr"> Français (French)</option>
              <option value="de"> Deutsch (German)</option>
              <option value="ja"> 日本語 (Japanese)</option>
              <option value="pt"> Português (Portuguese)</option>
              <option value="it"> Italiano (Italian)</option>
              <option value="zh"> 中文 (Chinese)</option>
              <option value="ko"> 한국어 (Korean)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1. Dyslexia & Neuro-Reading Suite */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <IconRenderer name="Eye" size={18} />
            <span>{ui('Reading font',settings.language)}</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {ui('Every option is a preference, not a prescription.',settings.language)}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {/* Lexend Dyslexia Font */}
          <div className="form-group">
            <label className="form-label" htmlFor="dyslexic-font-toggle">{t('dyslexic_font_label')}</label>
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
              <span>{settings.dyslexicFont ? 'Lexend' : ui('Standard',settings.language)}</span>
              <IconRenderer name="Eye" size={15} />
            </button>
          </div>

          {/* Bionic Reading Fixation Anchor Mode */}
          <div className="form-group">
            <label className="form-label" htmlFor="bionic-reading-toggle">{t('bionic_reading_label')}</label>
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
              <span>{settings.bionicReading ? ui('Bold word starts',settings.language) : ui('Standard',settings.language)}</span>
              <IconRenderer name="Target" size={15} />
            </button>
          </div>

          {/* Text to Speech Test */}
          <div className="form-group">
            <label className="form-label">{ui('Read aloud',settings.language)}</label>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleTestTTS}
              style={{ justifyContent: 'space-between' }}
            >
              <span> {ui('Read aloud',settings.language)}</span>
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
            <span>{ui('Make it yours',settings.language)}</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {ui('Every option is a preference, not a prescription.',settings.language)}
          </span>
        </div>

        {/* Companion Mascot Selector Cards */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
             {ui('Companion',settings.language)}
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
                  <CompanionArt choice={comp.id} level={1} language={settings.language} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {comp.id[0].toUpperCase()+comp.id.slice(1)}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {ui('Companion stages',settings.language)}: 1, 3, 5
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
            <label className="form-label" htmlFor="theme-selector">{t('theme_label')}</label>
            <select
              id="theme-selector"
              className="form-select"
              value={settings.theme}
              onChange={(e) => onUpdateSettings({ theme: e.target.value as SensorySettings['theme'] })}
            >
              <option value="sage">{ui('Calm sage',settings.language)}</option>
              <option value="sunset">{ui('Warm sunset',settings.language)}</option>
              <option value="slate">{ui('Dark slate',settings.language)}</option>
              <option value="high-contrast">{ui('High contrast',settings.language)}</option>
            </select>
          </div>

          {/* Celebration Intensity */}
          <div className="form-group">
            <label className="form-label" htmlFor="intensity-selector">{ui('Celebrations',settings.language)}</label>
            <select
              id="intensity-selector"
              className="form-select"
              value={settings.celebrationIntensity}
              onChange={(e) => onUpdateSettings({ celebrationIntensity: e.target.value as SensorySettings['celebrationIntensity'] })}
            >
              <option value="gentle">{ui('Gentle',settings.language)}</option>
              <option value="normal">{ui('Balanced',settings.language)}</option>
              <option value="vibrant">{ui('Vibrant',settings.language)}</option>
            </select>
          </div>

          {/* Reduced Motion */}
          <div className="form-group">
            <label className="form-label" htmlFor="reduced-motion-toggle">{ui('Reduced motion',settings.language)}</label>
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
              <span>{ui('Reduced motion',settings.language)+(settings.reducedMotion?' ✓':'')}</span>
              <IconRenderer name="Activity" size={15} />
            </button>
          </div>

          {/* Sound Volume & Toggle */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" htmlFor="sound-volume-slider" style={{ marginBottom: 0 }}>
                {ui('Sound effects',settings.language)}
              </label>
              <button
                type="button"
                onClick={handleTestSound}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}
              >{ui('Test sound',settings.language)}</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn-icon"
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                title={ui('Sound on/off',settings.language)}
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
            <span>{t('tab_today')}</span>
          </h3>
          <button className="btn-primary" onClick={onOpenCreateModal} id="settings-add-task-btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            <IconRenderer name="Plus" size={15} />
            <span>{t('create_task_action')}</span>
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
                    {task.category==='anytime'?ui('Anytime',settings.language):t(('filter_'+task.category) as 'filter_morning')} • {task.estimatedMinutes}m <span className="reward-xp">• +{task.xpValue} XP</span>
                  </span>
                </div>
              </div>

              {/* Priority Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor={`priority-select-${task.id}`} style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t('priority_label')}:
                </label>
                <select
                  id={`priority-select-${task.id}`}
                  className="form-select"
                  value={task.priority}
                  onChange={(e) => onChangePriority(task.id, e.target.value as Priority)}
                  style={{ padding: '3px 8px', fontSize: '0.8rem', minHeight: '30px' }}
                >
                  <option value="high">{t('priority_high')}</option>
                  <option value="medium">{t('priority_medium')}</option>
                  <option value="low">{t('priority_low')}</option>
                </select>

                <button
                  className="btn-icon"
                  onClick={() => onEditTask(task)}
                  title={ui('Task details',settings.language)}
                  style={{ width: '30px', height: '30px', minWidth: '30px', minHeight: '30px' }}
                >
                  <IconRenderer name="Edit2" size={13} />
                </button>

                <button
                  className="btn-icon"
                  onClick={() => {
                    if (window.confirm(t('confirm_delete_task')+' '+task.title)) {
                      onDeleteTask(task.id);
                    }
                  }}
                  title={t('delete_task')}
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
            <span>{ui('Export backup',settings.language)}</span>
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={onExportJSON} id="export-backup-btn" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
            <IconRenderer name="Download" size={14} />
            <span>{ui('Export backup',settings.language)}</span>
          </button>

          <button
            className="btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            id="import-backup-btn"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          >
            <IconRenderer name="Upload" size={14} />
            <span>{ui('Import backup',settings.language)}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <button className="btn-secondary" onClick={()=>{if(window.confirm(ui('Restore recovery copy?',settings.language))){if(restoreSafetyBackup())window.location.reload();else window.alert(ui('No valid recovery copy is available.',settings.language))}}}>{ui('Restore recovery copy',settings.language)}</button>
          <button className="btn-secondary" onClick={onReplayTutorial} id="replay-tour-btn" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
            <IconRenderer name="HelpCircle" size={14} />
            <span>{ui('Replay tutorial',settings.language)}</span>
          </button>
        </div>
      </div>

      {/* 4. Progressive Web App (PWA) Mobile Installation */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <IconRenderer name="Sparkles" size={18} />
            <span> {ui('Install app',settings.language)}</span>
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
          {ui('After one complete online visit, core tasks work offline.',settings.language)} {ui('Read-aloud depends on voices installed on your device.',settings.language)}</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {deferredPrompt ? (
            <button className="btn-primary" onClick={handleInstallClick} id="install-pwa-btn">
              <span> {ui('Install app',settings.language)}</span>
            </button>
          ) : isInstalled ? (
            <div style={{ background: 'var(--success-light)', color: 'var(--primary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 700 }}>
               {ui('Saved',settings.language)}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-surface-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
               {ui('Use your browser menu to add this app to your home screen.',settings.language)}
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
