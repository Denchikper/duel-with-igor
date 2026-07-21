// Короткие звуки через Web Audio API — без внешних файлов (CSP Telegram).
// Мягкие, чтобы не резать ухо на демо через проектор.

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, durMs: number, type: OscillatorType = 'sine', gain = 0.06): void {
  const ac = audio();
  if (!ac) return;
  if (ac.state === 'suspended') ac.resume().catch(() => {});
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + durMs / 1000);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + durMs / 1000);
}

export const sound = {
  correct(): void {
    tone(660, 90, 'sine');
    setTimeout(() => tone(880, 110, 'sine'), 70);
  },
  wrong(): void {
    tone(200, 180, 'sawtooth', 0.05);
  },
  streak(): void {
    tone(660, 80, 'triangle');
    setTimeout(() => tone(880, 80, 'triangle'), 60);
    setTimeout(() => tone(1175, 130, 'triangle'), 130);
  },
  win(): void {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 140, 'triangle', 0.07), i * 90));
  },
  finish(): void {
    tone(440, 120, 'sine');
    setTimeout(() => tone(330, 160, 'sine'), 100);
  },
};
