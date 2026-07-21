import type { Answer, LeaderboardRow, Question, Run } from '../contracts';

export const mockQuestion: Question = {
  id: 'q1',
  topic: 'Системы счисления',
  difficulty: 1,
  text: 'Сколько единиц в двоичной записи числа 42?',
  options: ['2', '3', '4', '5'],
  correct_index: 1,
  explanation: '42 в двоичной системе — 101010. Единиц в записи три.',
  igor_comment: 'Переводить в двоичную надо уметь на автомате.',
};

export const mockAnswers: Answer[] = Array.from({ length: 7 }, (_, i) => ({
  question_id: `q${i + 1}`,
  chosen_index: i % 3 === 0 ? 1 : 0,
  correct: i % 3 !== 0,
  time_ms: 3000 + i * 900,
}));

export const mockRun: Run = {
  id: 'run-me',
  duel_id: 'd1',
  tg_user_id: 1,
  display_name: 'Даня',
  photo_url: null,
  score: 5,
  total_time_ms: 38400,
  answers: mockAnswers,
  created_at: '',
};

export const mockRival: Run = {
  id: 'run-rival',
  duel_id: 'd1',
  tg_user_id: 2,
  display_name: 'Игорь Л.',
  photo_url: null,
  score: 6,
  total_time_ms: 31200,
  answers: mockAnswers.map((a, i) => ({ ...a, correct: i !== 4, time_ms: a.time_ms - 700 })),
  created_at: '',
};

export const mockLeaderboard: LeaderboardRow[] = [
  { tg_user_id: 2, display_name: 'Игорь Л.', photo_url: null, score: 7, total_time_ms: 28900 },
  { tg_user_id: 1, display_name: 'Даня', photo_url: null, score: 5, total_time_ms: 38400 },
  { tg_user_id: 3, display_name: 'Анастасия', photo_url: null, score: 5, total_time_ms: 41100 },
];
