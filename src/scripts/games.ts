import { questions, quizVerdict, shuffle } from '../lib/games';
import { saveScore, unlock, event } from './storage';

const stage = document.querySelector<HTMLElement>('[data-game]');
const $ = <T extends HTMLElement>(selector: string) =>
  stage!.querySelector<T>(selector)!;
function text(selector: string, value: string | number) {
  $(selector).textContent = String(value);
}
const start = () => event('game_started', { game: stage?.dataset.game });

if (stage?.dataset.game === 'ziemniak') {
  const target = $<HTMLButtonElement>('.potato-target');
  const button = $<HTMLButtonElement>('[data-start]');
  let hits = 0;
  let deadline = 0;
  let interval: ReturnType<typeof setInterval> | undefined;
  const finish = () => {
    clearInterval(interval);
    target.disabled = true;
    button.disabled = false;
    button.textContent = 'Jeszcze raz ↗';
    text('[data-time]', '0.0');
    text(
      '[data-result]',
      `Koniec. ${hits} złapanych ziemniaków. Żadnego obiadu.`,
    );
    saveScore('ziemniak', hits);
    if (hits >= 10) unlock('potato');
  };
  button.addEventListener('click', () => {
    start();
    hits = 0;
    deadline = performance.now() + 20000;
    text('[data-hits]', 0);
    text('[data-time]', '20.0');
    text('[data-result]', 'Złap go, zanim zmieni plany.');
    $('.arena-intro').hidden = true;
    button.disabled = true;
    target.disabled = false;
    target.style.left = '35%';
    target.style.top = '25%';
    target.focus({ preventScroll: true });
    interval = setInterval(() => {
      const remaining = Math.max(0, deadline - performance.now());
      text('[data-time]', (remaining / 1000).toFixed(1));
      if (!remaining) finish();
    }, 80);
  });
  target.addEventListener('click', () => {
    if (performance.now() >= deadline) {
      finish();
      return;
    }
    hits++;
    text('[data-hits]', hits);
    const arena = $('.potato-arena');
    target.style.left = `${Math.random() * Math.max(0, arena.clientWidth - target.offsetWidth)}px`;
    target.style.top = `${Math.random() * Math.max(0, arena.clientHeight - target.offsetHeight)}px`;
  });
}

if (stage?.dataset.game === 'prawda-czy-durnota') {
  let position = 0;
  let score = 0;
  let answered = false;
  let active = false;
  const begin = $<HTMLButtonElement>('[data-start]');
  const next = $<HTMLButtonElement>('[data-next]');
  const show = () => {
    answered = false;
    text('[data-question-number]', position + 1);
    text('[data-question]', questions[position]!.text);
    $('.quiz-options').hidden = false;
    $('[data-explanation]').hidden = true;
    next.hidden = true;
    stage.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach((b) => {
      b.disabled = false;
    });
  };
  begin.addEventListener('click', () => {
    start();
    position = 0;
    score = 0;
    active = true;
    text('[data-points]', 0);
    begin.hidden = true;
    text('[data-result]', 'Czytaj uważnie. Rzeczywistość ma poczucie humoru.');
    show();
  });
  stage.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach((button) =>
    button.addEventListener('click', () => {
      if (!active || answered) return;
      answered = true;
      const q = questions[position]!;
      const right = (button.dataset.answer === 'true') === q.answer;
      if (right) score++;
      text('[data-points]', score);
      stage
        .querySelectorAll<HTMLButtonElement>('[data-answer]')
        .forEach((b) => {
          b.disabled = true;
        });
      const explanation = $('[data-explanation]');
      explanation.replaceChildren();
      const verdict = document.createElement('strong');
      verdict.textContent = right ? 'DOBRZE. ' : 'TUTAJ CIĘ MAMY. ';
      const paragraph = document.createElement('p');
      paragraph.textContent = q.explanation;
      const source = document.createElement('a');
      source.href = q.source;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      source.textContent = `Źródło: ${q.label} ↗`;
      explanation.append(verdict, paragraph, source);
      explanation.hidden = false;
      next.hidden = false;
      next.textContent =
        position === questions.length - 1
          ? 'Zobacz wynik ↗'
          : 'Następne pytanie ↗';
      next.focus({ preventScroll: true });
    }),
  );
  next.addEventListener('click', () => {
    if (!answered) return;
    position++;
    if (position < questions.length) {
      show();
      $<HTMLButtonElement>('[data-answer]').focus({ preventScroll: true });
    } else {
      active = false;
      $('.quiz-options').hidden = true;
      $('[data-explanation]').hidden = true;
      next.hidden = true;
      text('[data-question]', `${score} / 5. ${quizVerdict(score)}`);
      text(
        '[data-result]',
        'Wynik zapisany w tej przeglądarce. Pytania w kolejnej rundzie są te same.',
      );
      begin.hidden = false;
      begin.textContent = 'Jeszcze raz ↗';
      saveScore('quiz', score);
      event('quiz_completed', { score });
      if (score === 5) unlock('quiz');
    }
  });
}

