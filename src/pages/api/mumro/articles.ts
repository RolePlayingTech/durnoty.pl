import type { APIRoute } from 'astro';
import { authorized, receiveArticle, CmsError } from '../../../lib/cms';
import { getDb } from '../../../lib/db';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
export const GET: APIRoute = ({ request }) => {
  if (
    !authorized(
      request.headers.get('authorization'),
      process.env.MUMRO_CMS_SECRET,
    )
  )
    return json({ error: 'unauthorized' }, 401);
  return json({ ok: true, cms: 'durnoty', version: 1 });
};
export const POST: APIRoute = async ({ request }) => {
  if (
    !authorized(
      request.headers.get('authorization'),
      process.env.MUMRO_CMS_SECRET,
    )
  )
    return json({ error: 'unauthorized' }, 401);
  if (!request.headers.get('content-type')?.includes('application/json'))
    return json({ error: 'json_required' }, 415);
  // Bound actual bytes, including chunked requests with no Content-Length header.
  const reader = request.body?.getReader();
  if (!reader) return json({ error: 'invalid_json' }, 400);
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 1_000_000) {
        await reader.cancel();
        return json({ error: 'payload_too_large' }, 413);
      }
      chunks.push(value);
    }
    let body: unknown;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      return json({ error: 'invalid_json' }, 400);
    }
    return json(
      receiveArticle(
        getDb(),
        body,
        request.headers.get('idempotency-key') ?? '',
        process.env.MUMRO_SITE_ID,
      ),
    );
  } catch (error) {
    if (error instanceof CmsError)
      return json({ error: error.code }, error.status);
    console.error(
      'CMS delivery failed; database or request stream unavailable',
    );
    return json({ error: 'delivery_failed' }, 500);
  }
};
