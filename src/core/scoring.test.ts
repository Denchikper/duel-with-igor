import { describe, it, expect } from 'vitest';
import { summarize, compareRuns } from './scoring';
import type { Answer, Run } from '../contracts';

const a = (correct: boolean, time_ms: number): Answer => ({
  question_id: 'q',
  chosen_index: correct ? 0 : 1,
  correct,
  time_ms,
});

const run = (score: number, total_time_ms: number): Run => ({
  id: 'r',
  duel_id: 'd',
  tg_user_id: 1,
  display_name: 'X',
  photo_url: null,
  score,
  total_time_ms,
  answers: [],
  created_at: '',
});

describe('summarize', () => {
  it('считает верные ответы и суммарное время', () => {
    expect(summarize([a(true, 1000), a(false, 2000), a(true, 500)])).toEqual({
      score: 2,
      total_time_ms: 3500,
    });
  });

  it('на пустом наборе даёт нули', () => {
    expect(summarize([])).toEqual({ score: 0, total_time_ms: 0 });
  });
});

describe('compareRuns', () => {
  it('выигрывает тот, у кого больше счёт', () => {
    expect(compareRuns(run(5, 60000), run(4, 10000))).toBe('win');
  });

  it('при равном счёте выигрывает тот, кто быстрее', () => {
    expect(compareRuns(run(5, 30000), run(5, 40000))).toBe('win');
    expect(compareRuns(run(5, 50000), run(5, 40000))).toBe('loss');
  });

  it('полное совпадение — ничья', () => {
    expect(compareRuns(run(5, 30000), run(5, 30000))).toBe('draw');
  });
});
