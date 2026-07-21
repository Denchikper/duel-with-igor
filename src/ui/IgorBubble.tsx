import { useEffect, useState } from 'react';
import type { IgorBubbleProps, IgorMood } from '../contracts';

const MOOD_COLOR: Record<IgorMood, string> = {
  neutral: 'var(--muted)',
  happy: 'var(--accent)',
  smug: 'var(--secondary)',
  disappointed: 'var(--danger)',
};

const MOOD_FACE: Record<IgorMood, string> = {
  neutral: '•_•',
  happy: '^_^',
  smug: '¬_¬',
  disappointed: 'x_x',
};

// Игорь как оператор терминала: реплика — строка вывода консоли.
export default function IgorBubble({ line, mood }: IgorBubbleProps) {
  const color = MOOD_COLOR[mood];
  const [shown, setShown] = useState(line);

  useEffect(() => {
    setShown(line);
  }, [line]);

  return (
    <div
      className="panel"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 14px',
        borderColor: color === 'var(--muted)' ? 'var(--border)' : color,
        background: 'var(--surface)',
      }}
    >
      <div
        aria-hidden
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 9,
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--mono)',
          fontSize: 13,
          fontWeight: 700,
          color: '#0a0d08',
          background: color,
        }}
      >
        {MOOD_FACE[mood]}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          className="mono"
          style={{ fontSize: 10, letterSpacing: '0.1em', color, opacity: 0.85 }}
        >
          igor@duel:~$
        </div>
        <div
          key={shown}
          className="fadein"
          style={{ fontSize: 15, lineHeight: 1.35, marginTop: 2, color: 'var(--text)' }}
        >
          {shown}
        </div>
      </div>
    </div>
  );
}
