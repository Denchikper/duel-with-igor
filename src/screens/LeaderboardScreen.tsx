import { useEffect, useState } from 'react';
import { loadLeaderboard } from '../core/api';
import { getTelegramUser } from '../lib/telegram';
import Leaderboard from '../ui/Leaderboard';
import TopBar from '../ui/TopBar';
import type { LeaderboardRow } from '../contracts';
import type { Screen } from '../App';

export default function LeaderboardScreen({ go }: { go: (s: Screen) => void }) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard()
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="screen">
      <TopBar title="// таблица рекордов" onBack={() => go({ name: 'home' })} />
      {loading ? (
        <div className="mono" style={{ color: 'var(--accent)', textAlign: 'center', marginTop: 40 }}>
          Загрузка<span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
        </div>
      ) : (
        <Leaderboard rows={rows} meUserId={getTelegramUser().id} />
      )}
    </div>
  );
}
