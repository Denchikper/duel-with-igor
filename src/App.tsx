import { useEffect, useState } from 'react';
import { initTelegram, getStartParam } from './lib/telegram';
import { loadQuestions } from './core/api';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import ChallengeScreen from './screens/ChallengeScreen';
import CompareScreen from './screens/CompareScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import MistakesScreen from './screens/MistakesScreen';
import type { Question, Run } from './contracts';

export type Screen =
  | { name: 'home' }
  | { name: 'challenge'; duelId: string }
  | { name: 'game'; duelId: string; questions: Question[]; rival: Run | null }
  | { name: 'result'; duelId: string; run: Run }
  | { name: 'compare'; duelId: string; meRunId: string; back?: Screen }
  | { name: 'leaderboard' }
  | { name: 'profile' }
  | { name: 'mistakes' };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initTelegram();
    loadQuestions()
      .then(() => {
        const duelId = getStartParam();
        if (duelId) setScreen({ name: 'challenge', duelId });
        setReady(true);
      })
      .catch((e) => setError(String(e?.message ?? e)));
  }, []);

  if (error) {
    return (
      <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="eyebrow" style={{ color: 'var(--danger)' }}>
          ошибка загрузки
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>{error}</div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="mono" style={{ color: 'var(--accent)' }}>
          Игорь готовит задачи<span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
        </div>
      </div>
    );
  }

  switch (screen.name) {
    case 'home':
      return <HomeScreen go={setScreen} />;
    case 'challenge':
      return <ChallengeScreen duelId={screen.duelId} go={setScreen} />;
    case 'game':
      return (
        <GameScreen
          duelId={screen.duelId}
          questions={screen.questions}
          rival={screen.rival}
          go={setScreen}
        />
      );
    case 'result':
      return <ResultScreen duelId={screen.duelId} run={screen.run} go={setScreen} />;
    case 'compare':
      return (
        <CompareScreen
          duelId={screen.duelId}
          meRunId={screen.meRunId}
          back={screen.back}
          go={setScreen}
        />
      );
    case 'leaderboard':
      return <LeaderboardScreen go={setScreen} />;
    case 'profile':
      return <ProfileScreen go={setScreen} />;
    case 'mistakes':
      return <MistakesScreen go={setScreen} />;
  }
}
