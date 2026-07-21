import type { IgorEvent, IgorLines, IgorMood } from '../contracts';

const MOODS: Record<IgorEvent, IgorMood> = {
  run_start: 'neutral',
  correct: 'happy',
  wrong: 'disappointed',
  streak3: 'happy',
  fast_answer: 'happy',
  timeout: 'disappointed',
  duel_win: 'smug',
  duel_loss: 'disappointed',
  duel_draw: 'neutral',
};

export function moodFor(event: IgorEvent): IgorMood {
  return MOODS[event] ?? 'neutral';
}

export function createIgor(lines: IgorLines) {
  const last: Partial<Record<IgorEvent, string>> = {};

  return {
    say(event: IgorEvent): string {
      const pool = lines[event] ?? [];
      if (pool.length === 0) return '';
      const choices = pool.length > 1 ? pool.filter((x) => x !== last[event]) : pool;
      const picked = choices[Math.floor(Math.random() * choices.length)];
      last[event] = picked;
      return picked;
    },
  };
}
