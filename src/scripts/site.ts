import { read, write, unlock, event, type Scores } from './storage';

const menu = document.querySelector<HTMLButtonElement>('.mobile-menu');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  document.querySelector('#nav-links')?.classList.toggle('is-open', open);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    menu?.setAttribute('aria-expanded', 'false');
    document.querySelector('#nav-links')?.classList.remove('is-open');
  }
});
let toastTimer: ReturnType<typeof setTimeout>;
export function toast(message: string): void {
  const node = document.querySelector<HTMLElement>('.toast');
  if (!node) return;
  clearTimeout(toastTimer);
  node.textContent = message;
  node.hidden = false;
  toastTimer = setTimeout(() => {
    node.hidden = true;
  }, 5000);
}
const excuses = [
  'Zgłoszenie przyjęte. Nic z nim nie zrobimy.',
  'Teraz jesteś współodpowiedzialny za internet.',
  'Ziemniak został poinformowany.',
  'Dziękujemy. Właśnie nic się nie wydarzyło.',
  'Prosimy nie karmić przycisku po północy.',
  'Uruchomiono procedurę wzruszenia ramionami.',
];
document
  .querySelectorAll<HTMLButtonElement>('[data-red-button]')
  .forEach((button) =>
    button.addEventListener('click', () => {
      const clicks = read<number>('red-clicks', 0) + 1;
      write('red-clicks', clicks);
      toast(excuses[(clicks - 1) % excuses.length]!);
      event('red_button_clicked');
      unlock('first-click');
      if (clicks >= 10) unlock('button');
      if (clicks % 3 === 0) {
        document.querySelector('.site-shell')?.classList.add('red-alert');
        setTimeout(
          () =>
            document
              .querySelector('.site-shell')
              ?.classList.remove('red-alert'),
          1500,
        );
      }
    }),
  );
const achievementNames: Record<string, string> = {
  'first-click': 'Pierwsza zła decyzja',
  button: 'Nie potrafi przestać',
  potato: 'Inspektor ziemniaków',
  quiz: 'Zdrowy rozsądek',
  memory: 'Jednak pamiętam',
  secret: 'Dział rzeczy niewyjaśnionych',
  tv: 'Telewidz z wyboru',
};
window.addEventListener('durnoty:achievement', ((e: CustomEvent<string>) => {
  toast(
    `Osiągnięcie: ${achievementNames[e.detail] || e.detail}. Nagrody nie przewidziano.`,
  );
}) as EventListener);
const unlocked = read<string[]>('achievements', []);
document.querySelectorAll<HTMLElement>('[data-achievement]').forEach((el) => {
  const earned = unlocked.includes(el.dataset.achievement!);
  el.classList.toggle('earned', earned);
  const status = el.querySelector('[data-status]');
  if (status) status.textContent = earned ? 'ZDOBYTE' : 'DO ODKRYCIA';
});
const scores = read<Scores>('scores', {});
document.querySelectorAll<HTMLElement>('[data-score]').forEach((el) => {
  const score = scores[el.dataset.score!];
  el.textContent =
    score !== undefined ? `${score}${el.dataset.unit || ''}` : 'jeszcze nic';
});
document
  .querySelector('[data-clear-storage]')
  ?.addEventListener('click', () => {
    for (const key of ['scores', 'achievements', 'red-clicks']) {
      try {
        localStorage.removeItem(`durnoty:${key}`);
      } catch {
        /* unavailable */
      }
    }
    toast('Lokalne wyniki i osiągnięcia usunięte. Czysta kartka.');
  });
document
  .querySelectorAll<HTMLElement>('[data-event]')
  .forEach((el) =>
    el.addEventListener('click', () => event(el.dataset.event!)),
  );
let code = '';
document.addEventListener('keydown', (e) => {
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  )
    return;
  code = (code + e.key).slice(-70);
  if (
    code.endsWith(
      'ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba',
    )
  )
    unlock('secret');
});
document
  .querySelectorAll<HTMLFormElement>('.nav-search,.archive-search')
  .forEach((form) =>
    form.addEventListener('submit', (e) => {
      const query = new FormData(form)
        .get('q')
        ?.toString()
        .trim()
        .toLowerCase();
      if (query === 'ziemniak' || query === 'random') {
        e.preventDefault();
        window.location.assign(
          query === 'ziemniak' ? '/gra/ziemniak' : '/losowe',
        );
      }
    }),
  );
document
  .querySelector<HTMLButtonElement>('[data-share]')
  ?.addEventListener('click', async () => {
    try {
      if (navigator.share)
        await navigator.share({ title: document.title, url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        toast('Link skopiowany. Dalsze konsekwencje po Twojej stronie.');
      }
    } catch {
      toast('Link znajdziesz też w pasku adresu.');
    }
  });
if (document.querySelector('.article-body')) {
  event('article_open', { path: location.pathname });
  const marker = document.querySelector('.source-list');
  if (marker) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        event('article_read_90', { path: location.pathname });
        observer.disconnect();
      }
    });
    observer.observe(marker);
  }
}
