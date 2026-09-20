import type { APIRoute } from 'astro';
import { listArticles } from '../lib/db';
import { xmlEscape as x, absoluteUrl, articleUrl } from '../lib/content';
export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Durnoty.pl — Internet nie musiał taki być.</title><link>${x(absoluteUrl('/'))}</link><description>Rzeczy dziwne, ale prawdziwe. I jawnie oznaczona satyra.</description><language>pl</language>${listArticles()
      .slice(0, 50)
      .map(
        (a) =>
          `<item><title>${x(a.title)}</title><link>${x(absoluteUrl(articleUrl(a.slug)))}</link><guid isPermaLink="true">${x(absoluteUrl(articleUrl(a.slug)))}</guid><pubDate>${new Date(a.published_at).toUTCString()}</pubDate><description>${x(a.excerpt)}</description></item>`,
      )
      .join('')}</channel></rss>`,
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  );
