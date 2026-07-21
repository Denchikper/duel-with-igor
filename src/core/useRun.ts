import { useCallback, useEffect, useRef, useState } from 'react';
import { QUESTION_TIME_LIMIT_MS } from '../contracts';
import type { Answer, IgorEvent, Question } from '../contracts';

const REVEAL_MS = 1500;
const FAST_ANSWER_MS = 5000;

export function useRun(questions: Question[], onFinish: (answers: Answer[]) => void) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [remainingMs, setRemainingMs] = useState(QUESTION_TIME_LIMIT_MS);
  const [lastEvent, setLastEvent] = useState<IgorEvent>('run_start');
  const startedAt = useRef(Date.now());
  const answersRef = useRef<Answer[]>([]);

  const commit = useCallback(
    (chosen: number | null) => {
      const question = questions[index];
      if (!question) return;

      const elapsed =
        chosen === null
          ? QUESTION_TIME_LIMIT_MS
          : Math.min(Date.now() - startedAt.current, QUESTION_TIME_LIMIT_MS);
      const correct = chosen === question.correct_index;

      const answer: Answer = {
        question_id: question.id,
        chosen_index: chosen,
        correct,
        time_ms: elapsed,
      };

      const next = [...answersRef.current, answer];
      answersRef.current = next;
      setAnswers(next);
      setSelectedIndex(chosen);
      setRevealed(true);

      const streak = next.slice(-3);
      if (chosen === null) setLastEvent('timeout');
      else if (!correct) setLastEvent('wrong');
      else if (streak.length === 3 && streak.every((x) => x.correct)) setLastEvent('streak3');
      else if (elapsed < FAST_ANSWER_MS) setLastEvent('fast_answer');
      else setLastEvent('correct');

      setTimeout(() => {
        if (next.length >= questions.length) {
          onFinish(next);
          return;
        }
        setIndex((i) => i + 1);
        setSelectedIndex(null);
        setRevealed(false);
        setRemainingMs(QUESTION_TIME_LIMIT_MS);
        startedAt.current = Date.now();
      }, REVEAL_MS);
    },
    [index, questions, onFinish],
  );

  useEffect(() => {
    if (revealed || questions.length === 0) return;
    const tick = setInterval(() => {
      const left = QUESTION_TIME_LIMIT_MS - (Date.now() - startedAt.current);
      if (left <= 0) {
        setRemainingMs(0);
        commit(null);
      } else {
        setRemainingMs(left);
      }
    }, 100);
    return () => clearInterval(tick);
  }, [revealed, questions.length, commit]);

  const select = useCallback(
    (option: number) => {
      if (revealed) return;
      commit(option);
    },
    [revealed, commit],
  );

  return {
    current: questions[index] ?? null,
    index,
    answers,
    selectedIndex,
    revealed,
    remainingMs,
    lastEvent,
    select,
  };
}
