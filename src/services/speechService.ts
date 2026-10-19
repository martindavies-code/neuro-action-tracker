// Web Speech API wrapper for Dyslexia & Auditory Learners
// Provides zero-latency, private, offline-capable text-to-speech
import { resolveActiveLanguage } from './i18nService';
import type { SupportedLanguage } from '../types';

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private _isSpeaking: boolean = false;
  private rate: number = 0.95; // Slightly slower, calm cadence
  private pitch: number = 1.0;
  private watchdogTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public get isSpeaking(): boolean {
    return this._isSpeaking;
  }

  private clearWatchdog() {
    if (this.watchdogTimeout) {
      clearTimeout(this.watchdogTimeout);
      this.watchdogTimeout = null;
    }
  }

  public speak(
    text: string,
    lang?: SupportedLanguage,
    onEnd?: () => void,
    onError?: () => void
  ) {
    if (!this.synth || typeof text !== 'string' || !text.trim()) {
      onEnd?.();
      return;
    }

    try {
      this.stop(); // Stop any ongoing speech and clear existing watchdog
      const trimmedText = text.trim();
      const utterance = new SpeechSynthesisUtterance(trimmedText);
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.lang = resolveActiveLanguage(lang);

      const cleanup = () => {
        this.clearWatchdog();
        this._isSpeaking = false;
      };

      utterance.onstart = () => {
        this._isSpeaking = true;
      };
      utterance.onend = () => {
        cleanup();
        onEnd?.();
      };
      utterance.onerror = () => {
        cleanup();
        onError?.();
      };

      // Watchdog timeout to prevent speech synthesis stalls on mobile/backgrounded tabs
      const timeoutMs = Math.max(3000, Math.min(20000, (trimmedText.length / 5) * 1000));
      this.watchdogTimeout = setTimeout(() => {
        if (this._isSpeaking) {
          this.stop();
          onEnd?.();
        }
      }, timeoutMs);

      this.synth.speak(utterance);
    } catch {
      this.clearWatchdog();
      this._isSpeaking = false;
      onError?.();
    }
  }

  public stop() {
    this.clearWatchdog();
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Ignore
      }
    }
    this._isSpeaking = false;
  }

  public setRate(newRate: number) {
    this.rate = typeof newRate === 'number' && Number.isFinite(newRate) ? Math.max(0.6, Math.min(1.4, newRate)) : 0.95;
  }
}

export const speechService = new SpeechService();
