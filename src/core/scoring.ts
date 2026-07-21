import type { Answer, Run } from '../contracts';

export function summarize(answers: Answer[]): { score: number; total_time_ms: number } {
  return {
    score: answers.filter((x) => x.correct).length,
    total_time_ms: answers.reduce((sum, x) => sum + x.time_ms, 0),
  };
}

export function compareRuns(me: Run, rival: Run): 'win' | 'loss' | 'draw' {
  if (me.score !== rival.score) return me.score > rival.score ? 'win' : 'loss';
  if (me.total_time_ms !== rival.total_time_ms) {
    return me.total_time_ms < rival.total_time_ms ? 'win' : 'loss';
  }
  return 'draw';
}
