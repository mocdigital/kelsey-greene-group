import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { DEFAULT_MILESTONES, SUBSCRIPTION_FREQUENCIES, addInterval } from '@/lib/growth';

async function admin() { return (await import('@/integrations/supabase/client.server')).supabaseAdmin; }
async function rolesOf(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.from('user_roles').select('role').eq('user_id', ctx.userId);
  return ((data ?? []) as { role: string }[]).map(r => r.role);
}
const CAMPAIGN = ['super_admin', 'admin', 'community_manager'];
const PEOPLE = ['super_admin', 'admin', 'community_manager'];

// ---------- 1 Million Breakfast campaign ----------
export const getCampaignAdmin = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const roles = await rolesOf(context); if (!roles.some(r => CAMPAIGN.includes(r))) throw new Error('Access denied.');
  const [{ data: progress }, { data: log }] = await Promise.all([
    context.supabase.from('campaign_progress').select('*').eq('id', 'movement').maybeSingle(),
    context.supabase.from('campaign_progress_log').select('*').eq('campaign_id', 'movement').order('created_at', { ascending: false }).limit(50),
  ]);
  return { progress, log: log ?? [] };
});

export const updateCampaign = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({
  mode: z.enum(['set', 'add']), value: z.number().int().min(-1_000_000_000).max(1_000_000_000),
  note: z.string().trim().min(3).max(300),
  goal: z.number().int().min(1).max(1_000_000_000),
  milestones: z.array(z.number().int().min(1).max(1_000_000_000)).min(1).max(20),
})).handler(async ({ context, data }) => {
  const roles = await rolesOf(context); if (!roles.some(r => CAMPAIGN.includes(r))) throw new Error('Access denied.');
  const db = await admin();
  const { data: current } = await db.from('campaign_progress').select('verified_experiences').eq('id', 'movement').maybeSingle();
  const previous = Number(current?.verified_experiences ?? 0);
  const next = data.mode === 'set' ? data.value : previous + data.value;
  if (next < 0) throw new Error('Verified experiences cannot go below zero.');
  const milestones = [...new Set(data.milestones)].sort((a, b) => a - b);
  const { error } = await db.from('campaign_progress').upsert({ id: 'movement', verified_experiences: next, goal: data.goal, milestones, updated_at: new Date().toISOString(), updated_by: context.userId });
  if (error) throw new Error('The campaign could not be updated.');
  await db.from('campaign_progress_log').insert({ campaign_id: 'movement', previous_value: previous, new_value: next, delta: next - previous, note: data.note, actor: context.userId });
  await db.from('audit_logs').insert({ actor: context.userId, action: 'campaign_updated', entity: 'campaign_progress', details: { previous, next, goal: data.goal, milestones, note: data.note } as never });
  return { ok: true, verified_experiences: next };
});

// ---------- Commissions & payouts ----------
export const getCommissionQueue = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const roles = await rolesOf(context); if (!roles.some(r => PEOPLE.includes(r))) throw new Error('Access denied.');
  const db = await admin();
  const { data } = await db.from('ambassador_commissions').select('*').order('created_at', { ascending: false }).limit(300);
  return data ?? [];
});

export const reviewCommission = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid(), status: z.enum(['approved', 'rejected', 'pending']) })).handler(async ({ context, data }) => {
  const roles = await rolesOf(context); if (!roles.some(r => PEOPLE.includes(r))) throw new Error('Access denied.');
  const db = await admin();
  const { error } = await db.from('ambassador_commissions').update({ status: data.status, updated_at: new Date().toISOString() }).eq('id', data.id).in('status', ['pending', 'approved', 'rejected']);
  if (error) throw new Error('The commission could not be updated.');
  await db.from('audit_logs').insert({ actor: context.userId, action: `commission_${data.status}`, entity: 'ambassador_commissions', entity_id: data.id, details: data as never });
  return { ok: true };
});

