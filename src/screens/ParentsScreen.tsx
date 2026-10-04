import { BackButton, Screen } from '../components/ui';
import { MASTERED_BOX, PARENT_DAYS, PARENT_WEAK_FACTS } from '../config';
import { mastery, statsMap } from '../logic/leitner';
import { dayKey, topicKey } from '../logic/progress';
import { allFacts, factLabel } from '../logic/questions';
import { TOPICS } from '../logic/topics';
import type { Progress } from '../logic/types';

interface Props {
  progress: Progress;
  storageKind: 'convex' | 'local';
  onBack: () => void;
}

/** Overview for grown-ups: what has been practised and what is still hard. */
export function ParentsScreen({ progress, storageKind, onBack }: Props) {
  const stats = statsMap(progress.facts);
  const days = Array.from({ length: PARENT_DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (PARENT_DAYS - 1 - i));
    const key = dayKey(d);
    return { key, label: d.getDate(), stat: progress.days.find((x) => x.day === key) };
  });
  const maxAnswers = Math.max(1, ...days.map((d) => d.stat?.answers ?? 0));
  const weak = [...progress.facts]
    .filter((f) => f.wrong > 0 && f.box < MASTERED_BOX)
    .sort((a, b) => a.box - b.box || b.wrong - a.wrong)
    .slice(0, PARENT_WEAK_FACTS);
  const sessions = (key: string) => progress.topics.find((t) => t.key === key)?.sessions ?? 0;

  return (
    <Screen>
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <h1 className="text-3xl font-bold sm:text-4xl">📊 Aikuisille</h1>
      </div>

      <section className="panel p-5 text-lg">
        <h2 className="mb-2 text-2xl font-bold">Miten tämä opettaa?</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <b>Opi</b>: jokainen aihe näytetään askel askeleelta kymppiruudukoilla, lukupareilla ja
            krokotiilillä. Teksti luetaan ääneen.
          </li>
          <li>
            <b>Harjoittele</b>: kuvat ovat mukana. Kymmenen ylitys tehdään kolmessa pienessä
            vaiheessa (täytä kymppi → pilko → laske loput).
          </li>
          <li>
            <b>Haaste</b>: ilman kuvia, apua saa pyytää. Väärän vastauksen jälkeen ratkaisu
            näytetään ja tehtävä tulee kierroksen lopussa uudestaan.
          </li>
          <li>
            <b>Päivän treeni</b> kertaa kaikkia harjoiteltuja aiheita. Jokainen laskutoimitus on
            omassa Leitner-laatikossaan (1–5): virhe palauttaa laatikkoon 1, joten vaikeat tulevat
            useammin.
          </li>
        </ul>
        <p className="mt-3 text-base text-muted">
          Tallennus:{' '}
          {storageKind === 'convex' ? 'Convex-pilvi (kaikki laitteet)' : 'vain tämä selain'}
        </p>
      </section>

      <section className="panel p-5">
        <h2 className="mb-3 text-2xl font-bold">Viimeiset {PARENT_DAYS} päivää</h2>
        <div className="flex h-36 items-end gap-1">
          {days.map((d) => {
            const answers = d.stat?.answers ?? 0;
            const correct = d.stat?.correct ?? 0;
            return (
              <div
                key={d.key}
                className="flex flex-1 flex-col items-center gap-1"
                title={`${d.key}: ${correct}/${answers}`}
              >
                <div className="flex w-full flex-1 flex-col justify-end">
                  <div
                    className="w-full rounded-t-md border-2 border-ink bg-grass"
                    style={{
                      height: `${(answers / maxAnswers) * 100}%`,
                      minHeight: answers ? 6 : 0,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-muted">{d.label}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-muted">Pylväs = vastattujen tehtävien määrä päivässä.</p>
      </section>

      <section className="panel overflow-x-auto p-5">
        <h2 className="mb-3 text-2xl font-bold">Aiheet</h2>
        <table className="w-full text-left text-lg">
          <thead>
            <tr className="border-b-4 border-ink">
              <th className="py-2">Aihe</th>
              <th>Opittu</th>
              <th>Harjoittelu</th>
              <th>Haaste</th>
            </tr>
          </thead>
          <tbody>
            {TOPICS.map((t) => (
              <tr key={t.id} className="border-b-2 border-ink/10">
                <td className="py-2 font-semibold">
                  {t.emoji} {t.title}
                </td>
                <td>{Math.round(mastery(allFacts(t.id), stats) * 100)} %</td>
                <td>{sessions(topicKey(t.id, 'practice'))} krt</td>
                <td>{sessions(topicKey(t.id, 'challenge'))} krt</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel p-5">
        <h2 className="mb-3 text-2xl font-bold">Vielä harjoiteltavaa</h2>
        {weak.length === 0 ? (
          <p className="text-lg">Ei vaikeita tehtäviä juuri nyt. 🎉</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {weak.map((f) => (
              <span
                key={f.factId}
                className="rounded-2xl border-4 border-ink bg-white px-3 py-1 text-xl font-bold"
              >
                {factLabel(f.factId)}{' '}
                <span className="text-base font-semibold text-muted">
                  ✓{f.correct} ✗{f.wrong}
                </span>
              </span>
            ))}
          </div>
        )}
      </section>
    </Screen>
  );
}
