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

if (stage?.dataset.game === 'guzik') {
  const btn = $<HTMLButtonElement>('[data-main-red-button]');
  const resetBtn = $<HTMLButtonElement>('[data-reset-button]');
  const reactionBox = $('[data-reaction-box]');
  const casing = $('.button-casing');
  let startTime = performance.now();
  let clicks = 0;
  let timerInterval: ReturnType<typeof setInterval> | undefined;
  let clicked = false;

  const timerTick = () => {
    if (clicked) return;
    const elapsed = (performance.now() - startTime) / 1000;
    text('[data-resistance-time]', elapsed.toFixed(1));
  };
  timerInterval = setInterval(timerTick, 100);

  const buttonReactions = [
    'Mówiłem: NIE NACISKAĆ. Dlaczego to zrobiłeś?',
    'Drugi raz? To już nie przypadek. To wybór życiowy.',
    'Trzy kliknięcia. Twój poziom silnej woli szacujemy na 4%.',
    'Przycisk odnotował Twoje nieposłuszeństwo i wysłał raport do nikogo.',
    'Czy naciskanie czerwonych rzeczy sprawia Ci ulgę egzystencjalną?',
    'Oficjalny komunikat: Przycisk zaczyna czuć się niekomfortowo.',
    'Nacisnąłeś 7 razy. W tym czasie ktoś inny przeczytał wiersz Szymborskiej.',
    'Stop. Zastanów się nad sobą. Odsuń dłoń od myszy lub ekranu.',
    'Przycisk oficjalnie przechodzi w stan biernego oporu.',
    'Dziesięć! Gratulacje. Właśnie udowodniłeś hipotezę o reaktancji.',
    'Dobra, naciśnij jeszcze raz. Zobaczymy, czy zepsujesz internet.',
    'System ostrzega: kolejne kliknięcie grozi natychmiastowym niczym.',
    'Ziemniak w sąsiedniej grze patrzy na Ciebie z rozczarowaniem.',
    'W 1932 Australia walczyła z emu. Ty walczysz z czerwonym kółkiem.',
    'Klik, klik, klik. A zadania w pracy same się nie odłożą na jutro.',
    'Dwadzieścia kliknięć. Otrzymujesz tytuł Naczelnego Reaktora Kraju.',
    'Czy wiesz, że ten guzik nie ma żadnych kabli z tyłu?',
    'Przycisk postanowił Ci wybaczyć, ale niesmak pozostał.',
    'Każde kliknięcie przybliża Cię do emerytury o zero sekund.',
    'Osiągnięto stan absolutnej durnoty. Jesteś u siebie.',
  ];

  btn.addEventListener('click', () => {
    if (!clicked) {
      clicked = true;
      clearInterval(timerInterval);
      const resistanceSeconds = Number(
        ((performance.now() - startTime) / 1000).toFixed(1),
      );
      text('[data-resistance-time]', resistanceSeconds.toFixed(1));
      saveScore('guzik-opor', resistanceSeconds);
      start();
      unlock('first-click');
    }

    clicks++;
    text('[data-clicks-count]', clicks);
    saveScore('guzik-kliki', clicks);

    casing.classList.remove('button-shake');
    void casing.offsetWidth;
    casing.classList.add('button-shake');

    const reaction =
      buttonReactions[Math.min(clicks - 1, buttonReactions.length - 1)]!;
    reactionBox.textContent = reaction;

    if (clicks >= 10) {
      unlock('button');
      text(
        '[data-result]',
        `Kliknięć: ${clicks}. Diagnoza psychologiczna: 100% odporności na zakazy.`,
      );
    } else {
      text('[data-result]', `Kliknięć: ${clicks}. Test reaktancji w toku.`);
    }

    event('button_pressed', { clicks });
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    clicked = false;
    clicks = 0;
    startTime = performance.now();
    text('[data-resistance-time]', '0.0');
    text('[data-clicks-count]', 0);
    reactionBox.textContent =
      'Licznik zresetowany. Spróbuj nie kliknąć ani razu. Czas start!';
    text(
      '[data-result]',
      'Psychologia nazywa to reaktancją. Przycisk nazywa to durnotą.',
    );
    timerInterval = setInterval(timerTick, 100);
  });
}

