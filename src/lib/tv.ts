export const channels = [
  {
    id: 1,
    name: 'Durnoty',
    title: 'Przerwa na nic',
    description:
      'Autorski mikroprogram o tym, że nie wszystko musi się wydarzyć. 15 sekund bez zobowiązań.',
    file: '/tv/przerwa.mp4',
    poster: '/tv/przerwa.png',
    captions: '/tv/przerwa.vtt',
  },
  {
    id: 2,
    name: 'Przyroda',
    title: 'Ziemniak w swoim naturalnym środowisku',
    description:
      'Obserwacja terenowa ziemniaka biurowego. Ilustracja animowana, nie dokument przyrodniczy.',
    file: '/tv/ziemniak.mp4',
    poster: '/tv/ziemniak.png',
    captions: '/tv/ziemniak.vtt',
  },
  {
    id: 3,
    name: 'Komunikaty',
    title: 'Prognoza niepogody w internecie',
    description:
      'Satyryczny komunikat redakcyjny: lokalne przejaśnienia rozsądku. Prosimy nie traktować jako prognozy meteorologicznej.',
    file: '/tv/prognoza.mp4',
    poster: '/tv/prognoza.png',
    captions: '/tv/prognoza.vtt',
  },
];
export function nextChannel(index: number, length: number): number {
  return length > 0 ? (index + 1) % length : 0;
}
