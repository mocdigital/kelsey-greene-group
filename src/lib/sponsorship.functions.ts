import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

async function admin() { return (await import('@/integrations/supabase/client.server')).supabaseAdmin; }
const STAFF = ['super_admin', 'admin', 'community_manager'];
async function isStaff(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.from('user_roles').select('role').eq('user_id', ctx.userId);
  return (data ?? []).some((r: { role: string }) => STAFF.includes(r.role));
}

export const submitSponsorship = createServerFn({ method: 'POST' }).inputValidator(z.object({
  first_name: z.string().trim().min(1).max(80), last_name: z.string().trim().min(1).max(80), email: z.string().email().max(200),
  phone: z.string().trim().min(3).max(40), country: z.string().trim().min(2).max(80), city: z.string().max(80).default(''),
  organisation: z.string().max(200).default(''), note: z.string().max(2000).default(''),
  boxes: z.number().int().positive().max(1_000_000).nullable(), amount: z.number().positive().max(1e12),
  currency: z.string().regex(/^[A-Z]{2,6}$/), payment_method: z.enum(['espees', 'bank_transfer']), website: z.string().max(0).default(''),
})).handler(async ({ data }) => {
  const db = await admin();
  const { data: allowed } = await db.rpc('consume_submission_limit', { limit_key: `sponsor:${data.email.toLowerCase()}` });
  if (!allowed) throw new Error('Too many submissions. Please try again later.');
  const { website, ...row } = data;
  const { data: rec, error } = await db.from('sponsorships').insert(row).select('id,access_token').single();
  if (error || !rec) throw new Error('Your sponsorship could not be saved. Please try again.');
  return { id: rec.id, token: rec.access_token };
});

export const uploadSponsorshipProof = createServerFn({ method: 'POST' }).inputValidator(z.object({ id: z.string().uuid(), token: z.string().uuid(), type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']), base64: z.string().min(10).max(7_000_000) })).handler(async ({ data }) => {
  const db = await admin();
  const { data: s } = await db.from('sponsorships').select('id').eq('id', data.id).eq('access_token', data.token).maybeSingle();
  if (!s) throw new Error('This sponsorship could not be found.');
  const bytes = Uint8Array.from(atob(data.base64), c => c.charCodeAt(0));
  if (bytes.length > 5 * 1024 * 1024) throw new Error('Please upload a file under 5 MB.');
  const ext = data.type === 'application/pdf' ? 'pdf' : data.type.split('/')[1];
  const path = `sponsorship-proofs/${s.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await db.storage.from('cms-media').upload(path, bytes, { contentType: data.type });
  if (error) throw new Error('Your receipt could not be uploaded. Please try again.');
  await db.from('sponsorships').update({ proof_path: path, status: 'proof_submitted' }).eq('id', s.id);
  return { ok: true };
});

export const listSponsorships = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from('sponsorships').select('*').order('created_at', { ascending: false }).limit(300);
  if (error) throw new Error('Sponsorships could not be loaded.');
  return data ?? [];
});

export const updateSponsorship = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid(), status: z.enum(['awaiting_payment', 'proof_submitted', 'confirmed', 'cancelled']) })).handler(async ({ context, data }) => {
  const { error } = await context.supabase.from('sponsorships').update({ status: data.status }).eq('id', data.id);
  if (error) throw new Error('Could not update sponsorship.');
  return { ok: true };
});

export const getSponsorshipProofUrl = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid() })).handler(async ({ context, data }) => {
  if (!(await isStaff(context))) throw new Error('Access denied.');
  const { data: s } = await context.supabase.from('sponsorships').select('proof_path').eq('id', data.id).maybeSingle();
  if (!s?.proof_path) throw new Error('No receipt uploaded.');
  const db = await admin();
  const { data: signed, error } = await db.storage.from('cms-media').createSignedUrl(s.proof_path, 600);
  if (error || !signed) throw new Error('The receipt could not be opened.');
  return { url: signed.signedUrl };
});
