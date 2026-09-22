import { defineMiddleware } from 'astro:middleware';
import { createHash } from 'node:crypto';

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  const headers = new Headers(response.headers);
  let body: BodyInit | null = response.body;
  const hashes: string[] = [];
  if (headers.get('content-type')?.includes('text/html')) {
    const html = await response.text();
    // Hash only server-produced inline scripts (JSON-LD). Article HTML is sanitized before storage.
    for (const match of html.matchAll(
      /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
    )) {
      if (match[1])
        hashes.push(
          `'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`,
        );
    }
    body = html;
    headers.delete('content-length');
  }
  headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' https://app.mumro.io ${hashes.join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; media-src 'self'; connect-src 'self' https://app.mumro.io; frame-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`,
  );
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Cache-Control', 'no-store');
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
