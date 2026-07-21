import { describe, it, expect } from 'vitest';
import { computeProfileStats, computeMistakes, computeAchievements } from './profile';
import type { Question, Run } from '../contracts';

const q = (id: string, topic: string): Question => ({
  id,
  topic,
  difficulty: 1,
  text: '',
  options: ['', '', '', ''],
  correct_index: 0,
  explanation: '',
  igor_comment: '',
});

const questions: Question[] = [q('q1', 'Логика'), q('q2', 'Логика'), q('q3', 'Python')];

const run = (over: Partial<Run> & { id: string; duel_id: string; tg_user_id: number }): Run => ({
  display_name: 'X',
  photo_url: null,
  score: 0,
  total_time_ms: 0,
  answers: [],
  created_at: '2026-01-01',
  ...over,
});

const ans = (question_id: string, correct: boolean, time_ms = 1000) => ({
  question_id,
  chosen_index: correct ? 0 : 1,
  correct,
  time_ms,
});

describe('computeProfileStats', () => {
  it('на отсутствии забегов возвращает нули', () => {
    const s = computeProfileStats([], questions, 1);
    expect(s.games).toBe(0);
    expect(s.avgScore).toBe(0);
    expect(s.accuracy).toBe(0);
    expect(s.topics).toEqual([]);
    expect(s.recent).toEqual([]);
  });

  it('считает игры, средний и лучший счёт', () => {
    const runs = [
      run({ id: 'r1', duel_id: 'd1', tg_user_id: 1, score: 4, total_time_ms: 20000 }),
      run({ id: 'r2', duel_id: 'd2', tg_user_id: 1, score: 6, total_time_ms: 15000 }),
    ];
    const s = computeProfileStats(runs, questions, 1);
    expect(s.games).toBe(2);
    expect(s.avgScore).toBe(5);
    expect(s.bestScore).toBe(6);
    expect(s.bestTimeMs).toBe(15000);
  });

  it('считает точность по всем ответам', () => {
    const runs = [
      run({
        id: 'r1',
        duel_id: 'd1',
        tg_user_id: 1,
        answers: [ans('q1', true), ans('q2', false), ans('q3', true)],
      }),
    ];
    const s = computeProfileStats(runs, questions, 1);
    expect(s.accuracy).toBeCloseTo(2 / 3);
  });

  it('точность по темам, слабые темы сверху', () => {
    const runs = [
      run({
        id: 'r1',
        duel_id: 'd1',
        tg_user_id: 1,
        answers: [ans('q1', true), ans('q2', false), ans('q3', false)],
      }),
    ];
    const s = computeProfileStats(runs, questions, 1);
    // Python: 0/1 = 0; Логика: 1/2 = 0.5 → Python выше
    expect(s.topics[0].topic).toBe('Python');
    expect(s.topics[0].accuracy).toBe(0);
    expect(s.topics[1].topic).toBe('Логика');
    expect(s.topics[1].accuracy).toBe(0.5);
  });

  it('считает победы, поражения и ничьи по дуэлям', () => {
    const runs = [
      // d1: я 5/20000, соперник 4 → победа
      run({ id: 'me1', duel_id: 'd1', tg_user_id: 1, score: 5, total_time_ms: 20000 }),
      run({ id: 'op1', duel_id: 'd1', tg_user_id: 2, score: 4, total_time_ms: 10000 }),
      // d2: я 3/30000, соперник 3/20000 → поражение (по времени)
      run({ id: 'me2', duel_id: 'd2', tg_user_id: 1, score: 3, total_time_ms: 30000 }),
      run({ id: 'op2', duel_id: 'd2', tg_user_id: 3, score: 3, total_time_ms: 20000 }),
      // d3: я 2/10000, соперник 2/10000 → ничья
      run({ id: 'me3', duel_id: 'd3', tg_user_id: 1, score: 2, total_time_ms: 10000 }),
      run({ id: 'op3', duel_id: 'd3', tg_user_id: 4, score: 2, total_time_ms: 10000 }),
      // d4: только я, соперника нет → не считается
      run({ id: 'me4', duel_id: 'd4', tg_user_id: 1, score: 7, total_time_ms: 5000 }),
    ];
    const s = computeProfileStats(runs, questions, 1);
    expect(s.wins).toBe(1);
    expect(s.losses).toBe(1);
    expect(s.draws).toBe(1);
    expect(s.games).toBe(4);
  });

  it('считает серию дней подряд от последнего дня игры', () => {
    const runs = [
      run({ id: 'r1', duel_id: 'd1', tg_user_id: 1, created_at: '2026-03-10T10:00:00Z' }),
      run({ id: 'r2', duel_id: 'd2', tg_user_id: 1, created_at: '2026-03-09T10:00:00Z' }),
      run({ id: 'r3', duel_id: 'd3', tg_user_id: 1, created_at: '2026-03-08T10:00:00Z' }),
      // пропуск дня, дальше не считаем
      run({ id: 'r4', duel_id: 'd4', tg_user_id: 1, created_at: '2026-03-05T10:00:00Z' }),
    ];
    expect(computeProfileStats(runs, questions, 1).streak).toBe(3);
  });

  it('несколько забегов в один день считаются одним днём', () => {
    const runs = [
      run({ id: 'r1', duel_id: 'd1', tg_user_id: 1, created_at: '2026-03-10T10:00:00Z' }),
      run({ id: 'r2', duel_id: 'd2', tg_user_id: 1, created_at: '2026-03-10T18:00:00Z' }),
      run({ id: 'r3', duel_id: 'd3', tg_user_id: 1, created_at: '2026-03-09T10:00:00Z' }),
    ];
    expect(computeProfileStats(runs, questions, 1).streak).toBe(2);
  });

  it('последние забеги идут новыми первыми и несут run_id', () => {
    const runs = [
      run({ id: 'r1', duel_id: 'd1', tg_user_id: 1, created_at: '2026-01-01' }),
      run({ id: 'r2', duel_id: 'd2', tg_user_id: 1, created_at: '2026-01-03' }),
      run({ id: 'r3', duel_id: 'd3', tg_user_id: 1, created_at: '2026-01-02' }),
    ];
    const s = computeProfileStats(runs, questions, 1);
    expect(s.recent.map((r) => r.duel_id)).toEqual(['d2', 'd3', 'd1']);
    expect(s.recent.map((r) => r.run_id)).toEqual(['r2', 'r3', 'r1']);
  });
});

