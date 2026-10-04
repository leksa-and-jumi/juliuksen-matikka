import { motion } from 'motion/react';
import { starsOf, topicKey } from '../logic/progress';
import { topicInfo } from '../logic/topics';
import type { Mode, Progress, TopicId } from '../logic/types';
import { BackButton, Screen, Stars, Teacher } from '../components/ui';
import { topicStyle } from '../components/topicStyle';

interface Props {
  topic: TopicId;
  progress: Progress;
  onBack: () => void;
  onLearn: () => void;
  onPractice: (mode: Mode) => void;
}

export function TopicScreen({ topic, progress, onBack, onLearn, onPractice }: Props) {
  const info = topicInfo(topic);
  const practiceStars = starsOf(progress, topicKey(topic, 'practice'));
  const challengeStars = starsOf(progress, topicKey(topic, 'challenge'));

  const actions = [
    {
      key: 'learn',
      emoji: '📖',
      title: 'Opi',
      text: 'Katso, miten se tehdään',
      bg: 'bg-white',
      onClick: onLearn,
      stars: null,
    },
    {
      key: 'practice',
      emoji: '✏️',
      title: 'Harjoittele',
      text: info.stepped ? 'Askel askeleelta' : 'Kuvat auttavat',
      bg: 'bg-sun',
      onClick: () => onPractice('practice'),
      stars: practiceStars,
    },
    {
      key: 'challenge',
      emoji: '🚀',
      title: 'Haaste',
      text: 'Osaatko ilman apua?',
      bg: 'bg-(--topic) text-white',
      onClick: () => onPractice('challenge'),
      stars: challengeStars,
    },
  ];

  return (
    <Screen>
      <div style={topicStyle(info.color)} className="flex flex-col gap-5 sm:gap-6">
        <div className="flex items-center gap-3">
          <BackButton onClick={onBack} />
          <h1 className="text-3xl leading-tight font-bold sm:text-5xl">
            {info.emoji} {info.title}
          </h1>
        </div>

        <div className="panel flex items-center justify-center bg-(--topic) py-8 sm:py-12">
          <motion.span
            className="text-7xl font-bold text-white sm:text-9xl"
            style={{ textShadow: '0 6px 0 var(--color-ink)' }}
            initial={{ scale: 0.5, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14 }}
          >
            {info.badge}
          </motion.span>
        </div>

        <Teacher say={`${info.title}. ${info.subtitle} Aloita kohdasta Opi!`}>
          {info.subtitle} Aloita kohdasta <b>Opi</b>!
        </Teacher>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {actions.map((a, i) => (
            <motion.button
              key={a.key}
              className={`chunky flex flex-row items-center gap-4 p-5 text-left sm:flex-col sm:text-center ${a.bg}`}
              onClick={a.onClick}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <span className="text-6xl">{a.emoji}</span>
              <span className="flex flex-1 flex-col gap-1 sm:items-center">
                <span className="text-3xl font-bold">{a.title}</span>
                <span className="text-lg font-semibold opacity-80">{a.text}</span>
                {a.stars !== null && <Stars count={a.stars} />}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
