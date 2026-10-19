// Procedural Web Audio Ambient Soundscapes
// Generates ADHD-calming Brown Noise, Gentle Rain, Ocean Waves, and Forest Wind in real time

export type SoundscapeType = 'none' | 'brown-noise' | 'rain' | 'ocean' | 'forest';

export type AmbientAudioListener = (soundscape: SoundscapeType, volume: number) => void;

class AmbientAudioService {
  private ctx: AudioContext | null = null;
  private activeSoundscape: SoundscapeType = 'none';
  private masterGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private cleanupTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private volume: number = 0.35;
  private listeners: Set<AmbientAudioListener> = new Set();

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public subscribe(listener: AmbientAudioListener): () => void {
    this.listeners.add(listener);
    try {
      listener(this.activeSoundscape, this.volume);
    } catch {
      // Safe fallback
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.activeSoundscape, this.volume);
      } catch {
        // Safe fallback
      }
    });
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Number.isFinite(vol) ? Math.max(0, Math.min(1, vol)) : 0.35;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      const target = Math.max(0.0001, this.volume * 0.25);
      try {
        const currentGain = Math.max(0.0001, this.masterGain.gain.value);
        this.masterGain.gain.setValueAtTime(currentGain, now);
        this.masterGain.gain.linearRampToValueAtTime(target, now + 0.15);
      } catch {
        this.masterGain.gain.setValueAtTime(target, now);
      }
    }
    this.notify();
  }

  public getActiveSoundscape(): SoundscapeType {
    return this.activeSoundscape;
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.cleanupTimeoutId) {
      clearTimeout(this.cleanupTimeoutId);
      this.cleanupTimeoutId = null;
    }

    const currentGainNode = this.masterGain;
    if (currentGainNode && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        const currentVal = Math.max(0.0001, currentGainNode.gain.value);
        currentGainNode.gain.setValueAtTime(currentVal, now);
        // Gentle 600ms acoustic fade-out to avoid sensory jarring
        currentGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      } catch {
        // Ignore
      }
    }

    const nodesToClean = [...this.activeNodes];
    this.activeNodes = [];
    this.masterGain = null;
    this.activeSoundscape = 'none';
    this.notify();

    // Clean up audio nodes after gentle fade-out completes
    this.cleanupTimeoutId = setTimeout(() => {
      nodesToClean.forEach((node) => {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch {
          // Ignore
        }
      });
      if (currentGainNode) {
        try {
          currentGainNode.disconnect();
        } catch {
          // Ignore
        }
      }
      this.cleanupTimeoutId = null;
    }, 650);
  }

  public play(type: SoundscapeType) {
    if (this.activeSoundscape === type) {
      this.stop();
      return;
    }

    this.stop();
    if (type === 'none') return;

    const ctx = this.getContext();
    if (!ctx) return;

    const master = ctx.createGain();
    const now = ctx.currentTime;
    const targetGain = Math.max(0.0001, this.volume * 0.25);
    
    // Gentle 800ms acoustic fade-in for smooth sensory transitions
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(targetGain, now + 0.8);
    master.connect(ctx.destination);
    this.masterGain = master;

    this.activeSoundscape = type;
    this.notify();

    if (type === 'brown-noise') {
      this.playBrownNoise(ctx, master);
    } else if (type === 'rain') {
      this.playRain(ctx, master);
    } else if (type === 'ocean') {
      this.playOcean(ctx, master);
    } else if (type === 'forest') {
      this.playForest(ctx, master);
    }
  }

  // Brown Noise Generator (ADHD Calming Frequency)
  private playBrownNoise(ctx: AudioContext, destination: GainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter);
  }

  // Gentle Rain generator
  private playRain(ctx: AudioContext, destination: GainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.Q.setValueAtTime(0.7, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter);
  }

  // Ocean Waves with modulated filter
  private playOcean(ctx: AudioContext, destination: GainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.0;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(250, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    source.connect(filter);
    filter.connect(destination);

    source.start();
    lfo.start();

    this.activeNodes.push(source, filter, lfo, lfoGain);
  }

  // Forest Wind & Chimes
  private playForest(ctx: AudioContext, destination: GainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.015 * white) / 1.015;
      lastOut = output[i];
      output[i] *= 2.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(550, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);
    source.start();

    this.activeNodes.push(source, filter);
  }
}

export const ambientAudio = new AmbientAudioService();
