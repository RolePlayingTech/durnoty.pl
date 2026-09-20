import type { APIRoute } from 'astro';
import { listArticles } from '../lib/db';
import { pickRandom } from '../lib/games';
import { articleUrl } from '../lib/content';
export const GET: APIRoute = ({ url, cookies, redirect }) => {
  const articles = listArticles();
  const weird = url.searchParams.get('dziwne') === '1';
  const pool = weird
    ? articles.filter((a) => a.metadata.absurdity >= 85)
    : articles;
  const selected = pickRandom(
    pool.length ? pool : articles,
    cookies.get('durnoty_last_random')?.value,
  );
  if (!selected) return redirect('/artykuly', 302);
  cookies.set('durnoty_last_random', selected.id, {
    path: '/losowe',
    sameSite: 'lax',
    httpOnly: true,
    secure: url.protocol === 'https:',
    maxAge: 3600,
  });
  return redirect(articleUrl(selected.slug), 302);
};
