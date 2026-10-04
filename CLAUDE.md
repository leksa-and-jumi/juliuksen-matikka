# CLAUDE.md

Tämä repo kuuluu Julius (7 v) ja Leo (10 v) -veljesten pelistudioon (GitHub-organisaatio `leksa-and-jumi`). Vanhempi valvoo aina istuntoja.

**Juliuksen matikkaseikkailu** on opetussovellus, joka opettaa 7-vuotiaalle matematiikan perusasioita kuvien ja animaatioiden avulla: lukujen vertailu (`<`, `>`, `=`), yhteen- ja vähennyslasku kymppiin asti, kymppikaverit, kymmenen ylitys plussalla ja miinuksella sekä hämähäkin kymppihypyt satataulussa (koulun _What's the calculation?_ -tehtävä). Julius päättää, mitä aiheita, hahmoja ja palkintoja tulee lisää.

## Näin puhut Juliukselle

- **Aina suomeksi**, lyhyesti (2–4 lausetta), hauskasti ja kannustavasti. Emojit auttavat (🧮⭐🚀).
- Julius ei välttämättä lue vielä sujuvasti: vanhempi voi lukea viestit ääneen.
- **Vain Juliukselle**: ei git-, PR- tai tekniikkapuhetta. Tekniikka hoidetaan hiljaa.
- Kysy **yksi asia kerrallaan**, 2–4 vaihtoehtoa emojeineen + "✨ keksi oma".
- Jos vanhempi kysyy jotain suoraan, vastaa hänelle lyhyesti.

## Opetuksen periaatteet (älä riko näitä)

- **Konkreettinen → kuva → symboli.** Jokainen aihe näytetään ensin kymppiruudukoilla (punaiset = ensimmäinen luku, siniset = toinen luku), lukupareilla ja krokotiililla, vasta sitten pelkillä numeroilla.
- **Kymmenen ylitys aina kympin kautta**: 8 + 5 = 8 + 2 + 3, 13 − 5 = 13 − 3 − 2. Harjoittele-tilassa kolme pientä vaihetta (täytä kymppi → pilko → laske loput).
- **Toisto**: väärä vastaus → ratkaisu näytetään animaationa → sama tehtävä tulee kierroksen lopussa uudestaan. Leitner-laatikot (1–5) päättävät, mitä kysytään useammin. Päivän treeni kertaa kaikkia pelattuja aiheita.
- **Ei rangaistuksia eikä aikapainetta.** Kierroksen lopusta saa aina vähintään yhden tähden.
- **Satataulu**: hyppy alas = +10, ylös = −10, ykköset pysyvät samoina. Harjoittelussa näytetään koulun monisteen tapaan pala satataulua (3 saraketta).
- Tekstit luetaan ääneen (Web Speech API, `fi-FI`).

## Turvallisuus

- Pelaajat ovat eläimiä (🦊🐻🦖…): **ei nimiä, ikää, kuvia tai muita henkilötietoja** sovellukseen eikä Convexiin.
- Ei chattia, verkkomoninpeliä, mainoksia, seurantaa tai ostoja.
- Älä koskaan commitoi salaisuuksia: `.env.local` on gitignoressa. Deploy-avaimia ei tulosteta.

## Tekniikka

- **React 19 + TypeScript (strict) + Vite**, Tailwind CSS v4, Motion (animaatiot), canvas-confetti, Fredoka-fontti (paikallisesti, ei Google Fonts -kutsuja).
- **Convex** tallentaa edistymisen (pelaajat, Leitner-laatikot, päivät, tähdet). Jos `VITE_CONVEX_URL` puuttuu, sovellus tallentaa vain selaimen localStorageen – kaikki toimii silti.
- Rakenne:
  - `src/config.ts` – kaikki vakiot. Ei maagisia numeroita muualla.
  - `src/logic/` – puhdas logiikka (tehtävät, selitykset, Leitner, kierros). **Jokaisella logiikkatiedostolla on testi.**
  - `src/components/` – kymppiruudukko, krokotiili, lukupari, yhtälö, näppäimistöt.
  - `src/screens/` – näkymät. `src/data/` – tallennus (Convex / local). `src/audio/` – äänet ja puhe.
  - `convex/` – skeema ja funktiot. `convex/_generated` commitoidaan (päivittyy `npm run convex:dev`:llä).
- Uusi aihe: lisää `TopicId`, rivi `TOPICS`-listaan, faktat `allFacts`iin, `makeQuestion` ja `explain` – ja testit.

## Ympäristömuuttujat

`.env.local` (pohja `.env.example`):

| Muuttuja                 | Mihin                                                       |
| ------------------------ | ----------------------------------------------------------- |
| `CONVEX_DEPLOY_KEY_DEV`  | `npm run convex:dev` (dev-deployment)                       |
| `CONVEX_DEPLOY_KEY_PROD` | `npm run convex:deploy` + GitHub-secret `CONVEX_DEPLOY_KEY` |
| `VITE_CONVEX_URL`        | Dev-deploymentin URL paikallista `npm run dev`:iä varten    |

GitHub Actions -deploy käyttää secretiä `CONVEX_DEPLOY_KEY` (prod-avain): se deployaa Convex-funktiot ja buildaa sivun tuotanto-URL:lla. Ilman secretiä sivu buildataan localStorage-tilaan.

## Kehitysputki (aina sama)

1. Idea → GitHub issue (otsikko englanniksi, kuvaus Juliuksen omin sanoin suomeksi).
2. Uusi haara mainista: `feat/…`, `fix/…`, `chore/…`, `docs/…`.
3. Pienet commitit, Conventional Commits englanniksi.
4. PR pohjan mukaan: tekninen kuvaus englanniksi + osio **Juliukselle**. `Closes #n`.
5. `npm run check` ja `npm run build` paikallisesti. CI:n pitää olla vihreä.
6. Julius kokeilee ja sanoo "hyvä". Vasta sitten **squash merge** ja haaran poisto.
7. `main` on suojattu. Merge julkaisee automaattisesti GitHub Pagesiin.

## Komennot

| Komento                 | Mitä tekee                                   |
| ----------------------- | -------------------------------------------- |
| `npm install`           | Asentaa riippuvuudet                         |
| `npm run dev`           | Käynnistää sovelluksen kehityspalvelimelle   |
| `npm run convex:dev`    | Convex dev -synkronointi (dev deploy key)    |
| `npm run convex:deploy` | Convex-funktiot tuotantoon (prod deploy key) |
| `npm run check`         | Tyypit, lint, muotoilu ja testit             |
| `npm run build`         | Tuotantoversio `dist/`-kansioon              |
| `npm run format`        | Korjaa muotoilun                             |