if (stage?.dataset.game === 'refleks') {
  const pad = $<HTMLButtonElement>('[data-reaction]');
  let state: 'idle' | 'waiting' | 'go' | 'complete' = 'idle';
  let timer: ReturnType<typeof setTimeout>;
  let goAt = 0;
  let results: number[] = [];
  const reset = () => {
    clearTimeout(timer);
    state = 'idle';
    results = [];
    pad.dataset.state = '';
    text('[data-round]', 1);
    text('[data-reaction-text]', 'KLIKNIJ, ŻEBY ZACZĄĆ');
    text(
      '[data-reaction-help]',
      'Potem czekaj na zielony ekran i napis TERAZ.',
    );
    text('[data-result]', 'Mysz, dotyk lub spacja. Bez zgadywania.');
  };
  pad.addEventListener('click', () => {
    if (state === 'complete') reset();
    if (state === 'idle') {
      if (!results.length) start();
      state = 'waiting';
      pad.dataset.state = 'waiting';
      text('[data-reaction-text]', 'JESZCZE NIE.');
      text('[data-reaction-help]', 'Czekaj. Niczego nie przyspieszysz.');
      timer = setTimeout(
        () => {
          goAt = performance.now();
          state = 'go';
          pad.dataset.state = 'go';
          text('[data-reaction-text]', 'TERAZ!');
          text('[data-reaction-help]', 'Kliknij. To ten moment.');
        },
        1600 + Math.random() * 3000,
      );
    } else if (state === 'waiting') {
      clearTimeout(timer);
      state = 'idle';
      pad.dataset.state = '';
      text('[data-reaction-text]', 'FALSTART.');
      text(
        '[data-reaction-help]',
        'Spokojnie. Kliknij, żeby powtórzyć tę próbę.',
      );
    } else if (state === 'go') {
      const result = Math.round(performance.now() - goAt);
      results.push(result);
      pad.dataset.state = '';
      state = 'idle';
      text('[data-reaction-text]', `${result} ms`);
      text('[data-reaction-help]', 'Kliknij, żeby rozpocząć kolejną próbę.');
      text('[data-result]', `Próby: ${results.join(' · ')} ms`);
      if (results.length === 3) {
        const median = [...results].sort((a, b) => a - b)[1]!;
        state = 'complete';
        text('[data-reaction-text]', `MEDIANA: ${median} ms`);
        text(
          '[data-reaction-help]',
          'Trzy próby zakończone. Kliknij, żeby zagrać ponownie.',
        );
        saveScore('refleks', median, true);
      } else text('[data-round]', results.length + 1);
    }
  });
  $('[data-reset]').addEventListener('click', reset);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (state === 'waiting' || state === 'go')) {
      clearTimeout(timer);
      state = 'idle';
      pad.dataset.state = '';
      text('[data-reaction-text]', 'PRÓBA PRZERWANA');
      text('[data-reaction-help]', 'Wróć i kliknij, żeby powtórzyć.');
    }
  });
}

