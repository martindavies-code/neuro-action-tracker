import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CompanionChoice, UserStats } from '../types';
import { LEVEL_THRESHOLDS, getCompanionStage, COMPANION_DEFINITIONS } from '../services/gamificationService';
import { IconRenderer } from './IconRenderer';

interface XpRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  companionChoice?: CompanionChoice;
  onSelectCompanion?: (choice: CompanionChoice) => void;
}

export const XpRoadmapModal: React.FC<XpRoadmapModalProps> = ({
  isOpen,
  onClose,
  stats,
  companionChoice = 'pip',
  onSelectCompanion,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currentLevelInfo = LEVEL_THRESHOLDS.find((t) => t.level === stats.level) || LEVEL_THRESHOLDS[0];
  const nextLevelInfo = LEVEL_THRESHOLDS.find((t) => t.level === stats.level + 1);

  const xpToNext = nextLevelInfo ? Math.max(0, nextLevelInfo.minXp - stats.xp) : 0;
  const currentProgressPercent = nextLevelInfo
    ? Math.min(100, Math.round(((stats.xp - currentLevelInfo.minXp) / (nextLevelInfo.minXp - currentLevelInfo.minXp)) * 100))
    : 100;

  const currentCompanion = getCompanionStage(companionChoice, stats.level);
  const getCompanionName = () => currentCompanion.name;
  const getCompanionStageForLevel = (lvl: number) => getCompanionStage(companionChoice, lvl).formattedStage;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          onClick={onClose}
          id="xp-roadmap-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconRenderer name="Zap" size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                What is XP & How Does It Work?
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Your Neurodivergent Dopamine & Progression Guide
              </span>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose} aria-label="Close XP guide">
            ✕
          </button>
        </div>

        {/* 1. Core Purpose: The Dopamine Bridge */}
        <div
          style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '16px',
          }}
        >
          <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px' }}>
            🧠 Why Build Up XP? (The Dopamine Bridge)
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            In ADHD and neurodiverse brains, routine everyday maintenance (drinking water, hygiene, taking meds) does not release natural dopamine.
            <strong> XP (Experience Points)</strong> gives your brain immediate, tangible visual reward for your mental effort.
          </p>
        </div>

        {/* 2. What XP Unlocks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>🏆</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>Rank Titles</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Progress from Level 1 Explorer to Level 7 Grandmaster.
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>🐾</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>Companion Evolution</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {getCompanionName()} grows and evolves at Levels 3 & 5!
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>🛡️</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>Milestone Badges</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Unlock rare achievement trophies & streak milestone shields.
            </div>
          </div>
        </div>

        {/* 2.5. Interactive Companion Mascot Switcher */}
        <div
          style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              🐾 Selected Focus Companion Mascot:
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>
              Active: {getCompanionName()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {Object.values(COMPANION_DEFINITIONS).map((c) => {
              const isSelected = companionChoice === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCompanion && onSelectCompanion(c.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title={`Switch companion to ${c.name}`}
                >
                  <span style={{ fontSize: '1.2rem' }}>{c.defaultEmoji}</span>
                  <span>{c.species}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Current Level Status & Progress Bar */}
        <div
          style={{
            background: 'var(--primary-light)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '18px',
            border: '1px solid rgba(45, 122, 88, 0.25)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)' }}>
                CURRENT RANK: Level {stats.level} • {stats.levelTitle}
              </span>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Companion Form: <strong>{getCompanionStageForLevel(stats.level)}</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--primary)' }}>
                {stats.xp} XP
              </span>
              {nextLevelInfo && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {xpToNext} XP to Level {nextLevelInfo.level}
                </div>
              )}
            </div>
          </div>

          <div className="progress-track" style={{ height: '8px', background: 'rgba(0,0,0,0.1)' }}>
            <div className="progress-fill" style={{ width: `${currentProgressPercent}%` }} />
          </div>
        </div>

        {/* 4. Complete Level Roadmap Table */}
        <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          🗺️ Full 7-Level Progression Roadmap:
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
          {LEVEL_THRESHOLDS.map((lvl) => {
            const isCurrent = lvl.level === stats.level;
            const isUnlocked = stats.xp >= lvl.minXp;
            return (
              <div
                key={lvl.level}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isCurrent
                    ? 'var(--primary-light)'
                    : isUnlocked
                    ? 'var(--bg-surface-subtle)'
                    : 'var(--bg-surface)',
                  border: isCurrent
                    ? '1.5px solid var(--primary)'
                    : '1px solid var(--border-subtle)',
                  opacity: isUnlocked ? 1 : 0.65,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      background: isUnlocked ? 'var(--primary)' : 'var(--border-medium)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    {lvl.level}
                  </span>
                  <div>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {lvl.title}
                    </span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Stage: {getCompanionStageForLevel(lvl.level)}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isCurrent ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    {lvl.minXp} XP
                  </span>
                  {isCurrent && (
                    <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ★ CURRENT
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. Anti-Cheat Fair Play Note */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', textAlign: 'center' }}>
          ⚖️ <strong>Fair Play Design:</strong> Tasks are calibrated across 5 clear tiers from <strong>5 to 25 XP</strong> based on time and effort so progression reflects genuine, healthy daily momentum.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
          <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Got It! Keep Momentum
          </button>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
