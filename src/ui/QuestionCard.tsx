import type { QuestionCardProps } from '../contracts';

const LABELS = ['A', 'B', 'C', 'D'];

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  revealed,
  disabled,
  onSelect,
}: QuestionCardProps) {
  const num = String(questionNumber).padStart(2, '0');
  const total = String(totalQuestions).padStart(2, '0');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="eyebrow">
          вопрос {num} / {total}
        </span>
        <span className="eyebrow" style={{ color: 'var(--accent-dim)' }}>
          {question.topic}
        </span>
      </div>

      <div
        className="panel bracketed"
        style={{
          padding: '18px 16px',
          fontSize: 19,
          lineHeight: 1.4,
          fontWeight: 500,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          background: 'var(--surface)',
        }}
      >
        {question.text}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {question.options.map((option, i) => {
          const isCorrect = i === question.correct_index;
          const isChosen = i === selectedIndex;

          let border = '1px solid var(--border)';
          let bg = 'var(--surface)';
          let labelBg = 'var(--surface-2)';
          let labelColor = 'var(--muted)';

          if (revealed) {
            if (isCorrect) {
              border = '1px solid var(--accent)';
              bg = 'rgba(180,255,57,0.10)';
              labelBg = 'var(--accent)';
              labelColor = '#0a0d08';
            } else if (isChosen) {
              border = '1px solid var(--danger)';
              bg = 'rgba(255,77,77,0.10)';
              labelBg = 'var(--danger)';
              labelColor = '#0a0d08';
            }
          } else if (isChosen) {
            border = '1px solid var(--border-bright)';
          }

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                minHeight: 52,
                padding: '12px 14px',
                borderRadius: 11,
                border,
                background: bg,
                color: 'var(--text)',
                fontSize: 16,
                textAlign: 'left',
                fontFamily: 'var(--sans)',
                transition: 'border 0.15s ease, background 0.15s ease',
                cursor: disabled ? 'default' : 'pointer',
              }}
            >
              <span
                className="mono"
                style={{
                  flexShrink: 0,
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  background: labelBg,
                  color: labelColor,
                }}
              >
                {LABELS[i]}
              </span>
              <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{option}</span>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          className="fadein"
          style={{
            padding: '12px 14px',
            borderRadius: 11,
            background: 'var(--surface-2)',
            borderLeft: '3px solid var(--accent)',
            fontSize: 14,
            lineHeight: 1.45,
            color: 'var(--text)',
          }}
        >
          <span className="eyebrow" style={{ color: 'var(--accent-dim)' }}>
            разбор
          </span>
          <div style={{ marginTop: 4 }}>{question.explanation}</div>
        </div>
      )}
    </div>
  );
}
