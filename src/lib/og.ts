import sharp from 'sharp';
import { xmlEscape } from './content';

export function wrapTitle(title: string, max = 29): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of title.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > max && line) {
      lines.push(line);
      line = '';
    }
    line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  if (lines.length > 4)
    return [...lines.slice(0, 3), lines.slice(3).join(' ').slice(0, 27) + '…'];
  return lines;
}
export async function renderOg(
  title: string,
  absurdity?: number,
): Promise<Buffer> {
  const lines = wrapTitle(title);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><path fill="#f1eedf" d="M0 0h1200v630H0z"/><path fill="#20211d" d="M0 0h1200v22H0zM50 130h1100v3H50zM50 520h1100v3H50z"/><g font-family="DejaVu Sans" font-weight="bold" fill="#20211d"><text x="50" y="103" font-size="61" letter-spacing="-3">DURNOTY<tspan fill="#db3427">.PL</tspan></text><text x="1145" y="91" text-anchor="end" font-size="18">INTERNET NIE MUSIAŁ TAKI BYĆ.</text>${lines.map((line, i) => `<text x="50" y="${210 + i * 76}" font-size="55" letter-spacing="-2">${xmlEscape(line)}</text>`).join('')}<text x="50" y="572" font-size="21">NIEZALEŻNY ZAKŁAD PRZERÓBKI RZECZYWISTOŚCI</text></g><g transform="rotate(-3 995 552)"><path fill="#f8d94d" d="M850 530h290v64H850z"/><text x="995" y="572" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="23">${absurdity === undefined ? 'ROZSĄDEK OPCJONALNY' : `DURNOTA: ${absurdity}%`}</text></g></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
