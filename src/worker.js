// API for the Warhol filter demo. Static pages come from ./public via the assets binding.
const MAX_BYTES = 500_000;
const MAX_PHOTOS = 300; // about 5× the class; stops a runaway client from filling the DB
const ANSWERS = ['yes', 'no', 'unsure'];
const MISSING = ['choice', 'context', 'hand'];

const json = (data, status = 200) => Response.json(data, { status });
const bad = (msg, status = 400) => new Response(msg, { status });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const p = url.pathname;

    if (p === '/api/photo' && req.method === 'POST') {
      if (req.headers.get('content-type') !== 'image/jpeg') return bad('jpeg only', 415);
      const body = new Uint8Array(await req.arrayBuffer());
      if (body.length < 3 || body.length > MAX_BYTES) return bad('size', 413);
      if (body[0] !== 0xff || body[1] !== 0xd8 || body[2] !== 0xff) return bad('not a jpeg', 415);
      const { n } = await env.DB.prepare('SELECT count(*) AS n FROM photos').first();
      if (n >= MAX_PHOTOS) return bad('full', 429);
      const cid = (req.headers.get('x-cid') || '').slice(0, 64);
      const r = await env.DB.prepare('INSERT INTO photos (cid, data, created) VALUES (?, ?, ?)').bind(cid, body, Date.now()).run();
      return json({ id: r.meta.last_row_id });
    }

    if (p === '/api/vote' && req.method === 'POST') {
      let v;
      try { v = await req.json(); } catch { return bad('json'); }
      const cid = typeof v?.cid === 'string' ? v.cid.slice(0, 64) : '';
      if (!cid || !ANSWERS.includes(v.answer)) return bad('answer');
      const missing = v.answer === 'no' && MISSING.includes(v.missing) ? v.missing : null;
      await env.DB.prepare('INSERT OR REPLACE INTO votes (cid, answer, missing, created) VALUES (?, ?, ?, ?)')
        .bind(cid, v.answer, missing, Date.now()).run();
      return json({ ok: true });
    }

    if (p.startsWith('/api/admin/')) {
      // Fail closed when the secret isn't configured.
      const key = req.headers.get('x-key') || url.searchParams.get('key');
      if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) return bad('forbidden', 403);

      if (p === '/api/admin/photos' && req.method === 'GET') {
        const after = Number(url.searchParams.get('after')) || 0;
        const { results } = await env.DB.prepare('SELECT id FROM photos WHERE id > ? ORDER BY id').bind(after).all();
        return json(results.map((r) => r.id));
      }
      const m = p.match(/^\/api\/admin\/photo\/(\d+)$/);
      if (m && req.method === 'GET') {
        const row = await env.DB.prepare('SELECT data FROM photos WHERE id = ?').bind(Number(m[1])).first();
        if (!row) return bad('not found', 404);
        // A photo never changes and AUTOINCREMENT never reuses an id, so the admin browser may keep it.
        // private: only that browser, never Cloudflare's shared cache. 3 h ≈ one class, so copies expire after the talk.
        return new Response(new Uint8Array(row.data), { headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, max-age=10800, immutable' } });
      }
      if (p === '/api/admin/votes' && req.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT answer, missing, count(*) AS n FROM votes GROUP BY answer, missing').all();
        return json(results);
      }
      if (p === '/api/admin/all' && req.method === 'DELETE') {
        await env.DB.batch([env.DB.prepare('DELETE FROM photos'), env.DB.prepare('DELETE FROM votes')]);
        return json({ ok: true });
      }
    }

    return bad('not found', 404);
  },
};
