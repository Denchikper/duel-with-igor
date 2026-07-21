import { useEffect, useState } from 'react';
import { loadAllRuns, loadQuestions } from '../core/api';
import { computeProfileStats, computeAchievements } from '../core/profile';
import { getTelegramUser } from '../lib/telegram';
import ProfileStats from '../ui/ProfileStats';
import TopBar from '../ui/TopBar';
import IgorBubble from '../ui/IgorBubble';
import type { Achievement, ProfileStats as Stats } from '../contracts';
import type { Screen } from '../App';

export default function ProfileScreen({ go }: { go: (s: Screen) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const user = getTelegramUser();

  useEffect(() => {
    Promise.all([loadAllRuns(), loadQuestions()]).then(([runs, questions]) => {
      setStats(computeProfileStats(runs, questions, user.id));
      setAchievements(computeAchievements(runs, questions, user.id));
    });
  }, [user.id]);

  return (
    <div className="screen">
      <TopBar title="// профиль" onBack={() => go({ name: 'home' })} />

      {!stats ? (
        <div className="mono" style={{ color: 'var(--accent)', textAlign: 'center', marginTop: 40 }}>
          Считаю статистику<span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
        </div>
      ) : stats.games === 0 ? (
        <div style={{ marginTop: 8 }}>
          <IgorBubble
            line="Ты ещё не сыграл ни одной дуэли. Статистика появится после первого забега."
            mood="neutral"
          />
        </div>
      ) : (
        <ProfileStats
          stats={stats}
          achievements={achievements}
          displayName={user.name}
          photoUrl={user.photo_url}
          onOpenMistakes={() => go({ name: 'mistakes' })}
          onOpenGame={(duelId, runId) =>
            go({ name: 'compare', duelId, meRunId: runId, back: { name: 'profile' } })
          }
        />
      )}
    </div>
  );
}
