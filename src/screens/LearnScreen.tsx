import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { ExplainPlayer } from '../components/ExplainPlayer';
import { TenFrame } from '../components/TenFrame';
import { BackButton, Screen } from '../components/ui';
import { topicStyle } from '../components/topicStyle';
import { fillFrames } from '../logic/scenes';
import { allFacts, explain, makeQuestion, questionFromFact } from '../logic/questions';
import { topicInfo } from '../logic/topics';
import type { Question, TopicId } from '../logic/types';

interface Props {
  topic: TopicId;
  onBack: () => void;
  onPractice: () => void;
}

/** All ten-pairs at a glance – the key to bridging ten. */
function PairsChart() {
  return (
    <div className="panel grid grid-cols-1 gap-2 p-4 sm:grid-cols-3">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((a, i) => (
        <motion.div
          key={a}
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <TenFrame
            cells={
              fillFrames([
                ['red', a],
                ['blue', 10 - a],
              ])[0] ?? []
            }
            size="sm"
          />
          <span className="text-2xl font-bold">
            <span className="text-tomato">{a}</span> + <span className="text-sky">{10 - a}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function pickExample(topic: TopicId, current: Question): Question {
  const facts = allFacts(topic).filter((id) => id !== current.factId);
  const id = facts[Math.floor(Math.random() * facts.length)];
  return (id && questionFromFact(id)) || current;
}

export function LearnScreen({ topic, onBack, onPractice }: Props) {
  const info = topicInfo(topic);
  const [example, setExample] = useState(() => makeQuestion(topic, ...info.example));
  const steps = useMemo(() => explain(example), [example]);

  return (
    <Screen>
      <div style={topicStyle(info.color)} className="flex flex-1 flex-col gap-5">
        <div className="flex items-center gap-3">
          <BackButton onClick={onBack} />
          <h1 className="flex-1 text-2xl leading-tight font-bold sm:text-4xl">📖 {info.title}</h1>
          <button
            className="chunky h-14 bg-white px-4 text-lg font-bold"
            onClick={() => setExample((q) => pickExample(topic, q))}
          >
            🔀 <span className="hidden sm:inline">Uusi esimerkki</span>
          </button>
        </div>
        <ExplainPlayer
          key={example.factId}
          steps={steps}
          onDone={onPractice}
          doneLabel="✏️ Harjoittelemaan!"
        />
        {topic === 'pairs10' && (
          <>
            <h2 className="text-2xl font-bold">Kaikki kymppikaverit</h2>
            <PairsChart />
          </>
        )}
      </div>
    </Screen>
  );
}
