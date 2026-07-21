import { describe, it, expect } from 'vitest';
import { createIgor, moodFor } from './igor';
import type { IgorLines } from '../contracts';

const lines = {
  run_start: ['старт'],
  correct: ['верно A', 'верно B'],
  wrong: ['мимо'],
  streak3: ['серия'],
  fast_answer: ['быстро'],
  timeout: ['время'],
  duel_win: ['победа'],
  duel_loss: ['слив'],
  duel_draw: ['ничья'],
} as IgorLines;

describe('createIgor', () => {
  it('возвращает реплику для события', () => {
    expect(createIgor(lines).say('wrong')).toBe('мимо');
  });

  it('не повторяет реплику подряд, если есть альтернатива', () => {
    const igor = createIgor(lines);
    const first = igor.say('correct');
    expect(igor.say('correct')).not.toBe(first);
  });

  it('на пустом наборе реплик не падает', () => {
    const igor = createIgor({ ...lines, correct: [] } as IgorLines);
    expect(igor.say('correct')).toBe('');
  });
});

describe('moodFor', () => {
  it('сопоставляет событию настроение', () => {
    expect(moodFor('correct')).toBe('happy');
    expect(moodFor('wrong')).toBe('disappointed');
    expect(moodFor('duel_win')).toBe('smug');
    expect(moodFor('run_start')).toBe('neutral');
  });
});
