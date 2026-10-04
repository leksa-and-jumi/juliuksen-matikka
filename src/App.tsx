import { AnimatePresence } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { setSoundEnabled } from './audio/sfx';
import { setSpeechEnabled } from './audio/speech';
import { Screen, Teacher } from './components/ui';
import { PLAYER_KEY, SOUND_KEY } from './config';
import { createStore } from './data/createStore';
import { EMPTY_PROGRESS, applyAnswer, applySession, type AnswerInput } from './logic/progress';
import type { SessionTarget } from './logic/session';
import type { Mode, Player, Progress, TopicId } from './logic/types';
import { HomeScreen } from './screens/HomeScreen';
import { LearnScreen } from './screens/LearnScreen';
import { ParentsScreen } from './screens/ParentsScreen';
import { PlayersScreen } from './screens/PlayersScreen';
import { PracticeScreen, type FinishInfo } from './screens/PracticeScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { TopicScreen } from './screens/TopicScreen';

const store = createStore();

type Route =
  | { name: 'loading' }
  | { name: 'error' }
  | { name: 'players' }
  | { name: 'home' }
  | { name: 'parents' }
  | { name: 'topic'; topic: TopicId }
  | { name: 'learn'; topic: TopicId }
  | { name: 'practice'; target: SessionTarget; mode: Mode; run: number }
  | { name: 'results'; target: SessionTarget; mode: Mode; info: FinishInfo };

function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not important: only a convenience.
  }
}

export function App() {
  const [route, setRoute] = useState<Route>({ name: 'loading' });
  const [players, setPlayers] = useState<Player[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [soundOn, setSoundOn] = useState(() => readLocal(SOUND_KEY) !== 'off');

  useEffect(() => {
    setSoundEnabled(soundOn);
    setSpeechEnabled(soundOn);
    writeLocal(SOUND_KEY, soundOn ? 'on' : 'off');
  }, [soundOn]);

  // Every screen starts from the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const choosePlayer = useCallback(async (p: Player) => {
    writeLocal(PLAYER_KEY, p.id);
    setPlayer(p);
    setProgress(await store.getProgress(p.id));
    setRoute({ name: 'home' });
  }, []);

  const load = useCallback(async () => {
    setRoute({ name: 'loading' });
    try {
      const list = await store.listPlayers();
      setPlayers(list);
      const saved = list.find((p) => p.id === readLocal(PLAYER_KEY));
      if (saved) await choosePlayer(saved);
      else setRoute({ name: 'players' });
    } catch (err) {
      console.error(err);
      setRoute({ name: 'error' });
    }
  }, [choosePlayer]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading data from the store on start
    void load();
  }, [load]);

  const createPlayer = async (avatar: string) => {
    const p = await store.createPlayer(avatar);
    setPlayers((list) => [...list, p]);
    await choosePlayer(p);
  };

  const recordAnswer = useCallback(
    (input: AnswerInput) => {
      if (!player) return;
      setProgress((p) => applyAnswer(p, input));
      store.recordAnswer(player.id, input).catch(console.error);
    },
    [player],
  );

  const finish = useCallback(
    (target: SessionTarget, mode: Mode) => (info: FinishInfo) => {
      if (!player) return;
      setProgress((p) => applySession(p, info.result));
      store.finishSession(player.id, info.result).catch(console.error);
      setRoute({ name: 'results', target, mode, info });
    },
    [player],
  );

  const practice = (target: SessionTarget, mode: Mode) =>
    setRoute({ name: 'practice', target, mode, run: Date.now() });

  const home = () => setRoute({ name: 'home' });

  let screen = null;
  switch (route.name) {
    case 'loading':
      screen = (
        <Screen key="loading">
          <div className="flex flex-1 items-center justify-center text-4xl font-bold">
            Ladataan… 🚀
          </div>
        </Screen>
      );
      break;
    case 'error':
      screen = (
        <Screen key="error">
          <Teacher>Hups! Yhteys ei nyt toimi. Kokeillaan uudestaan?</Teacher>
          <button
            className="chunky h-16 self-center bg-sun px-8 text-2xl font-bold"
            onClick={() => void load()}
          >
            🔁 Yritä uudestaan
          </button>
        </Screen>
      );
      break;
    case 'players':
      screen = (
        <PlayersScreen
          key="players"
          players={players}
          onPick={(p) => void choosePlayer(p)}
          onCreate={(a) => void createPlayer(a)}
        />
      );
      break;
    case 'home':
      if (player)
        screen = (
          <HomeScreen
            key="home"
            player={player}
            progress={progress}
            soundOn={soundOn}
            storageKind={store.kind}
            onToggleSound={() => setSoundOn((s) => !s)}
            onSwitchPlayer={() => setRoute({ name: 'players' })}
            onDaily={() => practice('daily', 'challenge')}
            onTopic={(topic) => setRoute({ name: 'topic', topic })}
            onParents={() => setRoute({ name: 'parents' })}
          />
        );
      break;
    case 'parents':
      screen = (
        <ParentsScreen key="parents" progress={progress} storageKind={store.kind} onBack={home} />
      );
      break;
    case 'topic':
      screen = (
        <TopicScreen
          key={`topic-${route.topic}`}
          topic={route.topic}
          progress={progress}
          onBack={home}
          onLearn={() => setRoute({ name: 'learn', topic: route.topic })}
          onPractice={(mode) => practice(route.topic, mode)}
        />
      );
      break;
    case 'learn':
      screen = (
        <LearnScreen
          key={`learn-${route.topic}`}
          topic={route.topic}
          onBack={() => setRoute({ name: 'topic', topic: route.topic })}
          onPractice={() => practice(route.topic, 'practice')}
        />
      );
      break;
    case 'practice':
      screen = (
        <PracticeScreen
          key={`practice-${route.run}`}
          target={route.target}
          mode={route.mode}
          progress={progress}
          onAnswer={recordAnswer}
          onFinish={finish(route.target, route.mode)}
          onBack={() =>
            route.target === 'daily' ? home() : setRoute({ name: 'topic', topic: route.target })
          }
        />
      );
      break;
    case 'results': {
      const { target, mode, info } = route;
      screen = (
        <ResultsScreen
          key="results"
          result={info.result}
          missed={info.missed}
          bestStreak={info.bestStreak}
          canChallenge={target !== 'daily' && mode === 'practice' && info.result.stars >= 2}
          onAgain={() => practice(target, mode)}
          onChallenge={() => practice(target, 'challenge')}
          onHome={home}
        />
      );
      break;
    }
  }

  return <AnimatePresence mode="wait">{screen}</AnimatePresence>;
}
