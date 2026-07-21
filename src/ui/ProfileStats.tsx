import { QUESTIONS_PER_DUEL } from '../contracts';
import type { ProfileStatsProps } from '../contracts';

function pct(x: number): string {
  return Math.round(x * 100) + '%';
}

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div
      className="panel"
      style={{ padding: '12px 14px', textAlign: 'center', flex: 1, minWidth: 0 }}
    >
      <div
        className="mono"
        style={{ fontSize: 26, fontWeight: 800, color: color ?? 'var(--accent)', lineHeight: 1 }}
      >
        {value}
      </div>
      <div className="eyebrow" style={{ marginTop: 6, justifyContent: 'center' }}>
        {label}
      </div>
    </div>
  );
}

export default function ProfileStats({
  stats,
  achievements,
  displayName,
  photoUrl,
  onOpenMistakes,
  onOpenGame,
}: ProfileStatsProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Шапка профиля */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }}
          />
        ) : (
          <div
            className="mono"
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              background: 'var(--surface-2)',
              color: 'var(--accent)',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </div>
          <div className="mono" style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--accent)' }}>{stats.wins}</span>‑
            <span style={{ color: 'var(--danger)' }}>{stats.losses}</span>‑
            <span>{stats.draws}</span>
            <span style={{ color: 'var(--muted)' }}> В‑П‑Н</span>
          </div>
        </div>
        {stats.streak > 0 && (
          <div
            className="mono"
            style={{
              flexShrink: 0,
              textAlign: 'center',
              padding: '6px 10px',
              borderRadius: 10,
              border: '1px solid var(--border-bright)',
              background: 'rgba(180,255,57,0.06)',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
              {stats.streak}
            </div>
            <div style={{ fontSize: 9, letterSpacing: '0.08em', color: 'var(--muted)', marginTop: 3, whiteSpace: 'nowrap' }}>
              {stats.streak === 1 ? 'ДЕНЬ' : 'ДНЕЙ'} 🔥
            </div>
          </div>
        )}
      </div>

      {/* Ключевые цифры */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Stat value={String(stats.games)} label="дуэлей" />
        <Stat value={stats.avgScore.toFixed(1)} label="ср. счёт" />
        <Stat value={pct(stats.accuracy)} label="точность" color="var(--secondary)" />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Stat
          value={`${stats.bestScore}/${QUESTIONS_PER_DUEL}`}
          label={`лучший · ${(stats.bestTimeMs / 1000).toFixed(1)}с`}
        />
        <Stat
          value={stats.games > 0 ? pct(stats.wins / Math.max(1, stats.wins + stats.losses + stats.draws)) : '—'}
          label="винрейт"
          color="var(--accent)"
        />
      </div>

      {/* Уровень */}
      <div className="panel" style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="mono" style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)' }}>
            LVL {stats.level}
          </span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
            {stats.xpInLevel} / {stats.xpForLevel} XP
          </span>
        </div>
        <div
          style={{
            marginTop: 8,
            height: 7,
            borderRadius: 4,
            background: 'var(--surface-2)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(stats.xpInLevel / stats.xpForLevel) * 100}%`,
              height: '100%',
              background: 'var(--accent)',
              boxShadow: '0 0 10px rgba(180,255,57,0.5)',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* Достижения */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="eyebrow" style={{ letterSpacing: '0.18em' }}>
            // достижения
          </span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
            {unlockedCount} / {achievements.length}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {achievements.map((a) => (
            <div
              key={a.id}
              title={`${a.title} — ${a.description}`}
              style={{
                aspectRatio: '1',
                borderRadius: 10,
                display: 'grid',
                placeItems: 'center',
                fontSize: 22,
                border: a.unlocked ? '1px solid var(--border-bright)' : '1px solid var(--border)',
                background: a.unlocked ? 'rgba(180,255,57,0.08)' : 'var(--surface)',
                filter: a.unlocked ? 'none' : 'grayscale(1)',
                opacity: a.unlocked ? 1 : 0.35,
              }}
            >
              {a.icon}
            </div>
          ))}
        </div>
      </div>

      {/* Разбор ошибок */}
      <button
        onClick={onOpenMistakes}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '13px 15px',
          borderRadius: 12,
          border: '1px solid var(--danger)',
          background: 'rgba(255,77,77,0.07)',
          color: 'var(--text)',
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        <span>Разбор ошибок</span>
        <span className="mono" style={{ color: 'var(--danger)' }}>→</span>
      </button>

      {/* Точность по темам */}
      {stats.topics.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 4 }}>
          <div className="eyebrow" style={{ letterSpacing: '0.18em' }}>
            // точность по темам
          </div>
          {stats.topics.map((t) => {
            const weak = t.accuracy < 0.5;
            const color = weak ? 'var(--danger)' : t.accuracy < 0.75 ? 'var(--secondary)' : 'var(--accent)';
            return (
              <div key={t.topic} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text)' }}>{t.topic}</span>
                  <span className="mono" style={{ color }}>
                    {pct(t.accuracy)} <span style={{ color: 'var(--muted)' }}>({t.correct}/{t.total})</span>
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${t.accuracy * 100}%`,
                      height: '100%',
                      background: color,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Последние забеги */}
      {stats.recent.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          <div className="eyebrow" style={{ letterSpacing: '0.18em' }}>
            // история дуэлей
          </div>
          {stats.recent.map((r, i) => (
            <button
              key={`${r.run_id}-${i}`}
              onClick={() => onOpenGame(r.duel_id, r.run_id)}
              className="panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 12px',
                width: '100%',
                background: 'var(--surface)',
                color: 'var(--text)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                  {r.score}/{QUESTIONS_PER_DUEL}
                </span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {(r.total_time_ms / 1000).toFixed(1)}с
                </span>
              </span>
              <span className="mono" style={{ fontSize: 13, color: 'var(--secondary)' }}>
                разбор →
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
