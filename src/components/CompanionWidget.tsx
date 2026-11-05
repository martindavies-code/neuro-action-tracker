import {ui} from '../services/uiCopy';
import {CompanionArt} from './CompanionArt';
import React, { useState } from 'react';
import type { CompanionChoice, SupportedLanguage, UserStats } from '../types';
import { speechService } from '../services/speechService';
import { IconRenderer } from './IconRenderer';


interface CompanionWidgetProps {
  stats: UserStats;
  completedTodayCount: number;
  companionChoice?: CompanionChoice;
  language?: SupportedLanguage;
}

const ENCOURAGING_QUIPS = [
 'A small start is enough.',
 'You can pause and come back.',
 'One action at a time.',
 'Your pace can change today.',
 'You do not need to finish everything.',
 'You get to choose what feels useful.',
 'Your history is a record, not a score you owe anyone.',
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
    const reduced=document.documentElement.getAttribute('data-reduced-motion')==='true'||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsWaving(!reduced);
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
      ui(ENCOURAGING_QUIPS[quipIdx],language),
      language,
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
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
          title={ui('New thought',language)}
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
          <CompanionArt choice={companionChoice} level={stats.level} language={language}/>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              {companionChoice[0].toUpperCase()+companionChoice.slice(1)}
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
              {ui('Growth stage',language)} {stats.level>=5?3:stats.level>=3?2:1}
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
              {ui(ENCOURAGING_QUIPS[quipIdx],language)}
            </p>
            <button
              type="button"
              onClick={handleSpeakThought}
              title={ui('Read aloud',language)}
              style={{
                fontSize: '0.75rem',
                opacity: isSpeaking ? 1 : 0.6,
                color: isSpeaking ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px 4px',
              }}
              aria-label={ui('Read aloud',language)}
            ><IconRenderer name="Volume2" size={15}/>
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {ui('Completed today',language)}: {completedTodayCount}
        </span>
        <button
          className="btn-secondary"
          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
          onClick={cycleQuip}
          title={ui('New thought',language)}
        >
          <IconRenderer name="Smile" size={13} />
          <span>{ui('New thought',language)}</span>
        </button>
      </div>
    </div>
  );
};
