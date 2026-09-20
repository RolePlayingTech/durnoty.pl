import { createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { cmsSchema } from './schema';
import { cleanHtml, absoluteUrl, articleUrl } from './content';

export class CmsError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
export function authorized(
  header: string | null,
  secret: string | undefined,
): boolean {
  if (!secret || secret.length < 32 || !header?.startsWith('Bearer '))
    return false;
  const a = createHash('sha256').update(header.slice(7)).digest();
  const b = createHash('sha256').update(secret).digest();
  return timingSafeEqual(a, b);
}
export function receiveArticle(
  db: Database.Database,
  raw: unknown,
  key: string,
  expectedSite?: string,
) {
  const parsed = cmsSchema.safeParse(raw);
  if (!parsed.success) throw new CmsError(422, 'invalid_article');
  const { article, site } = parsed.data;
  const host = new URL(absoluteUrl('/')).hostname;
  if (
    site.domain !== host ||
    new URL(site.site_url).hostname !== host ||
    (expectedSite && String(site.id) !== expectedSite)
  )
    throw new CmsError(403, 'wrong_site');
  if (!/^[a-zA-Z0-9_:.-]{8,200}$/.test(key))
    throw new CmsError(400, 'idempotency_key_required');
  const digest = createHash('sha256')
    .update(JSON.stringify(parsed.data))
    .digest('hex');
  return db.transaction(() => {
    const replay = db
      .prepare('SELECT digest, response FROM deliveries WHERE key = ?')
      .get(key) as { digest: string; response: string } | undefined;
    if (replay) {
      if (replay.digest !== digest)
        throw new CmsError(409, 'idempotency_conflict');
      return JSON.parse(replay.response) as {
        external_id: string;
        url: string;
        status: string;
      };
    }
    const existing = db
      .prepare(
        'SELECT id, slug, published_at, status FROM articles WHERE source_site = ? AND source_id = ?',
      )
      .get(site.id, article.id) as
      | { id: string; slug: string; published_at: string; status: string }
      | undefined;
    if (article.external_id && existing?.id !== article.external_id)
      throw new CmsError(409, 'external_id_mismatch');
    // Preserve an existing permalink so old links and social comments remain valid.
    const slug = existing?.slug ?? article.slug;
    const collision = db
      .prepare('SELECT id FROM articles WHERE slug = ?')
      .get(slug) as { id: string } | undefined;
    if (collision && collision.id !== existing?.id)
      throw new CmsError(409, 'slug_conflict');
    const id = existing?.id ?? randomUUID();
    const now = new Date().toISOString();
    const published =
      article.status === 'future'
        ? new Date(article.scheduled_at!).toISOString()
        : existing?.status !== 'draft' &&
            existing?.published_at &&
            existing.published_at <= now
          ? existing.published_at
          : now;
    db.prepare(
      `INSERT INTO articles VALUES (@id, @source_site, @source_id, @slug, @title, @excerpt, @content_html, @image, @image_alt, @image_caption, @metadata, @status, @published_at, @updated_at)
      ON CONFLICT(id) DO UPDATE SET title=excluded.title, excerpt=excluded.excerpt, content_html=excluded.content_html, image=excluded.image, image_alt=excluded.image_alt, image_caption=excluded.image_caption, metadata=excluded.metadata, status=excluded.status, published_at=excluded.published_at, updated_at=excluded.updated_at`,
    ).run({
      id,
      source_site: site.id,
      source_id: article.id,
      slug,
      title: article.title,
      excerpt: article.excerpt ?? '',
      content_html: cleanHtml(article.content_html),
      image: article.featured_image?.url ?? '/art/dispatch.svg',
      image_alt: article.featured_image?.alt ?? '',
      image_caption: article.featured_image?.caption ?? '',
      metadata: JSON.stringify(article.metadata),
      status: article.status,
      published_at: published,
      updated_at: now,
    });
    const response = {
      external_id: id,
      url: absoluteUrl(articleUrl(slug)),
      status: article.status,
    };
    db.prepare('INSERT INTO deliveries VALUES (?, ?, ?, ?)').run(
      key,
      digest,
      JSON.stringify(response),
      now,
    );
    return response;
  })();
}
