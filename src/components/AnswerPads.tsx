import { sfx } from '../audio/sfx';
import type { CompareSign } from '../logic/types';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface NumberPadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  disabled?: boolean;
}

export function NumberPad({ onDigit, onDelete, onSubmit, canSubmit, disabled }: NumberPadProps) {
  const key = 'chunky flex h-16 items-center justify-center text-4xl font-bold sm:h-20 sm:text-5xl';
  const press = (fn: () => void) => () => {
    sfx.tap();
    fn();
  };
  return (
    <div className="mx-auto grid w-full max-w-sm grid-cols-3 gap-3 sm:gap-4">
      {DIGITS.map((d) => (
        <button
          key={d}
          className={`${key} bg-white`}
          onClick={press(() => onDigit(d))}
          disabled={disabled}
        >
          {d}
        </button>
      ))}
      <button
        className={`${key} bg-sun-soft`}
        onClick={press(onDelete)}
        disabled={disabled}
        aria-label="Poista"
      >
        ⌫
      </button>
      <button className={`${key} bg-white`} onClick={press(() => onDigit('0'))} disabled={disabled}>
        0
      </button>
      <button
        className={`${key} bg-grass text-white`}
        onClick={onSubmit}
        disabled={disabled || !canSubmit}
        aria-label="Valmis"
      >
        ✓
      </button>
    </div>
  );
}

const SIGNS: { sign: CompareSign; label: string }[] = [
  { sign: '<', label: 'pienempi' },
  { sign: '=', label: 'yhtä suuri' },
  { sign: '>', label: 'suurempi' },
];

export function SignPad({
  onPick,
  disabled,
}: {
  onPick: (sign: CompareSign) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-3 sm:gap-4 md:grid-cols-1">
      {SIGNS.map(({ sign, label }) => (
        <button
          key={sign}
          className="chunky flex h-28 flex-col items-center justify-center bg-grass text-white sm:h-32"
          onClick={() => {
            sfx.tap();
            onPick(sign);
          }}
          disabled={disabled}
          aria-label={label}
        >
          <span className="text-6xl leading-none font-bold sm:text-7xl">{sign}</span>
          <span className="mt-1 text-sm font-semibold sm:text-base">{label}</span>
        </button>
      ))}
    </div>
  );
}
