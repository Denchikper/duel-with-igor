import { compareRuns } from './scoring';
import { QUESTIONS_PER_DUEL } from '../contracts';
import type {
  Achievement,
  MistakeItem,
  ProfileStats,
  Question,
  RecentGame,
  Run,
  TopicStat,
} from '../contracts';

const XP_PER_CORRECT = 10;
const XP_PER_WIN = 50;
const XP_PER_LEVEL = 100;

// Максимальная серия верных подряд внутри одного забега.
function maxStreakInRun(run: Run): number {
  let best = 0;
  let cur = 0;
  for (const a of run.answers) {
    cur = a.correct ? cur + 1 : 0;
    if (cur > best) best = cur;
  }
  return best;
}

const EMPTY: ProfileStats = {
  games: 0,
  avgScore: 0,
  bestScore: 0,
  bestTimeMs: 0,
  accuracy: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  topics: [],
  recent: [],
  streak: 0,
  xp: 0,
  level: 1,
  xpInLevel: 0,
  xpForLevel: XP_PER_LEVEL,
};

// Вопросы, на которых игрок ошибался, — для разбора ошибок.
// Отсортированы по числу ошибок (чаще всего проваленные сверху).
export function computeMistakes(
  allRuns: Run[],
  questions: Question[],
  userId: number,
): MistakeItem[] {
  const qById = new Map(questions.map((q) => [q.id, q]));
  const wrong = new Map<string, number>();
  for (const run of allRuns) {
    if (run.tg_user_id !== userId) continue;
    for (const a of run.answers) {
      if (!a.correct) wrong.set(a.question_id, (wrong.get(a.question_id) ?? 0) + 1);
    }
  }
  const items: MistakeItem[] = [];
  for (const [qid, wrongCount] of wrong) {
    const question = qById.get(qid);
    if (question) items.push({ question, wrongCount });
  }
  return items.sort((a, b) => b.wrongCount - a.wrongCount);
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayNumber(iso: string): number {
  return Math.floor(new Date(iso).getTime() / DAY_MS);
}

// Серия дней подряд, считая назад от последнего дня, когда игрок играл.
function computeStreak(runs: Run[]): number {
  const days = [...new Set(runs.map((r) => dayNumber(r.created_at)))].sort((a, b) => b - a);
  if (days.length === 0) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i] === days[i - 1] - 1) streak += 1;
    else break;
  }
  return streak;
}

