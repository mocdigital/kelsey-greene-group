import { createFileRoute } from '@tanstack/react-router';
import { referencesMedia } from '@/lib/media';

export const Route = createFileRoute('/api/public/media')({
  server: { handlers: { GET: async ({ request }) => {
    const path = new URL(request.url).searchParams.get('path') ?? '';
    if (!/^uploads\/[a-zA-Z0-9._-]+$/.test(path)) return new Response('Not found', { status: 404 });
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: records, error } = await supabaseAdmin.from('cms_records').select('payload').eq('status', 'published');
    if (error || !records?.some(record => referencesMedia(record.payload, `cms-media:${path}`))) return new Response('Not found', { status: 404 });
    const { data, error: downloadError } = await supabaseAdmin.storage.from('cms-media').download(path);
    if (downloadError || !data) return new Response('Not found', { status: 404 });
    return new Response(data, { headers: { 'Content-Type': data.type || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" } });
  } } },
});