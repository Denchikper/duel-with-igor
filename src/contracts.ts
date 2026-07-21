// ЗАМОРОЖЕННЫЙ КОНТРАКТ.
// Правки — только через владельца ядра (Daniel) и только с оповещением
// mazz1k (content) и агента ui. Остальные читают, но не редактируют.

import type { ReactNode } from 'react';

export const QUESTIONS_PER_DUEL = 10;
export const QUESTION_TIME_LIMIT_MS = 30_000;
export const OPTIONS_PER_QUESTION = 4;

// ---------- Данные ----------

export interface Question {
  id: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  text: string;
  options: string[]; // ровно 4
  correct_index: number; // 0..3
  explanation: string;
  igor_comment: string;
}

export interface Answer {
  question_id: string;
  chosen_index: number | null; // null = не успел
  correct: boolean;
  time_ms: number;
}

export interface Duel {
  id: string;
  question_ids: string[]; // ровно 7, порядок значим
  created_by: number;
  created_at: string;
}

export interface Run {
  id: string;
  duel_id: string;
  tg_user_id: number;
  display_name: string;
  photo_url: string | null;
  score: number; // 0..7
  total_time_ms: number;
  answers: Answer[]; // ровно 7, порядок совпадает с question_ids
  created_at: string;
}

export interface LeaderboardRow {
  tg_user_id: number;
  display_name: string;
  photo_url: string | null;
  score: number;
  total_time_ms: number;
}

// ---------- Игорь ----------

export type IgorEvent =
  | 'run_start'
  | 'correct'
  | 'wrong'
  | 'streak3'
  | 'fast_answer'
  | 'timeout'
  | 'duel_win'
  | 'duel_loss'
  | 'duel_draw';

export type IgorLines = Record<IgorEvent, string[]>;

export type IgorMood = 'neutral' | 'happy' | 'smug' | 'disappointed';

// ---------- Пропсы UI-компонентов ----------

export interface QuestionCardProps {
  question: Question;
  questionNumber: number; // 1..7
  totalQuestions: number;
  selectedIndex: number | null;
  revealed: boolean; // true = подсветить правильный/неправильный
  disabled: boolean;
  onSelect: (index: number) => void;
}

export interface TimerProps {
  remainingMs: number;
  totalMs: number;
}

export interface ProgressBarProps {
  answers: (Answer | null)[]; // длина 7, null = ещё не дошли
  currentIndex: number; // 0..6
}

export interface IgorBubbleProps {
  line: string;
  mood: IgorMood;
}

export interface ResultCompareProps {
  questions: Question[]; // 7, в порядке дуэли
  me: Run;
  rival: Run | null; // null = соперник ещё не сыграл
  verdict: string; // реплика Игоря
  onShare: () => void;
  onRematch: () => void;
  onBack?: () => void; // явная кнопка выхода (например, при просмотре из истории)
}

export interface LeaderboardProps {
  rows: LeaderboardRow[];
  meUserId: number | null;
}

export interface ButtonProps {
  children: ReactNode;
  variant: 'primary' | 'secondary';
  disabled?: boolean;
  onClick: () => void;
}

// ---------- Профиль и аналитика ----------

export interface TopicStat {
  topic: string;
  correct: number;
  total: number;
  accuracy: number; // 0..1
}

export interface RecentGame {
  run_id: string;
  duel_id: string;
  score: number;
  total_time_ms: number;
  created_at: string;
}

export interface MistakeItem {
  question: Question;
  wrongCount: number; // сколько раз ошибся на этом вопросе
}

export interface ProfileStats {
  games: number; // сыграно забегов
  avgScore: number; // средний счёт 0..7
  bestScore: number;
  bestTimeMs: number; // время лучшего результата
  accuracy: number; // общая точность 0..1
  wins: number;
  losses: number;
  draws: number;
  topics: TopicStat[]; // отсортированы по возрастанию точности (слабые сверху)
  recent: RecentGame[]; // последние забеги, новые первыми
  streak: number; // серия дней подряд с игрой, считая от последнего дня игры
  xp: number; // опыт: верный ответ +10, победа в дуэли +50
  level: number; // уровень, начиная с 1
  xpInLevel: number; // опыт внутри текущего уровня
  xpForLevel: number; // сколько опыта нужно на уровень
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // эмодзи
  unlocked: boolean;
}

export interface ProfileStatsProps {
  stats: ProfileStats;
  achievements: Achievement[];
  displayName: string;
  photoUrl: string | null;
  onOpenMistakes: () => void;
  onOpenGame: (duelId: string, runId: string) => void;
}