export function computeProfileStats(
  allRuns: Run[],
  questions: Question[],
  userId: number,
): ProfileStats {
  const mine = allRuns.filter((r) => r.tg_user_id === userId);
  if (mine.length === 0) return EMPTY;

  // Средний и лучший результат
  const totalScore = mine.reduce((s, r) => s + r.score, 0);
  const avgScore = totalScore / mine.length;
  const best = [...mine].sort(
    (a, b) => b.score - a.score || a.total_time_ms - b.total_time_ms,
  )[0];

  // Общая точность и точность по темам
  const topicById = new Map(questions.map((q) => [q.id, q.topic]));
  let correctTotal = 0;
  let answersTotal = 0;
  const byTopic = new Map<string, { correct: number; total: number }>();

  for (const run of mine) {
    for (const a of run.answers) {
      answersTotal += 1;
      if (a.correct) correctTotal += 1;
      const topic = topicById.get(a.question_id);
      if (!topic) continue;
      const t = byTopic.get(topic) ?? { correct: 0, total: 0 };
      t.total += 1;
      if (a.correct) t.correct += 1;
      byTopic.set(topic, t);
    }
  }

  const topics: TopicStat[] = [...byTopic.entries()]
    .map(([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      accuracy: total > 0 ? correct / total : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);

  // Победы / поражения / ничьи по дуэлям
  let wins = 0;
  let losses = 0;
  let draws = 0;
  const myByDuel = new Map<string, Run>();
  for (const r of mine) {
    // если в одной дуэли несколько забегов — берём лучший
    const cur = myByDuel.get(r.duel_id);
    if (!cur || r.score > cur.score || (r.score === cur.score && r.total_time_ms < cur.total_time_ms)) {
      myByDuel.set(r.duel_id, r);
    }
  }
  for (const [duelId, myRun] of myByDuel) {
    const opponents = allRuns.filter(
      (r) => r.duel_id === duelId && r.tg_user_id !== userId,
    );
    if (opponents.length === 0) continue;
    const bestOpp = opponents.sort(
      (a, b) => b.score - a.score || a.total_time_ms - b.total_time_ms,
    )[0];
    const outcome = compareRuns(myRun, bestOpp);
    if (outcome === 'win') wins += 1;
    else if (outcome === 'loss') losses += 1;
    else draws += 1;
  }

  // Последние забеги, новые первыми
  const recent: RecentGame[] = [...mine]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 10)
    .map((r) => ({
      run_id: r.id,
      duel_id: r.duel_id,
      score: r.score,
      total_time_ms: r.total_time_ms,
      created_at: r.created_at,
    }));

  const xp = correctTotal * XP_PER_CORRECT + wins * XP_PER_WIN;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;

  return {
    games: mine.length,
    avgScore,
    bestScore: best.score,
    bestTimeMs: best.total_time_ms,
    accuracy: answersTotal > 0 ? correctTotal / answersTotal : 0,
    wins,
    losses,
    draws,
    topics,
    recent,
    streak: computeStreak(mine),
    xp,
    level,
    xpInLevel: xp % XP_PER_LEVEL,
    xpForLevel: XP_PER_LEVEL,
  };
}

// Достижения — выводятся из истории забегов, без изменения схемы.
export function computeAchievements(
  allRuns: Run[],
  questions: Question[],
  userId: number,
): Achievement[] {
  const stats = computeProfileStats(allRuns, questions, userId);
  const mine = allRuns.filter((r) => r.tg_user_id === userId);
  const perfect = mine.some((r) => r.score === QUESTIONS_PER_DUEL);
  const fastRun = mine.some((r) => r.answers.length > 0 && r.total_time_ms <= 40_000);
  const bigStreak = mine.some((r) => maxStreakInRun(r) >= 5);
  const topicMastered = stats.topics.some((t) => t.total >= 3 && t.accuracy === 1);

  const defs: Array<Omit<Achievement, 'unlocked'> & { unlocked: boolean }> = [
    {
      id: 'first_duel',
      title: 'Первый бой',
      description: 'Сыграть первую дуэль',
      icon: '🎯',
      unlocked: stats.games >= 1,
    },
    {
      id: 'first_win',
      title: 'Первая кровь',
      description: 'Выиграть дуэль',
      icon: '⚔️',
      unlocked: stats.wins >= 1,
    },
    {
      id: 'perfect',
      title: 'Перфекционист',
      description: `Решить все ${QUESTIONS_PER_DUEL} без ошибок`,
      icon: '💯',
      unlocked: perfect,
    },
    {
      id: 'fast',
      title: 'Скорострел',
      description: 'Пройти забег быстрее 40 секунд',
      icon: '⚡',
      unlocked: fastRun,
    },
    {
      id: 'streak5',
      title: 'На волне',
      description: '5 верных ответов подряд',
      icon: '🔥',
      unlocked: bigStreak,
    },
    {
      id: 'veteran',
      title: 'Ветеран',
      description: 'Сыграть 10 дуэлей',
      icon: '🎖️',
      unlocked: stats.games >= 10,
    },
    {
      id: 'daily3',
      title: 'Режим',
      description: 'Играть 3 дня подряд',
      icon: '📅',
      unlocked: stats.streak >= 3,
    },
    {
      id: 'topic_master',
      title: 'Знаток темы',
      description: '100% по одной из тем',
      icon: '🧠',
      unlocked: topicMastered,
    },
  ];

  return defs;
}
