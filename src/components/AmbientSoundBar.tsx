import React, { useState, useEffect } from 'react';
import { ambientAudio } from '../services/ambientAudioService';
import type { SoundscapeType } from '../services/ambientAudioService';
import type { SupportedLanguage } from '../types';
import { IconRenderer } from './IconRenderer';
import { getTranslation } from '../services/i18nService';

interface AmbientSoundBarProps {
  language?: SupportedLanguage;
}

export const AmbientSoundBar: React.FC<AmbientSoundBarProps> = ({ language = 'auto' }) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, language);
  const [active, setActive] = useState<SoundscapeType>(() => ambientAudio.getActiveSoundscape());
  const [volume, setVolume] = useState<number>(() => ambientAudio.getVolume());

  useEffect(() => {
    const unsubscribe = ambientAudio.subscribe((currentActive, currentVol) => {
      setActive(currentActive);
      setVolume(currentVol);
    });
    return unsubscribe;
  }, []);

  const toggleSoundscape = (type: SoundscapeType) => {
    if (active === type) {
      ambientAudio.stop();
    } else {
      ambientAudio.play(type);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ambientAudio.setVolume(newVol);
  };

  const soundscapes: Array<{ type: SoundscapeType; label: string; icon: string }> = [
    { type: 'brown-noise', label: t('sound_brown'), icon: 'Zap' },
    { type: 'rain', label: t('sound_rain'), icon: 'Droplets' },
    { type: 'ocean', label: t('sound_ocean'), icon: 'Activity' },
    { type: 'forest', label: t('sound_forest'), icon: 'Sun' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '20px',
        gap: '12px',
        flexWrap: 'wrap',
        boxShadow: 'var(--shadow-sm)',
      }}
      id="ambient-sound-bar"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {t('ambient_soundscapes_title')}
        </span>
      </div>

      {/* Soundscape Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {soundscapes.map((s) => {
          const isSelected = active === s.type;
          return (
            <button
              key={s.type}
              onClick={() => toggleSoundscape(s.type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: isSelected ? 'var(--primary)' : 'var(--bg-surface-subtle)',
                color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                transition: 'all var(--transition-fast)',
                cursor: 'pointer',
              }}
            >
              <IconRenderer name={s.icon} size={14} />
              <span>{s.label}</span>
              {isSelected && <span style={{ fontSize: '0.7rem' }}>♫</span>}
            </button>
          );
        })}
      </div>

      {/* Volume slider */}
      {active !== 'none' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconRenderer name="Volume2" size={16} style={{ color: 'var(--primary)' }} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            style={{ width: '80px', accentColor: 'var(--primary)' }}
            title={t('sound_volume')}
          />
          <button
            className="btn-icon"
            style={{ width: '28px', height: '28px' }}
            onClick={() => toggleSoundscape(active)}
            title={t('stop_soundscape')}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
