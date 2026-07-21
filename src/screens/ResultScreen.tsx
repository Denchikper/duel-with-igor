import { shareDuel } from '../lib/telegram';
import { createIgor } from '../core/igor';
import Button from '../ui/Button';
import IgorBubble from '../ui/IgorBubble';
import igorLines from '../../content/igor-lines.json';
import { useMemo } from 'react';
import { QUESTIONS_PER_DUEL } from '../contracts';
import type { IgorLines, Run } from '../contracts';
import type { Screen } from '../App';

export default function ResultScreen({
  duelId,
  run,
  go,
}: {
  duelId: string;
  run: Run;
  go: (s: Screen) => void;
}) {
  const seconds = (run.total_time_ms / 1000).toFixed(1);
  const line = useMemo(() => {
    const igor = createIgor(igorLines as IgorLines);
    return `${run.score} из ${QUESTIONS_PER_DUEL} за ${seconds}с. ${igor.say('run_start')}`;
  }, [run.score, seconds]);

  return (
    <div className="screen" style={{ justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="eyebrow" style={{ letterSpacing: '0.25em' }}>
          твой результат
        </div>
        <div
          className="mono"
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: 'var(--accent)',
            lineHeight: 1,
            marginTop: 8,
            textShadow: '0 0 28px rgba(180,255,57,0.4)',
          }}
        >
          {run.score}
          <span style={{ fontSize: 32, color: 'var(--muted)' }}>/{QUESTIONS_PER_DUEL}</span>
        </div>
        <div className="mono" style={{ color: 'var(--muted)', marginTop: 4 }}>
          {seconds} секунд
        </div>
      </div>

      <IgorBubble line={line} mood="smug" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        <Button
          variant="primary"
          onClick={() => shareDuel(duelId, run.score, run.total_time_ms)}
        >
          Вызвать друга
        </Button>
        <Button variant="secondary" onClick={() => go({ name: 'compare', duelId, meRunId: run.id })}>
          Разбор ответов
        </Button>
        <Button variant="secondary" onClick={() => go({ name: 'home' })}>
          На главную
        </Button>
      </div>
    </div>
  );
}
