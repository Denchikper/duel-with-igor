// Демо-реализация API без бэкенда (ветка demo, GitHub Pages).
// Интерфейс тот же, что у Supabase-версии в main: экраны ничего не знают.
// Вопросы — из бандла (content/questions.json), дуэли и раны — в localStorage.
// Id дуэли кодирует индексы вопросов, поэтому ссылка-вызов ?duel=... работает
// даже на чужом устройстве (соперник получит те же вопросы; его результат
// останется у него локально).

import rawQuestions from '../../content/questions.json';
import { QUESTIONS_PER_DUEL } from '../contracts';
import type { Answer, Duel, LeaderboardRow, Question, Run } from '../contracts';

const RUNS_KEY = 'demo:runs';
const DUELS_KEY = 'demo:duels';

const questions: Question[] = (rawQuestions as Omit<Question, 'id'>[]).map((q, i) => ({
  ...q,
  id: `q${i}`,
}));

export async function loadQuestions(): Promise<Question[]> {
  return questions;
}

export function pickDuelQuestions(all: Question[]): Question[] {
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, QUESTIONS_PER_DUEL);
}

// ---------- localStorage-хелперы ----------

function readStore<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeStore<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* приватный режим/квота — демо переживёт без сохранения */
  }
}

function uid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

// ---------- Дуэли ----------

// Id вида "d3-17-42-..." — индексы вопросов через дефис. Самодостаточен:
// восстановим дуэль из одной ссылки, без общей базы.
function encodeDuelId(questionIds: string[]): string {
  return `d${questionIds.map((id) => id.slice(1)).join('-')}`;
}

function decodeDuelId(duelId: string): Duel | null {
  if (!duelId.startsWith('d')) return null;
  const ids = duelId
    .slice(1)
    .split('-')
    .map((n) => `q${n}`);
  if (ids.length !== QUESTIONS_PER_DUEL) return null;
  if (!ids.every((id) => questions.some((q) => q.id === id))) return null;
  return { id: duelId, question_ids: ids, created_by: 0, created_at: new Date(0).toISOString() };
}

export async function createDuel(questionIds: string[], userId: number): Promise<Duel> {
  const duel: Duel = {
    id: encodeDuelId(questionIds),
    question_ids: questionIds,
    created_by: userId,
    created_at: new Date().toISOString(),
  };
  const duels = readStore<Duel>(DUELS_KEY).filter((d) => d.id !== duel.id);
  duels.push(duel);
  writeStore(DUELS_KEY, duels);
  return duel;
}

export async function loadDuel(
  duelId: string,
): Promise<{ duel: Duel; questions: Question[]; runs: Run[] }> {
  const stored = readStore<Duel>(DUELS_KEY).find((d) => d.id === duelId);
  const duel = stored ?? decodeDuelId(duelId);
  if (!duel) throw new Error('Дуэль не найдена');

  const byId = new Map(questions.map((q) => [q.id, q]));
  const duelQuestions = duel.question_ids
    .map((id) => byId.get(id))
    .filter((q): q is Question => Boolean(q));

  const runs = readStore<Run>(RUNS_KEY)
    .filter((r) => r.duel_id === duelId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  return { duel, questions: duelQuestions, runs };
}

// ---------- Раны ----------

export async function submitRun(input: {
  duel_id: string;
  tg_user_id: number;
  display_name: string;
  photo_url: string | null;
  score: number;
  total_time_ms: number;
  answers: Answer[];
}): Promise<Run> {
  const run: Run = { ...input, id: uid(), created_at: new Date().toISOString() };
  const runs = readStore<Run>(RUNS_KEY);
  runs.push(run);
  writeStore(RUNS_KEY, runs);
  return run;
}

export async function loadAllRuns(): Promise<Run[]> {
  return readStore<Run>(RUNS_KEY).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ---------- Лидерборд ----------

// Фейковые соперники, чтобы таблица не была пустой на свежем демо.
// В личную статистику не попадают: профиль фильтрует по своему tg_user_id.
const FAKE_LEADERBOARD: LeaderboardRow[] = [
  { tg_user_id: -1, display_name: 'Игорь Линьков', photo_url: null, score: 10, total_time_ms: 87_400 },
  { tg_user_id: -2, display_name: 'Маша', photo_url: null, score: 8, total_time_ms: 112_300 },
  { tg_user_id: -3, display_name: 'Тимур', photo_url: null, score: 7, total_time_ms: 98_900 },
  { tg_user_id: -4, display_name: 'Соня', photo_url: null, score: 6, total_time_ms: 141_700 },
  { tg_user_id: -5, display_name: 'Артём', photo_url: null, score: 4, total_time_ms: 156_200 },
];

export async function loadLeaderboard(limit = 20): Promise<LeaderboardRow[]> {
  const rows = (await loadAllRuns())
    .map(
      ({ tg_user_id, display_name, photo_url, score, total_time_ms }): LeaderboardRow => ({
        tg_user_id,
        display_name,
        photo_url,
        score,
        total_time_ms,
      }),
    )
    .concat(FAKE_LEADERBOARD)
    .sort((a, b) => b.score - a.score || a.total_time_ms - b.total_time_ms);

  const best = new Map<number, LeaderboardRow>();
  for (const row of rows) {
    if (!best.has(row.tg_user_id)) best.set(row.tg_user_id, row);
  }
  return [...best.values()].slice(0, limit);
}
