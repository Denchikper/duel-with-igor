import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRun } from '../core/useRun';
import { summarize } from '../core/scoring';
import { createIgor, moodFor } from '../core/igor';
import { submitRun } from '../core/api';
import { getTelegramUser, haptic, confirmDialog } from '../lib/telegram';
import { sound } from '../lib/sound';
import QuestionCard from '../ui/QuestionCard';
import Timer from '../ui/Timer';
import ProgressBar from '../ui/ProgressBar';
import IgorBubble from '../ui/IgorBubble';
import GhostBar from '../ui/GhostBar';
import igorLines from '../../content/igor-lines.json';
import { QUESTIONS_PER_DUEL } from '../contracts';
import type { Answer, IgorLines, Question, Run } from '../contracts';
import type { Screen } from '../App';

export default function GameScreen({
  duelId,
  questions,
  rival,
  go,
}: {
  duelId: string;
  questions: Question[];
  rival: Run | null;
  go: (s: Screen) => void;
}) {
  const igor = useMemo(() => createIgor(igorLines as IgorLines), []);
  const submitting = useRef(false);
  const startAt = useRef(Date.now());

  const finish = useCallback(
    async (answers: Answer[]) => {
      if (submitting.current) return;
      submitting.current = true;
      const user = getTelegramUser();
      const { score, total_time_ms } = summarize(answers);
      const run = await submitRun({
        duel_id: duelId,
        tg_user_id: user.id,
        display_name: user.name,
        photo_url: user.photo_url,
        score,
        total_time_ms,
        answers,
      });
      go({ name: 'result', duelId, run });
    },
    [duelId, go],
  );

  const run = useRun(questions, finish);

  useEffect(() => {
    if (run.revealed && run.answers.length > 0) {
      const correct = run.answers[run.answers.length - 1].correct;
      haptic(correct ? 'success' : 'error');
      if (run.lastEvent === 'streak3') sound.streak();
      else if (correct) sound.correct();
      else sound.wrong();
    }
  }, [run.revealed, run.answers, run.lastEvent]);

  // Реплика пересчитывается только при новом событии или переходе к вопросу,
  // а не на каждый тик таймера — иначе фраза мерцает.
  const line = useMemo(
    () => igor.say(run.lastEvent),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [igor, run.lastEvent, run.index],
  );

  if (questions.length === 0) {
    return (
      <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <IgorBubble line="Вопросы этой дуэли не загрузились. Начни новую — всё будет." mood="disappointed" />
        <button
          onClick={() => go({ name: 'home' })}
          style={{
            marginTop: 12,
            padding: '14px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text)',
            fontSize: 16,
          }}
        >
          На главную
        </button>
      </div>
    );
  }

  if (!run.current) {
    return (
      <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="mono" style={{ color: 'var(--accent)' }}>
          Загрузка<span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
        </div>
      </div>
    );
  }

  const slots: (Answer | null)[] = Array.from(
    { length: QUESTIONS_PER_DUEL },
    (_, i) => run.answers[i] ?? null,
  );

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <ProgressBar answers={slots} currentIndex={run.index} />
        </div>
        <button
          onClick={() =>
            confirmDialog('Выйти из дуэли? Результат не сохранится.', () => go({ name: 'home' }))
          }
          aria-label="Выйти из дуэли"
          style={{
            flexShrink: 0,
            width: 30,
            height: 30,
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--muted)',
            fontSize: 16,
            lineHeight: 1,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          ✕
        </button>
      </div>
      {rival && <GhostBar rival={rival} startAt={startAt.current} />}
      <Timer remainingMs={run.remainingMs} totalMs={30_000} />
      <IgorBubble line={line} mood={moodFor(run.lastEvent)} />
      <QuestionCard
        question={run.current}
        questionNumber={run.index + 1}
        totalQuestions={QUESTIONS_PER_DUEL}
        selectedIndex={run.selectedIndex}
        revealed={run.revealed}
        disabled={run.revealed}
        onSelect={run.select}
      />
    </div>
  );
}
