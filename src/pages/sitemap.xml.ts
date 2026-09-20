import type { APIRoute } from 'astro';
import { listArticles } from '../lib/db';
import { games } from '../lib/games';
import { xmlEscape as x, absoluteUrl, articleUrl } from '../lib/content';
export const GET: APIRoute = () => {
  const paths = [
    '/',
    '/artykuly',
    '/gry',
    '/tv',
    '/laboratorium',
    '/rankingi',
    '/o-nas',
    '/prywatnosc',
    ...games.map((g) => `/gra/${g.slug}`),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${x(absoluteUrl(p))}</loc></url>`).join('')}${listArticles()
      .map(
        (a) =>
          `<url><loc>${x(absoluteUrl(articleUrl(a.slug)))}</loc><lastmod>${a.updated_at.slice(0, 10)}</lastmod></url>`,
      )
      .join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
