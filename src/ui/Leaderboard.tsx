import { QUESTIONS_PER_DUEL } from '../contracts';
import type { LeaderboardProps, LeaderboardRow } from '../contracts';

const MEDALS = ['①', '②', '③'];

function Avatar({ row }: { row: LeaderboardRow }) {
  if (row.photo_url) {
    return (
      <img
        src={row.photo_url}
        alt=""
        style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }}
      />
    );
  }
  return (
    <div
      className="mono"
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--surface-2)',
        color: 'var(--accent)',
        fontWeight: 700,
        fontSize: 14,
      }}
    >
      {row.display_name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function Leaderboard({ rows, meUserId }: LeaderboardProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.length === 0 ? (
        <div className="panel" style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>
          Рекордов пока нет. Сыграй первым.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((row, i) => {
            const isMe = row.tg_user_id === meUserId;
            return (
              <div
                key={`${row.tg_user_id}-${i}`}
                className="panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '9px 12px',
                  borderColor: isMe ? 'var(--accent)' : 'var(--border)',
                  background: isMe ? 'rgba(180,255,57,0.06)' : 'var(--surface)',
                }}
              >
                <span
                  className="mono"
                  style={{
                    width: 22,
                    textAlign: 'center',
                    fontSize: i < 3 ? 17 : 13,
                    color: i < 3 ? 'var(--accent)' : 'var(--muted)',
                    fontWeight: 700,
                  }}
                >
                  {i < 3 ? MEDALS[i] : i + 1}
                </span>
                <Avatar row={row} />
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: isMe ? 700 : 500,
                  }}
                >
                  {row.display_name}
                  {isMe && (
                    <span className="mono" style={{ color: 'var(--accent)', fontSize: 11 }}>
                      {' '}
                      ты
                    </span>
                  )}
                </span>
                <span className="mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                  {row.score}/{QUESTIONS_PER_DUEL}
                </span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--muted)', minWidth: 44, textAlign: 'right' }}>
                  {(row.total_time_ms / 1000).toFixed(1)}s
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
