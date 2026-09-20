import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase, listArticles, findArticle } from '../src/lib/db';
import { authorized, receiveArticle, CmsError } from '../src/lib/cms';
import { cleanHtml } from '../src/lib/content';

const payload = () => ({
  article: {
    id: 17,
    title: 'Ptaki mają plan',
    slug: 'ptaki-maja-plan',
    content_html: '<p>Treść artykułu.</p>',
    status: 'publish',
    metadata: { category: 'historia', absurdity: 91 },
  },
  site: {
    id: 2,
    name: 'Durnoty',
    domain: 'durnoty.pl',
    site_url: 'https://durnoty.pl',
  },
});
const expectedError = (status: number, code: string) => (e: unknown) =>
  e instanceof CmsError && e.status === status && e.code === code;

test('CMS token is required, correct and nontrivial', () => {
  const secret = 's'.repeat(64);
  assert.equal(authorized(`Bearer ${secret}`, secret), true);
  assert.equal(authorized(`Bearer ${'x'.repeat(64)}`, secret), false);
  assert.equal(authorized(null, secret), false);
  assert.equal(authorized('Bearer short', 'short'), false);
  assert.equal(authorized('Bearer undefined', undefined), false);
});
test('delivery is idempotent and changed content under same key conflicts', () => {
  const db = openDatabase(':memory:');
  try {
    const input = payload();
    const result = receiveArticle(db, input, 'delivery-0001');
    assert.deepEqual(receiveArticle(db, input, 'delivery-0001'), result);
    assert.equal(listArticles(db).length, 1);
    input.article.title = 'Zmieniony tytuł';
    assert.throws(
      () => receiveArticle(db, input, 'delivery-0001'),
      expectedError(409, 'idempotency_conflict'),
    );
    const updated = receiveArticle(db, input, 'delivery-0002');
    assert.equal(updated.external_id, result.external_id);
    assert.equal(listArticles(db)[0]!.title, 'Zmieniony tytuł');
  } finally {
    db.close();
  }
});
test('draft and future articles stay private; due content becomes visible without a rebuild', () => {
  const db = openDatabase(':memory:');
  try {
    const input = {
      ...payload(),
      article: {
        ...payload().article,
        status: 'draft',
        scheduled_at: null as string | null,
      },
    };
    receiveArticle(db, input, 'draft-000001');
    assert.equal(listArticles(db).length, 0);
    assert.equal(findArticle(input.article.slug, db), undefined);
    input.article.status = 'future';
    input.article.scheduled_at = '2099-01-01T12:00:00Z';
    receiveArticle(db, input, 'future-000001');
    assert.equal(listArticles(db).length, 0);
    input.article.scheduled_at = '2020-01-01T12:00:00Z';
    receiveArticle(db, input, 'future-000002');
    assert.equal(listArticles(db).length, 1);
  } finally {
    db.close();
  }
});
test('rejects wrong sites, missing schedule, unsafe slug, external id and slug collisions', () => {
  const db = openDatabase(':memory:');
  try {
    const input = payload();
    assert.throws(
      () =>
        receiveArticle(
          db,
          { ...input, site: { ...input.site, domain: 'other.example' } },
          'site-000001',
        ),
      expectedError(403, 'wrong_site'),
    );
    assert.throws(
      () => receiveArticle(db, input, 'site-000001', '3'),
      expectedError(403, 'wrong_site'),
    );
    assert.throws(
      () =>
        receiveArticle(
          db,
          { ...input, article: { ...input.article, status: 'future' } },
          'bad-000001',
        ),
      expectedError(422, 'invalid_article'),
    );
    assert.throws(
      () =>
        receiveArticle(
          db,
          { ...input, article: { ...input.article, slug: '../bad' } },
          'bad-000002',
        ),
      expectedError(422, 'invalid_article'),
    );
    assert.throws(
      () =>
        receiveArticle(
          db,
          { ...input, article: { ...input.article, external_id: 'unrelated' } },
          'bad-000003',
        ),
      expectedError(409, 'external_id_mismatch'),
    );
    receiveArticle(db, input, 'good-00001');
    assert.throws(
      () =>
        receiveArticle(
          db,
          { ...input, article: { ...input.article, id: 99 } },
          'collision-001',
        ),
      expectedError(409, 'slug_conflict'),
    );
    assert.equal(listArticles(db).length, 1);
  } finally {
    db.close();
  }
});
test('HTML strips active content, protocols, handlers, and hostile embedded markup', () => {
  const clean = cleanHtml(
    '<script>alert(1)</script><p onclick="x()" style="color:red">Hello</p><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">click</a><iframe src="https://evil.test"></iframe><svg><animate onbegin="x()" /></svg><textarea><img src=x onerror=alert(1)></textarea/>',
  );
  assert.ok(clean.includes('<p>Hello</p>'));
  assert.doesNotMatch(
    clean,
    /<script|onclick|onerror|<iframe|javascript:|<svg|<animate|style=/i,
  );
});
test('updates preserve published permalink and sanitized content', () => {
  const db = openDatabase(':memory:');
  try {
    const input = payload();
    const first = receiveArticle(db, input, 'permalink-001');
    input.article.slug = 'zmieniony-slug';
    input.article.content_html = '<p>Nowe</p><script>bad()</script>';
    const result = receiveArticle(db, input, 'permalink-002');
    assert.equal(result.url, first.url);
    assert.equal(
      findArticle('ptaki-maja-plan', db)!.content_html,
      '<p>Nowe</p>',
    );
  } finally {
    db.close();
  }
});
