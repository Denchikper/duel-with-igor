import { useEffect, useRef, useState } from 'react';
import { loadDuel } from '../core/api';
import { compareRuns } from '../core/scoring';
import { createIgor } from '../core/igor';
import { shareDuel } from '../lib/telegram';
import { sound } from '../lib/sound';
import ResultCompare from '../ui/ResultCompare';
import igorLines from '../../content/igor-lines.json';
import type { IgorLines, Question, Run } from '../contracts';
import type { Screen } from '../App';

const VERDICT_EVENT = { win: 'duel_win', loss: 'duel_loss', draw: 'duel_draw' } as const;

export default function CompareScreen({
  duelId,
  meRunId,
  back,
  go,
}: {
  duelId: string;
  meRunId: string;
  back?: Screen;
  go: (s: Screen) => void;
}) {
  const [state, setState] = useState<{
    questions: Question[];
    me: Run;
    rival: Run | null;
  } | null>(null);
  const played = useRef(false);

  useEffect(() => {
    loadDuel(duelId).then(({ questions, runs }) => {
      const me = runs.find((r) => r.id === meRunId);
      if (!me) return;
      const rival = runs.find((r) => r.id !== meRunId) ?? null;
      setState({ questions, me, rival });
      if (rival && !played.current) {
        played.current = true;
        if (compareRuns(me, rival) === 'win') sound.win();
        else sound.finish();
      }
    });
  }, [duelId, meRunId]);

  if (!state) {
    return (
      <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="mono" style={{ color: 'var(--accent)' }}>
          Считаю<span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
        </div>
      </div>
    );
  }

  const igor = createIgor(igorLines as IgorLines);
  const verdict = state.rival
    ? igor.say(VERDICT_EVENT[compareRuns(state.me, state.rival)])
    : back
      ? 'Соперник этот вызов ещё не принял.'
      : 'Соперник ещё не играл. Отправь ему вызов — узнаем, кто сильнее.';

  return (
    <ResultCompare
      questions={state.questions}
      me={state.me}
      rival={state.rival}
      verdict={verdict}
      onShare={() => shareDuel(duelId, state.me.score, state.me.total_time_ms)}
      onRematch={() => go(back ?? { name: 'home' })}
      onBack={back ? () => go(back) : undefined}
    />
  );
}
