import { useState } from 'react';
import { loadQuestions, pickDuelQuestions, createDuel } from '../core/api';
import { getTelegramUser } from '../lib/telegram';
import Button from '../ui/Button';
import { QUESTIONS_PER_DUEL } from '../contracts';
import type { Screen } from '../App';

export default function HomeScreen({ go }: { go: (s: Screen) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const all = await loadQuestions();
      const questions = pickDuelQuestions(all);
      const duel = await createDuel(
        questions.map((q) => q.id),
        getTelegramUser().id,
      );
      go({ name: 'game', duelId: duel.id, questions, rival: null });
    } catch (e) {
      setError('Не удалось начать. Попробуй ещё раз.');
      setBusy(false);
    }
  }

  return (
    <div className="screen" style={{ justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div className="eyebrow" style={{ letterSpacing: '0.3em', marginBottom: 10 }}>
          профиматика // егэ информатика
        </div>
        <h1
          className="mono"
          style={{
            fontSize: 40,
            lineHeight: 1.0,
            margin: 0,
            fontWeight: 800,
            color: 'var(--accent)',
            textShadow: '0 0 24px rgba(180,255,57,0.35)',
          }}
        >
          ДУЭЛЬ
          <br />С ИГОРЕМ
        </h1>
        <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: 15, lineHeight: 1.4 }}>
          {QUESTIONS_PER_DUEL} задач на время.<br />Вызови друга и обыграй его.
        </div>
      </div>

      {error && (
        <div className="mono" style={{ color: 'var(--danger)', fontSize: 13, textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        <Button variant="primary" disabled={busy} onClick={start}>
          {busy ? 'Готовим дуэль…' : 'Бросить вызов'}
        </Button>
        <Button variant="secondary" onClick={() => go({ name: 'leaderboard' })}>
          Таблица рекордов
        </Button>
        <Button variant="secondary" onClick={() => go({ name: 'profile' })}>
          Мой профиль
        </Button>
      </div>
    </div>
  );
}
