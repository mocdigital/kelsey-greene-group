import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';

// Uses the publishable key only, so it works on any host (e.g. Vercel). Storage policy
// exposes a cms-media file only while a published CMS record references it.
export const Route = createFileRoute('/api/public/media')({
  server: { handlers: { GET: async ({ request }) => {
    const path = new URL(request.url).searchParams.get('path') ?? '';
    if (!/^uploads\/[a-zA-Z0-9._-]+$/.test(path)) return new Response('Not found', { status: 404 });
    const url = process.env['SUPABASE_URL'] ?? process.env['VITE_SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? process.env['VITE_SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) return new Response('Not found', { status: 404 });
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const headers = new Headers(init?.headers); if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization'); headers.set('apikey', key); return fetch(input, { ...init, headers }); } } });
    const { data, error } = await client.storage.from('cms-media').download(path);
    if (error || !data) return new Response('Not found', { status: 404 });
    return new Response(data, { headers: { 'Content-Type': data.type || 'application/octet-stream', 'Cache-Control': 'public, max-age=60', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" } });
  } } },
});
