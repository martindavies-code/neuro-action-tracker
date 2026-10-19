// Web Speech API wrapper for Dyslexia & Auditory Learners
// Provides zero-latency, private, offline-capable text-to-speech
import { resolveActiveLanguage } from './i18nService';
import type { SupportedLanguage } from '../types';

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private _isSpeaking: boolean = false;
  private rate: number = 0.95; // Slightly slower, calm cadence
  private pitch: number = 1.0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public get isSpeaking(): boolean {
    return this._isSpeaking;
  }

  public speak(
    text: string,
    lang?: SupportedLanguage,
    onEnd?: () => void,
    onError?: () => void
  ) {
    if (!this.synth) {
      onEnd?.();
      return;
    }

    try {
      this.synth.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.lang = resolveActiveLanguage(lang);

      utterance.onstart = () => {
        this._isSpeaking = true;
      };
      utterance.onend = () => {
        this._isSpeaking = false;
        onEnd?.();
      };
      utterance.onerror = () => {
        this._isSpeaking = false;
        onError?.();
      };

      this.synth.speak(utterance);
    } catch {
      this._isSpeaking = false;
      onError?.();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this._isSpeaking = false;
    }
  }

  public setRate(newRate: number) {
    this.rate = Math.max(0.6, Math.min(1.4, newRate));
  }
}

export const speechService = new SpeechService();
