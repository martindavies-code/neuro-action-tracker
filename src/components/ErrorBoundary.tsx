import { Component, type ErrorInfo, type ReactNode } from 'react';
import { IconRenderer } from './IconRenderer';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RhythmQuest Uncaught Exception:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Keep user tasks, stats, badges and settings safe while resetting corrupted transient DOM/worker cache
        const tasks = window.localStorage.getItem('nat_tasks_v2');
        const stats = window.localStorage.getItem('nat_user_stats_v2');
        const badges = window.localStorage.getItem('nat_badges_v1');
        const settings = window.localStorage.getItem('nat_sensory_settings_v1');
        window.localStorage.clear();
        if (tasks) window.localStorage.setItem('nat_tasks_v2', tasks);
        if (stats) window.localStorage.setItem('nat_user_stats_v2', stats);
        if (badges) window.localStorage.setItem('nat_badges_v1', badges);
        if (settings) window.localStorage.setItem('nat_sensory_settings_v1', settings);
      }
    } finally {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-app, #0f172a)',
            color: 'var(--text-primary, #f8fafc)',
            padding: '24px',
            fontFamily: 'Outfit, system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: 'var(--bg-surface, #1e293b)',
              padding: '32px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(230, 140, 25, 0.15)',
                color: '#e68c19',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <IconRenderer name="Sparkles" size={32} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              Gentle Pause & Breath 🌱
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5, marginBottom: '20px' }}>
              RhythmQuest encountered a temporary visual hiccup. Don't worry — your routine tasks, XP, and streak shields are safe in your local storage.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  background: 'var(--primary, #2d7a58)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Reload RhythmQuest
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary, #94a3b8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Clear Temp Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
