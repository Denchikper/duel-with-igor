import { useEffect, useState } from 'react';
import { QUESTIONS_PER_DUEL } from '../contracts';
import type { Run } from '../contracts';

// Призрак соперника: во время своего забега видно, где сейчас был бы соперник,
// воспроизведённо по его записанным таймингам. Ощущается как realtime,
// реализовано как воспроизведение статики. Компонент самодостаточен —
// ведёт свои часы и не трогает движок забега.
export default function GhostBar({ rival, startAt }: { rival: Run; startAt: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setElapsed(Date.now() - startAt), 120);
    return () => clearInterval(tick);
  }, [startAt]);

  // На каком вопросе был бы соперник к этому моменту.
  // Учитываем паузу-разбор (1.5с) после каждого вопроса — ты играешь в том же
  // ритме, иначе призрак «улетает» вперёд по чистому времени ответов.
  const REVEAL_MS = 1500;
  let acc = 0;
  let reached = 0;
  for (let i = 0; i < rival.answers.length; i++) {
    acc += rival.answers[i].time_ms + REVEAL_MS;
    if (elapsed >= acc) reached = i + 1;
    else break;
  }
  const done = reached >= QUESTIONS_PER_DUEL;
  const frac = Math.min(1, reached / QUESTIONS_PER_DUEL);

  const initial = rival.display_name.charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', flex: 1, height: 22 }}>
        {/* трек */}
        <div
          style={{
            position: 'absolute',
            top: 9,
            left: 0,
            right: 0,
            height: 4,
            borderRadius: 2,
            background: 'var(--surface-2)',
          }}
        />
        {/* пройденное соперником */}
        <div
          style={{
            position: 'absolute',
            top: 9,
            left: 0,
            width: `${frac * 100}%`,
            height: 4,
            borderRadius: 2,
            background: 'var(--secondary)',
            transition: 'width 0.3s linear',
            opacity: 0.7,
          }}
        />
        {/* аватар-призрак */}
        <div
          className="mono"
          style={{
            position: 'absolute',
            top: 0,
            left: `calc(${frac * 100}% - 11px)`,
            width: 22,
            height: 22,
            borderRadius: 6,
            display: 'grid',
            placeItems: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: '#0a0d08',
            background: 'var(--secondary)',
            transition: 'left 0.3s linear',
            boxShadow: '0 0 10px rgba(139,92,246,0.6)',
          }}
        >
          {initial}
        </div>
      </div>
      <span
        className="mono"
        style={{ fontSize: 11, color: 'var(--secondary)', minWidth: 92, textAlign: 'right' }}
      >
        {done ? 'финишировал' : `${rival.display_name.slice(0, 6)} · ${reached}/${QUESTIONS_PER_DUEL}`}
      </span>
    </div>
  );
}
