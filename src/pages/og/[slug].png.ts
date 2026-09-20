import type { APIRoute } from 'astro';
import { findArticle } from '../../lib/db';
import { renderOg } from '../../lib/og';
const cache = new Map<string, Buffer>();
export const GET: APIRoute = async ({ params }) => {
  const article = findArticle(params.slug!);
  if (!article) return new Response(null, { status: 404 });
  const key = `${article.id}:${article.updated_at}`;
  let png = cache.get(key);
  if (!png) {
    png = await renderOg(article.title, article.metadata.absurdity);
    if (cache.size >= 80) cache.delete(cache.keys().next().value!);
    cache.set(key, png);
  }
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
