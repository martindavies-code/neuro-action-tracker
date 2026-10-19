import confetti from 'canvas-confetti';
import type { SensorySettings } from '../types';

export function triggerCelebration(
  settings: SensorySettings,
  options?: {
    origin?: { x: number; y: number };
    e?: React.MouseEvent | MouseEvent;
    type?: 'standard' | 'massive' | 'focus';
  }
) {
  if (settings.reducedMotion) return;

  const isGentle = settings.celebrationIntensity === 'gentle';
  const isVibrant = settings.celebrationIntensity === 'vibrant';

  let count = isGentle ? 20 : isVibrant ? 80 : 45;
  let spread = isGentle ? 40 : 70;
  
  if (options?.type === 'massive') {
    count = isGentle ? 50 : isVibrant ? 200 : 120;
    spread = 100;
  } else if (options?.type === 'focus') {
    count = isGentle ? 30 : isVibrant ? 100 : 60;
    spread = 80;
  }

  let origin = options?.origin || { x: 0.5, y: 0.6 };

  if (options?.e) {
    origin = {
      x: options.e.clientX / window.innerWidth,
      y: options.e.clientY / window.innerHeight,
    };
  }

  const colors = ['#2d7a58', '#e68c19', '#2b78c5', '#755bb4', '#d9483b'];

  if (options?.type === 'massive') {
    // Fire from left and right edges for a massive celebration
    confetti({
      particleCount: count / 2,
      spread,
      angle: 60,
      origin: { x: 0, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: count / 2,
      spread,
      angle: 120,
      origin: { x: 1, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
  } else {
    confetti({
      particleCount: count,
      spread,
      origin,
      colors,
      disableForReducedMotion: true,
    });
  }
}
