import { motion } from 'motion/react';
import { mastery, statsMap } from '../logic/leitner';
import { dayKey, starsOf, streakDays, topicKey, totalStars } from '../logic/progress';
import { allFacts } from '../logic/questions';
import { TOPICS } from '../logic/topics';
import type { Player, Progress } from '../logic/types';
import type { TopicId } from '../logic/types';
import { Screen, Stars } from '../components/ui';
import { topicStyle } from '../components/topicStyle';

interface Props {
  player: Player;
  progress: Progress;
  soundOn: boolean;
  storageKind: 'convex' | 'local';
  onToggleSound: () => void;
  onSwitchPlayer: () => void;
  onDaily: () => void;
  onTopic: (topic: TopicId) => void;
  onParents: () => void;
}

export function HomeScreen(props: Props) {
  const { player, progress } = props;
  const stats = statsMap(progress.facts);
  const today = new Date();
  const streak = streakDays(progress, today);
  const playedToday = progress.days.some((d) => d.day === dayKey(today) && d.answers > 0);

  return (
    <Screen>
      <header className="flex flex-wrap items-center justify-end gap-3">
        <button
          className="chunky mr-auto flex h-16 w-16 items-center justify-center bg-white text-5xl sm:mr-0"
          onClick={props.onSwitchPlayer}
          aria-label="Vaihda pelaajaa"
        >
          {player.avatar}
        </button>
        <h1 className="order-last w-full text-[clamp(2rem,9vw,3rem)] leading-none font-bold sm:order-none sm:w-auto sm:flex-1">
          Matikka<span className="text-tomato">seikkailu</span>
        </h1>
        <div className="chunky flex h-14 items-center gap-1 bg-sun px-3 text-2xl font-bold">
          ⭐ {totalStars(progress)}
        </div>
        <div
          className="chunky hidden h-14 items-center gap-1 bg-white px-3 text-2xl font-bold sm:flex"
          title="Päiviä putkeen"
        >
          🔥 {streak}
        </div>
        <button
          className="chunky flex h-14 w-14 items-center justify-center bg-white text-2xl"
          onClick={props.onToggleSound}
          aria-label={props.soundOn ? 'Ääni pois' : 'Ääni päälle'}
        >
          {props.soundOn ? '🔊' : '🔇'}
        </button>
      </header>

      <motion.button
        className="chunky relative flex items-center gap-4 overflow-hidden bg-sun p-5 text-left sm:p-7"
        onClick={props.onDaily}
        whileHover={{ scale: 1.01 }}
      >
        <motion.span
          className="text-6xl sm:text-8xl"
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.5 }}
        >
          🎯
        </motion.span>
        <span className="flex-1">
          <span className="block text-3xl font-bold sm:text-5xl">Päivän treeni</span>
          <span className="block text-lg font-semibold sm:text-2xl">
            {playedToday ? 'Tänään jo treenattu! Lisää? 💪' : '10 tehtävää – tärkeimmät ensin!'}
          </span>
        </span>
        <span className="text-5xl font-bold sm:text-6xl">▶</span>
        {streak > 1 && (
          <span className="absolute top-2 right-3 rounded-full border-2 border-ink bg-white px-2 text-sm font-bold">
            🔥 {streak} päivää putkeen
          </span>
        )}
      </motion.button>

      <h2 className="text-2xl font-bold sm:text-3xl">Opettele ja harjoittele</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((t, i) => {
          const learned = Math.round(mastery(allFacts(t.id), stats) * 100);
          const challengeStars = starsOf(progress, topicKey(t.id, 'challenge'));
          return (
            <motion.button
              key={t.id}
              style={topicStyle(t.color)}
              className="chunky flex flex-col gap-2 bg-white p-4 text-left"
              onClick={() => props.onTopic(t.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-ink bg-(--topic) text-xl font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-xl leading-tight font-bold sm:text-2xl">{t.title}</span>
              </div>
              <div className="flex items-center justify-center rounded-2xl border-4 border-ink bg-(--topic) py-4 text-4xl font-bold text-white sm:text-5xl">
                <span style={{ textShadow: '0 3px 0 var(--color-ink)' }}>{t.badge}</span>
              </div>
              <div className="flex items-center justify-between">
                <Stars count={starsOf(progress, topicKey(t.id, 'practice'))} />
                {challengeStars === 3 && (
                  <span className="text-2xl" title="Haaste läpäisty">
                    👑
                  </span>
                )}
              </div>
              <div className="h-4 overflow-hidden rounded-full border-2 border-ink bg-paper">
                <motion.div
                  className="h-full bg-(--topic)"
                  initial={{ width: 0 }}
                  animate={{ width: `${learned}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
              <span className="text-sm font-semibold text-muted">Opittu {learned} %</span>
            </motion.button>
          );
        })}
      </div>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-sm font-semibold text-muted">
        <span>
          {props.storageKind === 'convex'
            ? '☁️ Edistyminen tallessa pilvessä'
            : '💾 Edistyminen tallessa tällä laitteella'}
        </span>
        <button className="underline" onClick={props.onParents}>
          📊 Aikuisille
        </button>
      </footer>
    </Screen>
  );
}
