/** Reproducible original TV slates; no external footage, stock or third-party audio. */
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  mkdtempSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { renderOg } from '../src/lib/og';
import { xmlEscape as x } from '../src/lib/content';

mkdirSync('public/tv', { recursive: true });
writeFileSync('public/og.png', await renderOg('Internet nie musiał taki być.'));
const shows = [
  {
    name: 'przerwa',
    channel: '01',
    color: '#aec09d',
    art: 'mascot',
    title: 'PRZERWA NA NIC.',
    lines: [
      'Nie każde 15 sekund musi być produktywne.',
      'To jest pięć sekund tylko dla Ciebie.',
      'Nic się nie wydarzyło. I dobrze.',
    ],
  },
  {
    name: 'ziemniak',
    channel: '02',
    color: '#f8d94d',
    art: 'potato',
    title: 'ZIEMNIAK. OBSERWACJA.',
    lines: [
      'Ziemniak w swoim naturalnym środowisku.',
      'Nie robi nic. Radzi sobie świetnie.',
      'Następny program: to samo, ale później.',
    ],
  },
  {
    name: 'prognoza',
    channel: '03',
    color: '#b7cbd1',
    art: 'mascot',
    title: 'PROGNOZA INTERNETU.',
    lines: [
      'Dziś miejscami gęsto od opinii.',
      'Lokalne przejaśnienia zdrowego rozsądku.',
      'Jutro podobnie. Weź dystans.',
    ],
  },
];
for (const show of shows) {
  const folder = mkdtempSync(join(tmpdir(), 'durnoty-tv-'));
  try {
    const art = readFileSync(`public/art/${show.art}.svg`).toString('base64');
    for (let i = 0; i < 3; i++) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><defs><pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#20211d" opacity=".12"/></pattern></defs><path fill="${show.color}" d="M0 0h1280v720H0z"/><path fill="url(#dots)" d="M0 0h1280v720H0z"/><rect x="24" y="24" width="1232" height="672" fill="none" stroke="#20211d" stroke-width="4"/><path fill="#20211d" d="M24 24h1232v66H24z"/><g font-family="DejaVu Sans" fill="#20211d"><text x="52" y="69" fill="#f1eedf" font-size="24" font-weight="bold">DURNOTY TV</text><text x="1215" y="69" text-anchor="end" fill="#f1eedf" font-size="23">CH ${show.channel} · MIKROPROGRAM</text><text x="640" y="179" text-anchor="middle" font-size="54" font-weight="bold">${x(show.title)}</text><image href="data:image/svg+xml;base64,${art}" x="${475 + i * 12}" y="225" width="330" height="295"/><text x="640" y="599" text-anchor="middle" font-size="31" font-weight="bold">${x(show.lines[i]!)}</text><text x="640" y="663" text-anchor="middle" font-size="18">${i + 1} / 3 · PROGRAM WŁASNY · BEZ DŹWIĘKU</text></g></svg>`;
      await sharp(Buffer.from(svg))
        .png()
        .toFile(join(folder, `scene-${i}.png`));
    }
    writeFileSync(
      `public/tv/${show.name}.png`,
      readFileSync(join(folder, 'scene-0.png')),
    );
    execFileSync('ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-framerate',
      '1/5',
      '-i',
      join(folder, 'scene-%d.png'),
      '-c:v',
      'libx264',
      '-r',
      '24',
      '-t',
      '15',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-crf',
      '25',
      `public/tv/${show.name}.mp4`,
    ]);
    writeFileSync(
      `public/tv/${show.name}.vtt`,
      'WEBVTT\n\n' +
        show.lines
          .map(
            (line, i) =>
              `00:00:${String(i * 5).padStart(2, '0')}.000 --> 00:00:${String((i + 1) * 5).padStart(2, '0')}.000\n${line}\n`,
          )
          .join('\n'),
    );
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}
console.log('Generated original TV programs and default social card.');
