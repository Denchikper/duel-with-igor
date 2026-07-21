import { useEffect, useState } from 'react';
import { loadDuel } from '../core/api';
import Button from '../ui/Button';
import IgorBubble from '../ui/IgorBubble';
import { QUESTIONS_PER_DUEL } from '../contracts';
import type { Question, Run } from '../contracts';
import type { Screen } from '../App';

export default function ChallengeScreen({
  duelId,
  go,
}: {
  duelId: string;
  go: (s: Screen) => void;
}) {
  const [rival, setRival] = useState<Run | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDuel(duelId)
      .then(({ questions, runs }) => {
        if (questions.length === 0) {
          setError('Вопросы этой дуэли устарели. Начни новую — вызовешь заново.');
          return;
        }
        if (runs.length === 0) {
          setError('По этому вызову ещё никто не сыграл. Открой приложение и брось вызов сам.');
          return;
        }
        setQuestions(questions);
        setRival(runs[0]);
      })
      .catch(() => setError('Вызов не найден. Возможно, ссылка устарела.'))
      .finally(() => setLoading(false));
  }, [duelId]);

  if (error) {
    return (
      <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <IgorBubble line={error} mood="disappointed" />
        <Button variant="secondary" onClick={() => go({ name: 'home' })}>
          На главную
        </Button>
      </div>
    );
  }

  if (loading || !rival) {
    return (
      <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="mono" style={{ color: 'var(--accent)' }}>
          Открываю вызов<span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
        </div>
      </div>
    );
  }

  const seconds = (rival.total_time_ms / 1000).toFixed(1);

  return (
    <div className="screen" style={{ justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="eyebrow" style={{ letterSpacing: '0.25em' }}>
          входящий вызов
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 10 }}>{rival.display_name}</div>
        <div
          className="mono"
          style={{ fontSize: 40, fontWeight: 800, color: 'var(--secondary)', marginTop: 4 }}
        >
          {rival.score}
          <span style={{ fontSize: 20, color: 'var(--muted)' }}>/{QUESTIONS_PER_DUEL}</span>
        </div>
        <div className="mono" style={{ color: 'var(--muted)' }}>за {seconds}с</div>
      </div>

      <IgorBubble
        line={`${rival.display_name} уже сыграл эти 7 вопросов. Твой ход — те же задачи. Слабо повторить?`}
        mood="smug"
      />

      <Button
        variant="primary"
        onClick={() => go({ name: 'game', duelId, questions, rival })}
      >
        Принять вызов
      </Button>
    </div>
  );
}
