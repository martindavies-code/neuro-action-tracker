import React, { useState } from 'react';
import type { CompanionChoice, SupportedLanguage, UserStats } from '../types';
import { speechService } from '../services/speechService';
import { IconRenderer } from './IconRenderer';

import { getCompanionStage } from '../services/gamificationService';

interface CompanionWidgetProps {
  stats: UserStats;
  completedTodayCount: number;
  companionChoice?: CompanionChoice;
  language?: SupportedLanguage;
}

const ENCOURAGING_QUIPS = [
  '“5 minutes of doing something is infinite times better than zero.”',
  '“Your brain isn’t broken—it just operates on genuine interest and rhythm.”',
  '“Drink a quick sip of water. Your neurons will thank you!”',
  '“Task paralysis is just executive friction. Start with one micro-step!”',
  '“Small wins release big dopamine. Keep riding your gentle wave!”',
  '“Done is better than perfect. You are doing fantastic today.”',
  '“Streaks without guilt: you have streak shields to protect your momentum.”',
];

export const CompanionWidget: React.FC<CompanionWidgetProps> = ({
  stats,
  completedTodayCount,
  companionChoice = 'pip',
  language = 'auto',
}) => {
  const [quipIdx, setQuipIdx] = useState(0);
  const [isWaving, setIsWaving] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  React.useEffect(() => {
    return () => {
      if (isSpeaking) {
        speechService.stop();
      }
    };
  }, [isSpeaking]);

  const cycleQuip = () => {
    setIsWaving(true);
    setQuipIdx((prev) => (prev + 1) % ENCOURAGING_QUIPS.length);
    setTimeout(() => setIsWaving(false), 500);
  };

  const handleSpeakThought = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speechService.speak(
      ENCOURAGING_QUIPS[quipIdx],
      language,
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const compData = getCompanionStage(companionChoice, stats.level);
  const comp = {
    name: compData.name,
    emoji: compData.currentStage.emoji,
    stage: compData.formattedStage,
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-surface-subtle))',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 18px',
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)',
        gap: '14px',
        flexWrap: 'wrap',
      }}
      id="companion-widget"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 280px' }}>
        {/* Animated Companion Avatar */}
        <div
          onClick={cycleQuip}
          title={`Click ${comp.name} for an encouraging thought!`}
          style={{
            width: '48px',
            height: '48px',
            minWidth: '48px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px solid var(--primary)',
            boxShadow: '0 4px 12px var(--primary-glow)',
            transform: isWaving ? 'scale(1.15) rotate(12deg)' : 'scale(1)',
            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            userSelect: 'none',
          }}
        >
          <span style={{ fontSize: '1.6rem' }}>{comp.emoji}</span>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              {comp.name}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                padding: '2px 7px',
                borderRadius: '12px',
              }}
            >
              {comp.stage}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <p
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                cursor: 'pointer',
                lineHeight: 1.35,
              }}
              onClick={cycleQuip}
            >
              {ENCOURAGING_QUIPS[quipIdx]}
            </p>
            <button
              type="button"
              onClick={handleSpeakThought}
              title="Read thought aloud"
              style={{
                fontSize: '0.75rem',
                opacity: isSpeaking ? 1 : 0.6,
                color: isSpeaking ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px 4px',
              }}
              aria-label="Read companion thought aloud"
            >
              🔊
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {completedTodayCount} tasks nurtured today
        </span>
        <button
          className="btn-secondary"
          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
          onClick={cycleQuip}
          title="Inspire me with a new thought"
        >
          <IconRenderer name="Smile" size={13} />
          <span>New Thought</span>
        </button>
      </div>
    </div>
  );
};
