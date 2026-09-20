import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage is accessible and remains within a narrow viewport', async ({
  page,
}) => {
  await page.goto('/');
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.setViewportSize({ width: 320, height: 800 });
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
});

test('homepage, article, search, random and true 404 work', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'PORZĄDNA',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('link', { name: /Niestety czytam dalej/ }).click();
  await expect(page).toHaveURL(/artykul/);
  await expect(
    page.getByRole('heading', { name: 'SKĄD TO WIEMY?' }),
  ).toBeVisible();
  await page.goto('/artykuly?q=osmiornica');
  await expect(page.locator('.article-card')).toHaveCount(1);
  await page.goto('/artykuly?q=nieistniejacahaslowka');
  await expect(page.getByRole('heading', { name: 'NIC.' })).toBeVisible();
  await page.goto('/losowe');
  await expect(page).toHaveURL(/artykul/);
  const missing = await request.get('/nie-ma-takiej-strony');
  expect(missing.status()).toBe(404);
  expect(errors).toEqual([]);
});
test('mobile menu and privacy controls are usable', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  if (isMobile) {
    await page.getByRole('button', { name: /CAŁA RESZTA/ }).click();
    await page.getByRole('link', { name: 'GRY', exact: true }).click();
    await expect(page).toHaveURL('/gry');
  }
  await page.goto('/');
  await page.getByRole('button', { name: 'Naciśnij czerwony guzik' }).click();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('durnoty:achievements') || '[]'),
    ),
  ).toContain('first-click');
  await page.goto('/rankingi');
  await expect(page.locator('[data-achievement="first-click"]')).toHaveClass(
    /earned/,
  );
  await page.goto('/prywatnosc');
  await page.getByRole('button', { name: /Usuń moje/ }).click();
  expect(
    await page.evaluate(() => localStorage.getItem('durnoty:achievements')),
  ).toBeNull();
});
test('quiz can be completed with feedback and saves score', async ({
  page,
}) => {
  await page.goto('/gra/prawda-czy-durnota');
  await page.getByRole('button', { name: /Zaczynamy/ }).click();
  const answers = ['true', 'false', 'false', 'true', 'true'];
  for (const answer of answers) {
    await page.locator(`[data-answer="${answer}"]`).click();
    await expect(page.locator('[data-explanation]')).toBeVisible();
    await page.locator('[data-next]').click();
  }
  await expect(page.locator('[data-question]')).toContainText('5 / 5');
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('durnoty:scores') || '{}').quiz,
    ),
  ).toBe(5);
});
test('potato counts, memory resolves a pair, excuse generates', async ({
  page,
}) => {
  await page.goto('/gra/ziemniak');
  await page.getByRole('button', { name: /Zaczynamy/ }).click();
  await page.getByRole('button', { name: 'Złap ziemniaka' }).click();
  await expect(page.locator('[data-hits]')).toHaveText('1');
  await page.goto('/gra/pamiec');
  await expect(page.locator('.memory-card')).toHaveCount(12);
  await page.locator('.memory-card').first().click();
  await expect(page.locator('.memory-card').first()).not.toHaveText('?');
  await page.goto('/gra/wymowki');
  await page.getByRole('button', { name: /Wydaj zaświadczenie/ }).click();
  await expect(page.locator('[data-excuse]')).toContainText('Niniejszym');
  await expect(page.locator('[data-copy]')).toBeEnabled();
});
test('reaction detects false start and TV changes playable local media', async ({
  page,
}) => {
  await page.goto('/gra/refleks');
  await page.locator('[data-reaction]').click();
  await page.locator('[data-reaction]').click();
  await expect(page.locator('[data-reaction-text]')).toHaveText('FALSTART.');
  await page.goto('/tv');
  await page.getByRole('button', { name: /02 Przyroda/ }).click();
  await expect(page.locator('[data-program-title]')).toContainText('Ziemniak');
  await expect
    .poll(() =>
      page
        .locator('video')
        .evaluate((video: HTMLVideoElement) => video.readyState),
    )
    .toBeGreaterThanOrEqual(1);
  expect(
    await page
      .locator('video')
      .evaluate((video: HTMLVideoElement) => video.duration),
  ).toBeGreaterThan(10);
});
test('public SEO, feed and CMS authorization respond correctly', async ({
  request,
}) => {
  expect((await request.get('/rss.xml')).headers()['content-type']).toContain(
    'xml',
  );
  expect(await (await request.get('/sitemap.xml')).text()).toContain(
    '/gra/ziemniak',
  );
  expect(
    (await request.get('/og/australia-kontra-emu.png')).headers()[
      'content-type'
    ],
  ).toBe('image/png');
  expect((await request.get('/api/mumro/articles')).status()).toBe(401);
  const ok = await request.get('/api/mumro/articles', {
    headers: {
      Authorization: 'Bearer e2e-only-isolated-cms-secret-not-for-production',
    },
  });
  expect(ok.status()).toBe(200);
});

test('Mumro HTTP delivery publishes sanitized content and respects draft visibility', async ({
  request,
}, testInfo) => {
  const id = testInfo.project.name === 'mobile' ? 901 : 902;
  const slug = `cms-contract-${id}`;
  const endpoint = '/api/mumro/articles';
  const headers = {
    Authorization: 'Bearer e2e-only-isolated-cms-secret-not-for-production',
    'Idempotency-Key': `contract-${id}-${Date.now()}`,
  };
  const data = {
    article: {
      id,
      title: 'Kontrakt HTTP działa',
      slug,
      content_html:
        '<p>Treść z testu.</p><script>window.compromised=true</script>',
      status: 'future',
      scheduled_at: '2020-01-01T12:00:00Z',
      metadata: { kind: 'experiment' },
    },
    site: { id: 42, domain: '127.0.0.1', site_url: 'http://127.0.0.1:4322' },
  };
  const delivered = await request.post(endpoint, { headers, data });
  expect(delivered.status()).toBe(200);
  const receipt = await delivered.json();
  expect(receipt.url).toBe(`http://127.0.0.1:4322/artykul/${slug}`);
  const page = await request.get(`/artykul/${slug}`);
  expect(page.status()).toBe(200);
  expect(await page.text()).not.toContain('window.compromised');
  expect(
    await (await request.post(endpoint, { headers, data })).json(),
  ).toEqual(receipt);
  data.article.status = 'draft';
  const hidden = await request.post(endpoint, {
    headers: {
      ...headers,
      'Idempotency-Key': headers['Idempotency-Key'] + '-hide',
    },
    data,
  });
  expect(hidden.status()).toBe(200);
  expect((await request.get(`/artykul/${slug}`)).status()).toBe(404);
});
