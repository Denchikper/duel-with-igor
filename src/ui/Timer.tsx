import type { TimerProps } from '../contracts';

export default function Timer({ remainingMs, totalMs }: TimerProps) {
  const ratio = Math.max(0, Math.min(1, remainingMs / totalMs));
  const seconds = Math.ceil(remainingMs / 1000);
  const low = remainingMs <= 5000;
  const color = low ? 'var(--danger)' : 'var(--accent)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          borderRadius: 3,
          background: 'var(--surface-2)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${ratio * 100}%`,
            height: '100%',
            background: color,
            transition: 'width 0.1s linear, background 0.2s ease',
            animation: low ? 'pulse-danger 0.7s ease-in-out infinite' : 'none',
          }}
        />
      </div>
      <span
        className="mono"
        style={{
          fontSize: 15,
          fontWeight: 700,
          color,
          minWidth: 34,
          textAlign: 'right',
          animation: low ? 'pulse-danger 0.7s ease-in-out infinite' : 'none',
        }}
      >
        {seconds}s
      </span>
    </div>
  );
}
