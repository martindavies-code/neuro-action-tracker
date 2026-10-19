import React, { useState } from 'react';
import type { EnergyBattery, SupportedLanguage } from '../types';
import { sound } from '../services/soundService';
import { IconRenderer } from './IconRenderer';
import { getTranslation } from '../services/i18nService';

interface SpoonBatteryWidgetProps {
  battery: EnergyBattery;
  language?: SupportedLanguage;
  onChangeBattery: (battery: EnergyBattery) => void;
}

export const SpoonBatteryWidget: React.FC<SpoonBatteryWidgetProps> = ({
  battery,
  language = 'auto',
  onChangeBattery,
}) => {
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, language);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (b: EnergyBattery) => {
    sound.playPop();
    onChangeBattery(b);
  };

  const getStatusText = () => {
    switch (battery) {
      case 'full':
        return `🟢 ${t('energy_high_desc')}`;
      case 'moderate':
        return `🟡 ${t('energy_moderate_desc')}`;
      case 'low':
        return `🛋️ ${t('energy_low_desc')}`;
    }
  };

  return (
    <div
      style={{
        padding: '14px 18px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
      id="sensory-battery-widget"
    >
      {/* Top Header Row with Info Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            🔋 {t('energy_question')}
          </span>
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px',
              fontSize: '0.75rem',
            }}
            title="What is the Sensory Battery?"
            aria-label="Explain sensory battery"
          >
            <IconRenderer name="HelpCircle" size={14} />
          </button>
        </div>

        {/* Energy Level Selector Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleSelect('full')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: battery === 'full' ? 'var(--primary-light)' : 'var(--bg-surface-subtle)',
              color: battery === 'full' ? 'var(--primary)' : 'var(--text-secondary)',
              border: `1.5px solid ${battery === 'full' ? 'var(--primary)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            title={t('energy_high_desc')}
          >
            <span>🟢 {t('energy_high')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('moderate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: battery === 'moderate' ? 'var(--accent-sun-light)' : 'var(--bg-surface-subtle)',
              color: battery === 'moderate' ? 'var(--accent-sun)' : 'var(--text-secondary)',
              border: `1.5px solid ${battery === 'moderate' ? 'var(--accent-sun)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            title={t('energy_moderate_desc')}
          >
            <span>🟡 {t('energy_moderate')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('low')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: battery === 'low' ? 'var(--accent-fire-light)' : 'var(--bg-surface-subtle)',
              color: battery === 'low' ? 'var(--accent-fire)' : 'var(--text-secondary)',
              border: `1.5px solid ${battery === 'low' ? 'var(--accent-fire)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            title={t('energy_low_desc')}
          >
            <span>🔴 {t('energy_low')}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Status Explanation Text */}
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>{getStatusText()}</span>
      </div>

      {/* Collapsible Info Drawer */}
      {showExplanation && (
        <div
          style={{
            marginTop: '4px',
            padding: '10px 14px',
            background: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
          }}
        >
          💡 {t('spoon_theory_explanation')}
        </div>
      )}
    </div>
  );
};