if (stage?.dataset.game === 'pamiec') {
  const grid = $('.memory-grid');
  let selected: HTMLButtonElement[] = [];
  let locked = false;
  let pairs = 0;
  let moves = 0;
  let timer: ReturnType<typeof setTimeout>;
  const symbols = ['✳', '⚑', '★', '☂', '☕', '⚄'];
  const deal = () => {
    clearTimeout(timer);
    selected = [];
    locked = false;
    pairs = 0;
    moves = 0;
    text('[data-pairs]', 0);
    text('[data-moves]', 0);
    grid.replaceChildren();
    text('[data-result]', 'Odkryj dwie karty. Znajdź wszystkie pary.');
    shuffle([...symbols, ...symbols]).forEach((symbol, i) => {
      const card = document.createElement('button');
      card.className = 'memory-card';
      card.textContent = '?';
      card.setAttribute('aria-label', `Odkryj kartę ${i + 1}`);
      card.addEventListener('click', () => {
        if (locked || card.disabled || selected.includes(card)) return;
        card.textContent = symbol;
        card.dataset.symbol = symbol;
        card.classList.add('flipped');
        card.setAttribute('aria-label', `Karta ${i + 1}: ${symbol}`);
        selected.push(card);
        if (selected.length !== 2) return;
        moves++;
        text('[data-moves]', moves);
        if (selected[0]!.dataset.symbol === selected[1]!.dataset.symbol) {
          selected.forEach((c) => {
            c.disabled = true;
            c.classList.add('matched');
          });
          selected = [];
          pairs++;
          text('[data-pairs]', pairs);
          if (pairs === 6) {
            text(
              '[data-result]',
              `Wszystkie pary! ${moves} ruchów. Pamięć działa. Przynajmniej dzisiaj.`,
            );
            saveScore('pamiec', moves, true);
            unlock('memory');
          }
        } else {
          locked = true;
          timer = setTimeout(() => {
            selected.forEach((c) => {
              c.textContent = '?';
              c.classList.remove('flipped');
              c.setAttribute(
                'aria-label',
                `Odkryj kartę ${Array.from(grid.children).indexOf(c) + 1}`,
              );
            });
            selected = [];
            locked = false;
          }, 950);
        }
      });
      grid.append(card);
    });
  };
  $('[data-start]').addEventListener('click', () => {
    start();
    deal();
    text('[data-start]', 'Rozdaj od nowa ↗');
  });
  deal();
}

if (stage?.dataset.game === 'wymowki') {
  const reasons = [
    'nagłego przesunięcia środka ciężkości kanapy',
    'niezapowiedzianej kontroli jakości sufitu',
    'pilnej konsultacji z ziemniakiem',
    'wyczerpania miesięcznego limitu sensu',
    'awarii wewnętrznego działu motywacji',
    'sezonowej migracji dobrych chęci',
    'kolizji obowiązków z rzeczywistością',
    'konieczności ponownego przemyślenia poniedziałku',
  ];
  const endings = [
    'Termin powrotu do rzeczywistości pozostaje nieustalony.',
    'Za utrudnienia przeprasza dział okoliczności.',
    'Prosimy nie odpowiadać. Dokument się wstydzi.',
    'Sprawę przekazano do szuflady z napisem „potem”.',
  ];
  const subjects: Record<string, string> = {
    praca: 'wykonywanie pracy',
    spotkanie: 'udział w spotkaniu',
    sprzatanie: 'sprzątanie',
    wszystko: 'podejmowanie jakichkolwiek działań',
  };
  let last = -1;
  $('[data-start]').addEventListener('click', () => {
    start();
    let index = Math.floor(Math.random() * reasons.length);
    if (index === last) index = (index + 1) % reasons.length;
    last = index;
    const context = $<HTMLSelectElement>('#excuse-context').value;
    text(
      '[data-excuse]',
      `Niniejszym zaświadcza się, że ${subjects[context]} jest dziś niemożliwe z powodu ${reasons[index]}. ${endings[Math.floor(Math.random() * endings.length)]}`,
    );
    $<HTMLButtonElement>('[data-copy]').disabled = false;
    event('excuse_generated', { context });
  });
  $('[data-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('[data-excuse]').textContent!);
      text('[data-result]', 'Skopiowano. Pieczątka zostaje u nas.');
    } catch {
      text(
        '[data-result]',
        'Nie udało się skopiować automatycznie. Zaznacz tekst zaświadczenia.',
      );
    }
  });
}