if (stage?.dataset.game === 'kable') {
  interface NodePoint {
    id: number;
    x: number;
    y: number;
    label: string;
    radius: number;
  }
  interface Edge {
    u: number;
    v: number;
  }

  const canvas = stage.querySelector<HTMLCanvasElement>('#cable-canvas')!;
  const ctx = canvas.getContext('2d')!;
  const overlay = stage.querySelector<HTMLElement>('[data-cable-overlay]')!;
  const winText = stage.querySelector<HTMLElement>('[data-cable-win-text]')!;
  const diffButtons = stage.querySelectorAll<HTMLButtonElement>('[data-diff]');
  const shuffleBtn = stage.querySelector<HTMLButtonElement>('[data-cable-shuffle]')!;
  const restartBtn = stage.querySelector<HTMLButtonElement>('[data-cable-restart]')!;

  let nodes: NodePoint[] = [];
  let edges: Edge[] = [];
  let draggedNode: NodePoint | null = null;
  let dragOffset = { x: 0, y: 0 };
  let moves = 0;
  let startTime = performance.now();
  let timerInterval: ReturnType<typeof setInterval> | undefined;
  let won = false;
  let currentDiff = 'easy';

  const labels = ['USB-C', 'JACK', 'HDMI', 'PWR', 'AUX', 'LIGHT', 'LAN', 'VGA', 'DISPLAY', 'OPTIC', 'MINI'];

  function ccw(p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }) {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  }

  function doIntersect(p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }, p4: { x: number; y: number }) {
    if (
      Math.max(p1.x, p2.x) < Math.min(p3.x, p4.x) ||
      Math.max(p3.x, p4.x) < Math.min(p1.x, p2.x) ||
      Math.max(p1.y, p2.y) < Math.min(p3.y, p4.y) ||
      Math.max(p3.y, p4.y) < Math.min(p1.y, p2.y)
    ) {
      return false;
    }
    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
  }

  function countCrossings(): { count: number; intersectingEdges: Set<number> } {
    let count = 0;
    const intersectingEdges = new Set<number>();

    for (let i = 0; i < edges.length; i++) {
      const e1 = edges[i]!;
      const n1 = nodes[e1.u]!;
      const n2 = nodes[e1.v]!;

      for (let j = i + 1; j < edges.length; j++) {
        const e2 = edges[j]!;
        if (e1.u === e2.u || e1.u === e2.v || e1.v === e2.u || e1.v === e2.v) {
          continue;
        }
        const n3 = nodes[e2.u]!;
        const n4 = nodes[e2.v]!;

        if (doIntersect(n1, n2, n3, n4)) {
          count++;
          intersectingEdges.add(i);
          intersectingEdges.add(j);
        }
      }
    }
    return { count, intersectingEdges };
  }

  function initLevel(diff: string) {
    currentDiff = diff;
    won = false;
    moves = 0;
    startTime = performance.now();
    overlay.hidden = true;
    text('[data-cable-moves]', 0);
    text('[data-cable-time]', '00:00');

    const nodeCount = diff === 'easy' ? 5 : diff === 'medium' ? 8 : 11;
    const w = canvas.width;
    const h = canvas.height;
    const padding = 55;

    // 1. Create a guaranteed planar graph (cycle + non-crossing chords)
    edges = [];
    for (let i = 0; i < nodeCount; i++) {
      edges.push({ u: i, v: (i + 1) % nodeCount });
    }
    if (diff === 'easy') {
      edges.push({ u: 0, v: 2 });
      edges.push({ u: 0, v: 3 });
    } else if (diff === 'medium') {
      edges.push({ u: 0, v: 3 });
      edges.push({ u: 0, v: 5 });
      edges.push({ u: 3, v: 5 });
      edges.push({ u: 1, v: 3 });
      edges.push({ u: 5, v: 7 });
    } else {
      edges.push({ u: 0, v: 4 });
      edges.push({ u: 0, v: 8 });
      edges.push({ u: 4, v: 8 });
      edges.push({ u: 1, v: 3 });
      edges.push({ u: 5, v: 7 });
      edges.push({ u: 8, v: 10 });
      edges.push({ u: 4, v: 6 });
      edges.push({ u: 0, v: 2 });
    }

    // 2. Scramble node positions randomly inside canvas
    nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      let x = padding + Math.random() * (w - 2 * padding);
      let y = padding + Math.random() * (h - 2 * padding);
      nodes.push({
        id: i,
        x,
        y,
        label: labels[i % labels.length]!,
        radius: 20,
      });
    }

    // Ensure initial state has crossings
    const initial = countCrossings();
    if (initial.count === 0) {
      // Swap first two nodes to guarantee a tangled knot
      const tempX = nodes[0]!.x;
      nodes[0]!.x = nodes[1]!.x;
      nodes[1]!.x = tempX;
    }

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (won) return;
      const elapsedSec = Math.floor((performance.now() - startTime) / 1000);
      const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
      const secs = String(elapsedSec % 60).padStart(2, '0');
      text('[data-cable-time]', `${mins}:${secs}`);
    }, 1000);

    draw();
    start();
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 1. Draw subtle grid background
    ctx.strokeStyle = '#e6e3d6';
    ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const { count, intersectingEdges } = countCrossings();
    text('[data-crossings-count]', count);

    // 2. Draw Cables (Edges)
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i]!;
      const n1 = nodes[edge.u]!;
      const n2 = nodes[edge.v]!;
      const isIntersecting = intersectingEdges.has(i);

      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      // Slight smooth curve
      const midX = (n1.x + n2.x) / 2;
      const midY = (n1.y + n2.y) / 2;
      ctx.quadraticCurveTo(midX, midY, n2.x, n2.y);

      if (won) {
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 3.5;
      } else if (isIntersecting) {
        ctx.strokeStyle = '#db3427';
        ctx.lineWidth = 3.5;
      } else {
        ctx.strokeStyle = '#20211d';
        ctx.lineWidth = 2.5;
      }
      ctx.stroke();
    }

    // 3. Draw Plugs (Nodes)
    for (const node of nodes) {
      const isDragged = draggedNode?.id === node.id;

      // Outer shadow/ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDragged ? '#f8d94d' : '#f1eedf';
      ctx.fill();
      ctx.lineWidth = isDragged ? 3 : 2;
      ctx.strokeStyle = '#20211d';
      ctx.stroke();

      // Inner plug casing
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius - 4, 0, Math.PI * 2);
      ctx.fillStyle = '#20211d';
      ctx.fill();

      // Plug label text
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#f8d94d';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
    }

    // Check victory condition
    if (count === 0 && !won) {
      won = true;
      clearInterval(timerInterval);
      const elapsedSec = Math.floor((performance.now() - startTime) / 1000);
      winText.textContent = `Rozplątano w ${elapsedSec} s i ${moves} ruchach. Poziom: ${currentDiff.toUpperCase()}. Prawa fizyki ocalone.`;
      overlay.hidden = false;
      saveScore('kable-czas', elapsedSec, true);
      saveScore('kable-ruchy', moves, true);
      unlock('memory');
      if (currentDiff === 'hard') unlock('secret');
      event('cables_untangled', { level: currentDiff, moves, time: elapsedSec });
    }
  }

  function getCanvasCoords(e: PointerEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  canvas.addEventListener('pointerdown', (e) => {
    const pos = getCanvasCoords(e);
    for (const node of nodes) {
      const dx = pos.x - node.x;
      const dy = pos.y - node.y;
      if (dx * dx + dy * dy <= node.radius * node.radius * 1.8) {
        draggedNode = node;
        dragOffset = { x: dx, y: dy };
        canvas.setPointerCapture(e.pointerId);
        draw();
        break;
      }
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!draggedNode) return;
    const pos = getCanvasCoords(e);
    const pad = 24;
    draggedNode.x = Math.max(pad, Math.min(canvas.width - pad, pos.x - dragOffset.x));
    draggedNode.y = Math.max(pad, Math.min(canvas.height - pad, pos.y - dragOffset.y));
    draw();
  });

  const endDrag = () => {
    if (draggedNode) {
      draggedNode = null;
      moves++;
      text('[data-cable-moves]', moves);
      draw();
    }
  };

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  diffButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      diffButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      initLevel(btn.dataset.diff || 'easy');
    });
  });

  shuffleBtn?.addEventListener('click', () => initLevel(currentDiff));
  restartBtn?.addEventListener('click', () => initLevel(currentDiff));

  initLevel('easy');
}