export const createPayoutFromApproved = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ referral_code: z.string().trim().min(3).max(40), period_label: z.string().trim().min(2).max(80) })).handler(async ({ context, data }) => {
  const roles = await rolesOf(context); if (!roles.some(r => PEOPLE.includes(r))) throw new Error('Access denied.');
  const db = await admin(); const code = data.referral_code.toUpperCase();
  const { data: rows } = await db.from('ambassador_commissions').select('id,amount_ngn,user_id').eq('referral_code', code).eq('status', 'approved');
  if (!rows?.length) throw new Error('There are no approved commissions for this code.');
  const userId = rows.find(r => r.user_id)?.user_id;
  if (!userId) throw new Error('No linked ambassador account uses this referral code.');
  const amount = rows.reduce((n, r) => n + Number(r.amount_ngn), 0);
  const { data: payout, error } = await db.from('ambassador_payouts').insert({ user_id: userId, referral_code: code, period_label: data.period_label, amount_ngn: amount, status: 'approved', note: `${rows.length} approved commission${rows.length === 1 ? '' : 's'}` }).select('id').single();
  if (error) throw new Error('The payout could not be created.');
  await db.from('ambassador_commissions').update({ status: 'scheduled', payout_id: payout.id, updated_at: new Date().toISOString() }).in('id', rows.map(r => r.id));
  await db.from('audit_logs').insert({ actor: context.userId, action: 'payout_created', entity: 'ambassador_payouts', entity_id: payout.id, details: { code, amount, count: rows.length } as never });
  return { ok: true };
});

export const markPayoutPaid = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid() })).handler(async ({ context, data }) => {
  const roles = await rolesOf(context); if (!roles.some(r => PEOPLE.includes(r))) throw new Error('Access denied.');
  const db = await admin();
  const { error } = await db.from('ambassador_payouts').update({ status: 'paid' }).eq('id', data.id);
  if (error) throw new Error('The payout could not be updated.');
  await db.from('ambassador_commissions').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('payout_id', data.id);
  await db.from('audit_logs').insert({ actor: context.userId, action: 'payout_paid', entity: 'ambassador_payouts', entity_id: data.id, details: {} as never });
  return { ok: true };
});

// ---------- Subscriptions & Breakfast Club ----------
export const updateSubscription = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({
  id: z.string().uuid(), action: z.enum(['pause', 'resume', 'cancel', 'frequency']), frequency: z.enum(SUBSCRIPTION_FREQUENCIES).optional(),
})).handler(async ({ context, data }) => {
  const db = await admin();
  const { data: sub } = await db.from('subscriptions').select('*').eq('id', data.id).eq('user_id', context.userId).maybeSingle();
  if (!sub) throw new Error('This subscription could not be found.');
  if (sub.status === 'cancelled') throw new Error('This subscription has been cancelled.');
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { updated_at: now };
  if (data.action === 'pause') patch.status = 'paused';
  if (data.action === 'resume') { patch.status = 'active'; patch.next_delivery_at = addInterval(new Date(), sub.frequency).toISOString(); }
  if (data.action === 'cancel') { patch.status = 'cancelled'; patch.next_delivery_at = null; }
  if (data.action === 'frequency') { if (!data.frequency) throw new Error('Choose a frequency.'); patch.frequency = data.frequency; if (sub.status === 'active') patch.next_delivery_at = addInterval(new Date(), data.frequency).toISOString(); }
  const { error } = await db.from('subscriptions').update(patch as never).eq('id', data.id).eq('user_id', context.userId);
  if (error) throw new Error('Your subscription could not be updated.');
  return { ok: true };
});

const DEFAULT_PERKS = [
  { title: 'Member recipes', body: 'Seasonal breakfast recipes shared with Breakfast Club members first.' },
  { title: 'Early access', body: 'First look at new products, boxes and Global African Breakfast Day events.' },
  { title: 'Community table', body: 'Invitations to member tastings, community breakfasts and story features.' },
];
export const getBreakfastClub = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [{ data: apps }, { data: subs }] = await Promise.all([
    context.supabase.from('programme_applications').select('status,created_at').eq('user_id', context.userId).eq('programme', 'breakfast-club').order('created_at', { ascending: false }),
    context.supabase.from('subscriptions').select('status').eq('user_id', context.userId),
  ]);
  const approved = apps?.some(a => a.status === 'approved');
  const subscriber = subs?.some(s => s.status === 'active' || s.status === 'paused');
  const member = Boolean(approved || subscriber);
  const status = member ? 'member' : apps?.[0]?.status === 'pending' ? 'pending' : 'none';
  if (!member) return { status, since: null, perks: DEFAULT_PERKS.map(p => ({ title: p.title, body: '' })), content: [] };
  const { data: records } = await context.supabase.from('cms_records').select('slug,title,description,kind').eq('status', 'published').in('kind', ['club_content', 'recipe']).order('position').limit(6);
  return { status, since: apps?.find(a => a.status === 'approved')?.created_at ?? null, perks: DEFAULT_PERKS, content: records ?? [] };
});

export { DEFAULT_MILESTONES };
