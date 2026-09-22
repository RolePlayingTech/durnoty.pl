export const games = [
  {
    slug: 'ziemniak',
    title: 'Kliknij ziemniaka',
    kicker: '20 SEKUND · ZRĘCZNOŚĆ',
    description: 'On ma plany. Ty masz palec. Złap go jak najwięcej razy.',
    symbol: 'potato',
    color: 'yellow',
  },
  {
    slug: 'guzik',
    title: 'Czerwony Guzik',
    kicker: 'NIE NACISKAĆ · REAKTANCJA',
    description: 'Oficjalny zakaz dotykania. Zobaczmy, ile sekund wytrzymasz, zanim natura weźmie górę.',
    symbol: '●',
    color: 'red',
  },
  {
    slug: 'prawda-czy-durnota',
    title: 'Prawda czy durnota?',
    kicker: '5 PYTAŃ · QUIZ',
    description: 'Brzmi jak bzdura. I właśnie dlatego trzeba sprawdzić.',
    symbol: '?',
    color: 'red',
  },
  {
    slug: 'refleks',
    title: 'Jeszcze nie. TERAZ.',
    kicker: '3 PRÓBY · REFLEKS',
    description: 'Poczekaj na zielone. To cała instrukcja. Naprawdę.',
    symbol: '↯',
    color: 'mint',
  },
  {
    slug: 'pamiec',
    title: 'Gdzie ja to…',
    kicker: '6 PAR · PAMIĘĆ',
    description: 'Dwanaście kartek. Sześć par. Jedna podejrzana pamięć.',
    symbol: '✳',
    color: 'blue',
  },
  {
    slug: 'wymowki',
    title: 'Generator wymówek',
    kicker: 'BEZ LIMITU · BIUROKRACJA',
    description: 'Urzędowe usprawiedliwienie absolutnie wszystkiego.',
    symbol: '§',
    color: 'paper',
  },
] as const;

export const questions = [
  {
    text: 'Australia wysłała żołnierzy z karabinami maszynowymi przeciwko emu.',
    answer: true,
    explanation:
      'Tak. W 1932 r. próbowano w ten sposób ograniczyć szkody w uprawach. „Wojna” to medialne określenie operacji.',
    source: 'https://en.wikipedia.org/wiki/Emu_War',
    label: 'Historia operacji',
  },
  {
    text: 'Ośmiornica ma tylko jedno serce. Jak każdy porządny bohater romansu.',
    answer: false,
    explanation:
      'Ma trzy. Dwa pompują krew przez skrzela, trzecie do reszty ciała.',
    source:
      'https://www.nhm.ac.uk/discover/octopuses-keep-surprising-us-here-are-eight-examples-how.html',
    label: 'Natural History Museum',
  },
  {
    text: 'Słowo „bug” zaczęło oznaczać usterkę dopiero po znalezieniu ćmy w komputerze w 1947 r.',
    answer: false,
    explanation:
      'Ćma była prawdziwa, ale termin „bug” znali już wcześniejsi inżynierowie. Używał go m.in. Edison.',
    source: 'https://americanhistory.si.edu/collections/object/nmah_334663',
    label: 'Smithsonian',
  },
  {
    text: 'Pełny obrót Wenus względem gwiazd trwa dłużej niż jej obieg Słońca.',
    answer: true,
    explanation:
      'Około 243 ziemskich dni wobec 225. Doba słoneczna to inne pojęcie: trwa około 117 dni.',
    source: 'https://science.nasa.gov/venus/venus-facts/',
    label: 'NASA',
  },
  {
    text: 'Natleniona krew ośmiornicy ma niebieskawy kolor.',
    answer: true,
    explanation:
      'Za transport tlenu odpowiada hemocyjanina zawierająca miedź. U nas tę funkcję pełni hemoglobina z żelazem.',
    source:
      'https://www.nhm.ac.uk/discover/octopuses-keep-surprising-us-here-are-eight-examples-how.html',
    label: 'Natural History Museum',
  },
];
export function quizVerdict(score: number): string {
  return score === 5
    ? 'Internet jeszcze Cię nie pokonał.'
    : score >= 3
      ? 'Zdrowy rozsądek: częściowo sprawny.'
      : 'Nie wszystko, co brzmi głupio, jest zmyślone.';
}
/** Fisher–Yates; accepts deterministic randomness for reproducible tests. */
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}
export function pickRandom<T extends { id: string }>(
  items: T[],
  previous?: string,
): T | undefined {
  const pool =
    items.length > 1 ? items.filter((item) => item.id !== previous) : items;
  return pool[Math.floor(Math.random() * pool.length)];
}
