import type { ProgressBarProps } from '../contracts';

export default function ProgressBar({ answers, currentIndex }: ProgressBarProps) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {answers.map((answer, i) => {
        const isCurrent = i === currentIndex;
        let bg = 'var(--surface-2)';
        let border = '1px solid transparent';
        if (answer) bg = answer.correct ? 'var(--accent)' : 'var(--danger)';
        if (isCurrent && !answer) border = '1px solid var(--border-bright)';

        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 2,
              background: bg,
              border,
              boxShadow: isCurrent && !answer ? '0 0 8px rgba(180,255,57,0.4)' : 'none',
              transition: 'background 0.2s ease',
            }}
          />
        );
      })}
    </div>
  );
}