describe('computeMistakes', () => {
  it('собирает вопросы с ошибками, чаще всего проваленные сверху', () => {
    const runs = [
      run({
        id: 'r1',
        duel_id: 'd1',
        tg_user_id: 1,
        answers: [ans('q1', false), ans('q2', false), ans('q3', true)],
      }),
      run({
        id: 'r2',
        duel_id: 'd2',
        tg_user_id: 1,
        answers: [ans('q1', false), ans('q2', true)],
      }),
    ];
    const m = computeMistakes(runs, questions, 1);
    // q1 провален дважды, q2 — раз, q3 — верный
    expect(m.map((x) => x.question.id)).toEqual(['q1', 'q2']);
    expect(m[0].wrongCount).toBe(2);
    expect(m[1].wrongCount).toBe(1);
  });

  it('игнорирует чужие забеги', () => {
    const runs = [
      run({ id: 'r1', duel_id: 'd1', tg_user_id: 2, answers: [ans('q1', false)] }),
    ];
    expect(computeMistakes(runs, questions, 1)).toEqual([]);
  });
});

describe('уровни (xp)', () => {
  it('начисляет опыт за верные ответы и победы, считает уровень', () => {
    const runs = [
      // 2 верных = 20 xp, победа = +50 → 70 xp, уровень 1
      run({ id: 'me', duel_id: 'd1', tg_user_id: 1, score: 2, total_time_ms: 10000,
        answers: [ans('q1', true), ans('q2', true), ans('q3', false)] }),
      run({ id: 'op', duel_id: 'd1', tg_user_id: 2, score: 1, total_time_ms: 10000 }),
    ];
    const s = computeProfileStats(runs, questions, 1);
    expect(s.xp).toBe(70);
    expect(s.level).toBe(1);
    expect(s.xpInLevel).toBe(70);
    expect(s.xpForLevel).toBe(100);
  });

  it('переходит на следующий уровень при 100 xp', () => {
    // делаем 12 верных ответов = 120 xp, без побед → уровень 2
    const answers = Array.from({ length: 3 }, () => ans('q1', true));
    const runs = Array.from({ length: 4 }, (_, i) =>
      run({ id: 'r' + i, duel_id: 'd' + i, tg_user_id: 1, score: 3, total_time_ms: 5000, answers }),
    );
    const s = computeProfileStats(runs, questions, 1);
    expect(s.xp).toBe(120);
    expect(s.level).toBe(2);
    expect(s.xpInLevel).toBe(20);
  });
});

describe('computeAchievements', () => {
  it('открывает первую дуэль и первую победу', () => {
    const runs = [
      run({ id: 'me', duel_id: 'd1', tg_user_id: 1, score: 5, total_time_ms: 60000,
        answers: [ans('q1', true)] }),
      run({ id: 'op', duel_id: 'd1', tg_user_id: 2, score: 1, total_time_ms: 60000 }),
    ];
    const a = computeAchievements(runs, questions, 1);
    const by = (id: string) => a.find((x) => x.id === id)!.unlocked;
    expect(by('first_duel')).toBe(true);
    expect(by('first_win')).toBe(true);
    expect(by('veteran')).toBe(false);
  });

  it('перфект и скорострел', () => {
    const answers = Array.from({ length: 10 }, () => ans('q1', true));
    const runs = [
      run({ id: 'me', duel_id: 'd1', tg_user_id: 1, score: 10, total_time_ms: 25000, answers }),
    ];
    const a = computeAchievements(runs, questions, 1);
    const by = (id: string) => a.find((x) => x.id === id)!.unlocked;
    expect(by('perfect')).toBe(true);
    expect(by('fast')).toBe(true);
    expect(by('streak5')).toBe(true);
  });
});
