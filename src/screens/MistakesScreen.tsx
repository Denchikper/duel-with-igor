import { useEffect, useMemo, useState } from 'react';
import { loadAllRuns, loadQuestions } from '../core/api';
import { computeMistakes } from '../core/profile';
import { createIgor, moodFor } from '../core/igor';
import { getTelegramUser, haptic } from '../lib/telegram';
import { sound } from '../lib/sound';
import QuestionCard from '../ui/QuestionCard';
import IgorBubble from '../ui/IgorBubble';
import Button from '../ui/Button';
import igorLines from '../../content/igor-lines.json';
import type { IgorEvent, IgorLines, Question } from '../contracts';
import type { Screen } from '../App';

export default function MistakesScreen({ go }: { go: (s: Screen) => void }) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [event, setEvent] = useState<IgorEvent>('run_start');
  const user = getTelegramUser();
  const igor = useMemo(() => createIgor(igorLines as IgorLines), []);

  useEffect(() => {
    Promise.all([loadAllRuns(), loadQuestions()]).then(([runs, all]) => {
      setQuestions(computeMistakes(runs, all, user.id).map((m) => m.question));
    });
  }, [user.id]);

  function pick(i: number) {
    if (revealed) return;
    const ok = i === questions![index].correct_index;
    setSelected(i);
    setRevealed(true);
    if (ok) {
      setCorrect((c) => c + 1);
      setEvent('correct');
      haptic('success');
      sound.correct();
    } else {
      setEvent('wrong');
      haptic('error');
      sound.wrong();
    }
  }

  function next() {
    setIndex((n) => n + 1);
    setSelected(null);
    setRevealed(false);
    setEvent('run_start');
  }

  // Загрузка
  if (!questions) {
    return (
      <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="mono" style={{ color: 'var(--accent)' }}>
          Собираю ошибки<span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
        </div>
      </div>
    );
  }

  // Ошибок нет
  if (questions.length === 0) {
    return (
      <div className="screen" style={{ justifyContent: 'center' }}>
        <div className="eyebrow" style={{ letterSpacing: '0.2em' }}>
          // работа над ошибками
        </div>
        <IgorBubble line="Ошибок нет — либо ты гений, либо ещё не играл. Сыграй пару дуэлей." mood="smug" />
        <Button variant="secondary" onClick={() => go({ name: 'profile' })}>
          Назад
        </Button>
      </div>
    );
  }

  // Финиш практики
  if (index >= questions.length) {
    const total = questions.length;
    const verdict =
      correct === total
        ? 'Все ошибки закрыты. Вот теперь я доволен.'
        : `${correct} из ${total} со второй попытки. Прогресс есть, дожимай.`;
    return (
      <div className="screen" style={{ justifyContent: 'center' }}>
        <div className="eyebrow" style={{ letterSpacing: '0.2em', textAlign: 'center' }}>
          // работа над ошибками
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            className="mono"
            style={{ fontSize: 64, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}
          >
            {correct}
            <span style={{ fontSize: 28, color: 'var(--muted)' }}>/{total}</span>
          </div>
        </div>
        <IgorBubble line={verdict} mood={correct === total ? 'smug' : 'neutral'} />
        <Button
          variant="primary"
          onClick={() => {
            setIndex(0);
            setSelected(null);
            setRevealed(false);
            setCorrect(0);
          }}
        >
          Ещё раз
        </Button>
        <Button variant="secondary" onClick={() => go({ name: 'profile' })}>
          В профиль
        </Button>
      </div>
    );
  }

  // Прорешивание
  const q = questions[index];
  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="eyebrow" style={{ letterSpacing: '0.18em' }}>
          // работа над ошибками
        </span>
        <button
          onClick={() => go({ name: 'profile' })}
          aria-label="Выйти"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--muted)',
            fontSize: 14,
          }}
        >
          ✕
        </button>
      </div>

      <IgorBubble
        line={revealed ? igor.say(event) : 'Реши заново. Без спешки — тут учимся, а не гонимся.'}
        mood={revealed ? moodFor(event) : 'neutral'}
      />

      <QuestionCard
        question={q}
        questionNumber={index + 1}
        totalQuestions={questions.length}
        selectedIndex={selected}
        revealed={revealed}
        disabled={revealed}
        onSelect={pick}
      />

      {revealed && (
        <Button variant="primary" onClick={next}>
          {index + 1 >= questions.length ? 'Итог' : 'Дальше'}
        </Button>
      )}
    </div>
  );
}
