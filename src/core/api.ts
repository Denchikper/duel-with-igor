import { supabase } from '../lib/supabase';
import { QUESTIONS_PER_DUEL } from '../contracts';
import type { Answer, Duel, LeaderboardRow, Question, Run } from '../contracts';

let cache: Question[] | null = null;

export async function loadQuestions(): Promise<Question[]> {
  if (cache) return cache;
  const { data, error } = await supabase.from('questions').select('*');
  if (error) throw error;
  cache = data as Question[];
  return cache;
}

export function pickDuelQuestions(all: Question[]): Question[] {
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, QUESTIONS_PER_DUEL);
}

export async function createDuel(questionIds: string[], userId: number): Promise<Duel> {
  const { data, error } = await supabase
    .from('duels')
    .insert({ question_ids: questionIds, created_by: userId })
    .select()
    .single();
  if (error) throw error;
  return data as Duel;
}

export async function loadDuel(
  duelId: string,
): Promise<{ duel: Duel; questions: Question[]; runs: Run[] }> {
  const [{ data: duel, error: duelError }, { data: runs, error: runsError }, all] =
    await Promise.all([
      supabase.from('duels').select('*').eq('id', duelId).single(),
      supabase.from('runs').select('*').eq('duel_id', duelId).order('created_at'),
      loadQuestions(),
    ]);
  if (duelError) throw duelError;
  if (runsError) throw runsError;

  const wantedIds = (duel as Duel).question_ids;
  let byId = new Map(all.map((q) => [q.id, q]));
  let questions = wantedIds.map((id) => byId.get(id)).filter((q): q is Question => Boolean(q));

  // Кеш мог устареть (например, после пересборки базы). Если каких-то вопросов
  // дуэли в нём нет — дочитываем их напрямую и обновляем кеш, чтобы экран
  // никогда не зависал на пустом наборе.
  if (questions.length < wantedIds.length) {
    const { data: fresh } = await supabase
      .from('questions')
      .select('*')
      .in('id', wantedIds);
    if (fresh) {
      cache = mergeQuestions(cache ?? [], fresh as Question[]);
      byId = new Map((cache as Question[]).map((q) => [q.id, q]));
      questions = wantedIds.map((id) => byId.get(id)).filter((q): q is Question => Boolean(q));
    }
  }

  return { duel: duel as Duel, questions, runs: (runs ?? []) as Run[] };
}

function mergeQuestions(a: Question[], b: Question[]): Question[] {
  const map = new Map(a.map((q) => [q.id, q]));
  for (const q of b) map.set(q.id, q);
  return [...map.values()];
}

export async function submitRun(input: {
  duel_id: string;
  tg_user_id: number;
  display_name: string;
  photo_url: string | null;
  score: number;
  total_time_ms: number;
  answers: Answer[];
}): Promise<Run> {
  const { data, error } = await supabase.from('runs').insert(input).select().single();
  if (error) throw error;
  return data as Run;
}

export async function loadAllRuns(): Promise<Run[]> {
  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as Run[];
}

export async function loadLeaderboard(limit = 20): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase
    .from('runs')
    .select('tg_user_id, display_name, photo_url, score, total_time_ms')
    .order('score', { ascending: false })
    .order('total_time_ms', { ascending: true })
    .limit(200);
  if (error) throw error;

  const best = new Map<number, LeaderboardRow>();
  for (const row of (data ?? []) as LeaderboardRow[]) {
    if (!best.has(row.tg_user_id)) best.set(row.tg_user_id, row);
  }
  return [...best.values()].slice(0, limit);
}
