import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';
export const GET: APIRoute = () => {
  try {
    getDb().prepare('SELECT 1').get();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
};
