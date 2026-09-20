import { channels, nextChannel } from '../lib/tv';
import { event, unlock } from './storage';
const player = document.querySelector<HTMLVideoElement>('#tv-player')!;
let current = 0;
let continuous = false;
const status = document.querySelector<HTMLElement>('[data-tv-status]')!;
function select(index: number, play = false) {
  const channel = channels[index];
  if (!channel) return;
  current = index;
  player.pause();
  player.src = channel.file;
  player.poster = channel.poster;
  const track = player.querySelector('track');
  if (track) track.src = channel.captions;
  document.querySelector('[data-channel-label]')!.textContent =
    `CH 0${channel.id} · ${channel.name.toUpperCase()}`;
  document.querySelector('[data-program-title]')!.textContent = channel.title;
  document.querySelector('[data-program-description]')!.textContent =
    channel.description;
  document
    .querySelectorAll<HTMLButtonElement>('[data-channel]')
    .forEach((b) =>
      b.setAttribute(
        'aria-pressed',
        String(Number(b.dataset.channel) === index),
      ),
    );
  status.textContent = 'Program gotowy. Naciśnij odtwarzanie.';
  player.load();
  event('tv_channel_changed', { channel: channel.id });
  if (play)
    player.play().catch(() => {
      status.textContent = 'Naciśnij odtwarzanie, żeby kontynuować.';
    });
}
document
  .querySelectorAll<HTMLButtonElement>('[data-channel]')
  .forEach((b) =>
    b.addEventListener('click', () =>
      select(Number(b.dataset.channel), !player.paused),
    ),
  );
document
  .querySelector<HTMLButtonElement>('[data-continuous]')!
  .addEventListener('click', (e) => {
    continuous = !continuous;
    const b = e.currentTarget as HTMLButtonElement;
    b.setAttribute('aria-pressed', String(continuous));
    b.textContent = `Tryb ciągły: ${continuous ? 'włączony' : 'wyłączony'}`;
  });
player.addEventListener('play', () => {
  event('tv_started', { channel: channels[current]!.id });
  status.textContent = 'Program trwa. To już cała telewizja.';
});
player.addEventListener('ended', () => {
  unlock('tv');
  event('video_complete', { channel: channels[current]!.id });
  status.textContent =
    'Koniec programu. Możesz zmienić kanał albo wyjść na spacer.';
  if (continuous) select(nextChannel(current, channels.length), true);
});
player.addEventListener('error', () => {
  status.textContent = 'Sygnał uciekł. Spróbuj wybrać kanał ponownie.';
});
