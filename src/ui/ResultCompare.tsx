import { useState } from 'react';
import { QUESTIONS_PER_DUEL } from '../contracts';
import type { ResultCompareProps, Run } from '../contracts';
import Button from './Button';
import IgorBubble from './IgorBubble';

function secs(ms: number): string {
  return (ms / 1000).toFixed(1) + 's';
}

function Side({ run, win, label }: { run: Run | null; win: boolean; label: string }) {
  const color = win ? 'var(--accent)' : 'var(--muted)';
  return (
    <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {run ? run.display_name : '—'}
      </div>
      {run ? (
        <>
          <div className="mono" style={{ fontSize: 30, fontWeight: 700, color, lineHeight: 1.1 }}>
            {run.score}
            <span style={{ fontSize: 16, color: 'var(--muted)' }}>/{QUESTIONS_PER_DUEL}</span>
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
            {secs(run.total_time_ms)}
          </div>
        </>
      ) : (
        <div className="mono" style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10 }}>
          ещё не играл
        </div>
      )}
    </div>
  );
}

export default function ResultCompare({
  questions,
  me,
  rival,
  verdict,
  onShare,
  onRematch,
  onBack,
}: ResultCompareProps) {
  const [open, setOpen] = useState<number | null>(null);
  const meWins = rival ? me.score > rival.score || (me.score === rival.score && me.total_time_ms < rival.total_time_ms) : false;
  const rivalWins = rival ? !meWins && !(me.score === rival.score && me.total_time_ms === rival.total_time_ms) : false;

  return (
    <div className="screen">
      <div className="eyebrow" style={{ textAlign: 'center', letterSpacing: '0.25em' }}>
        итог дуэли
      </div>

      {/* VS-раскол */}
      <div
        className="panel"
        style={{ display: 'flex', alignItems: 'stretch', padding: '16px 8px', position: 'relative' }}
      >
        <Side run={me} win={meWins} label="ты" />
        <div
          className="mono vs-slam"
          style={{
            alignSelf: 'center',
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--danger)',
            padding: '0 6px',
            textShadow: '0 0 16px rgba(255,77,77,0.5)',
          }}
        >
          VS
        </div>
        <Side run={rival} win={rivalWins} label="соперник" />
      </div>

      <div className="verdict-rise">
        <IgorBubble line={verdict} mood={meWins ? 'smug' : rival && rivalWins ? 'disappointed' : 'neutral'} />
      </div>

      {/* Повопросная таблица */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {questions.map((q, i) => {
          const mine = me.answers[i];
          const theirs = rival?.answers[i] ?? null;
          const isOpen = open === i;
          return (
            <div key={q.id} className="panel" style={{ overflow: 'hidden' }}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr 1fr',
                  alignItems: 'center',
                  width: '100%',
                  padding: '11px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text)',
                  gap: 6,
                }}
              >
                <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Cell answer={mine} faster={theirs ? mine.time_ms < theirs.time_ms : true} />
                {rival ? (
                  <Cell answer={theirs} faster={theirs ? theirs.time_ms < mine.time_ms : false} />
                ) : (
                  <span className="mono" style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right' }}>
                    —
                  </span>
                )}
              </button>
              {isOpen && (
                <div
                  className="fadein"
                  style={{
                    padding: '0 12px 12px',
                    fontSize: 14,
                    lineHeight: 1.4,
                    color: 'var(--muted)',
                  }}
                >
                  <div style={{ color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{q.text}</div>
                  <div style={{ marginTop: 6, color: 'var(--accent)' }}>
                    Ответ: {q.options[q.correct_index]}
                  </div>
                  <div style={{ marginTop: 4 }}>{q.explanation}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
        {onBack ? (
          // Просмотр из истории: шерить старую дуэль незачем, нужен выход.
          <Button variant="secondary" onClick={onBack}>
            Назад
          </Button>
        ) : (
          <>
            <Button variant="primary" onClick={onShare}>
              {rival ? 'Вызвать ещё' : 'Вызвать друга'}
            </Button>
            <Button variant="secondary" onClick={onRematch}>
              Новая дуэль
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function Cell({
  answer,
  faster,
}: {
  answer: { correct: boolean; time_ms: number } | null;
  faster: boolean;
}) {
  if (!answer) {
    return (
      <span className="mono" style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right' }}>
        —
      </span>
    );
  }
  const good = answer.correct && faster;
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
      }}
    >
      <span
        className="mono"
        style={{ fontSize: 12, color: good ? 'var(--accent)' : 'var(--muted)' }}
      >
        {(answer.time_ms / 1000).toFixed(1)}s
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: answer.correct ? 'var(--accent)' : 'var(--danger)',
        }}
      >
        {answer.correct ? '✓' : '✕'}
      </span>
    </span>
  );
}
