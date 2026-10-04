import { motion } from 'motion/react';
import { useState } from 'react';
import { sfx } from '../audio/sfx';
import { AVATARS } from '../config';
import type { Player } from '../logic/types';
import { Screen, Teacher } from '../components/ui';

interface Props {
  players: Player[];
  onPick: (player: Player) => void;
  onCreate: (avatar: string) => void;
}

export function PlayersScreen({ players, onPick, onCreate }: Props) {
  const [creating, setCreating] = useState(players.length === 0);
  const nameOf = (emoji: string) => AVATARS.find((a) => a.emoji === emoji)?.name ?? '';

  return (
    <Screen>
      <h1 className="mt-4 text-center text-5xl font-bold sm:text-7xl">
        Matikka<span className="text-tomato">seikkailu</span> 🚀
      </h1>
      <Teacher say={creating ? 'Valitse oma eläin!' : 'Kuka harjoittelee tänään?'}>
        {creating ? 'Valitse oma eläin!' : 'Kuka harjoittelee tänään?'}
      </Teacher>

      {creating ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
          {AVATARS.map((a, i) => (
            <motion.button
              key={a.emoji}
              className="chunky flex aspect-square flex-col items-center justify-center bg-white"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => {
                sfx.correct();
                onCreate(a.emoji);
              }}
            >
              <span className="text-6xl sm:text-7xl">{a.emoji}</span>
              <span className="text-base font-semibold sm:text-lg">{a.name}</span>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {players.map((p) => (
            <button
              key={p.id}
              className="chunky flex aspect-square flex-col items-center justify-center bg-white"
              onClick={() => {
                sfx.tap();
                onPick(p);
              }}
            >
              <span className="text-7xl sm:text-8xl">{p.avatar}</span>
              <span className="text-xl font-semibold">{nameOf(p.avatar)}</span>
            </button>
          ))}
          <button
            className="chunky flex aspect-square flex-col items-center justify-center border-dashed bg-sun-soft"
            onClick={() => setCreating(true)}
          >
            <span className="text-6xl font-bold">+</span>
            <span className="text-xl font-semibold">Uusi</span>
          </button>
        </div>
      )}
      {creating && players.length > 0 && (
        <button
          className="self-center text-lg font-semibold underline"
          onClick={() => setCreating(false)}
        >
          Takaisin
        </button>
      )}
    </Screen>
  );
}
