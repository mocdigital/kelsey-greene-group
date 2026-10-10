import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { SUBSCRIPTION_FREQUENCIES, addInterval, subscriptionEligible } from '@/lib/growth';

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {});

async function admin() { return (await import('@/integrations/supabase/client.server')).supabaseAdmin; }
async function settings(db: Awaited<ReturnType<typeof admin>>) {
  const { data } = await db.from('cms_records').select('slug,payload').eq('kind', 'setting').in('slug', ['currency', 'delivery', 'commerce']);
  const get = (s: string) => obj(data?.find(r => r.slug === s)?.payload);
  return { currency: get('currency'), delivery: get('delivery'), commerce: get('commerce') };
}
async function rolesOf(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.from('user_roles').select('role').eq('user_id', ctx.userId);
  return ((data ?? []) as { role: string }[]).map(r => r.role);
}
function espeeOf(p: Obj) { const n = Number(p['price_espee']); return Number.isFinite(n) && n >= 0 ? n : null; }

async function evaluatePromo(db: Awaited<ReturnType<typeof admin>>, code: string, subtotal: number) {
  const { data } = await db.from('promo_codes').select('*').ilike('code', code.trim()).maybeSingle();
  if (!data || !data.active) return { ok: false as const, message: 'This promo code is not valid.' };
  if (data.expires_at && new Date(data.expires_at) < new Date()) return { ok: false as const, message: 'This promo code has expired.' };
  if (subtotal < Number(data.min_subtotal_ngn)) return { ok: false as const, message: `This code needs a subtotal of at least ₦${Number(data.min_subtotal_ngn).toLocaleString()}.` };
  const discount = Math.min(subtotal, Math.round(subtotal * Number(data.percent_off) / 100 + Number(data.amount_off_ngn)));
  return { ok: true as const, code: data.code, discount, description: data.description };
}

const items = z.array(z.object({ slug: z.string().min(1).max(120), quantity: z.number().int().min(1).max(99), frequency: z.enum(SUBSCRIPTION_FREQUENCIES).optional() })).min(1).max(60);

async function priceBag(db: Awaited<ReturnType<typeof admin>>, bag: { slug: string; quantity: number; frequency?: string | undefined }[]) {
  const { data } = await db.from('cms_records').select('slug,title,payload').eq('kind', 'product').eq('status', 'published').in('slug', bag.map(i => i.slug));
  const { currency } = await settings(db);
  const rate = Number(currency['ngn_per_espee']);
  if (!(rate > 0)) throw new Error('Pricing is not configured yet.');
  const lines = bag.map(i => {
    const r = data?.find(d => d.slug === i.slug); const p = obj(r?.payload);
    if (!r || p['listing_type'] === 'property') throw new Error('One of the items in your bag is no longer available.');
    const espee = espeeOf(p); if (espee === null) throw new Error(`${r.title} has no price yet.`);
    const unit = Math.round(espee * rate);
    if (i.frequency && !subscriptionEligible(p)) throw new Error(`${r.title} is not available as a subscription.`);
    return { frequency: i.frequency ?? null, slug: i.slug, title: r.title, quantity: i.quantity, unit_espee: espee, unit_ngn: unit, line_ngn: unit * i.quantity, size: String(p['size'] ?? '') };
  });
  return { lines, subtotal: lines.reduce((n, l) => n + l.line_ngn, 0) };
}

export const getCheckoutConfig = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await admin(); const s = await settings(db);
  const zones = Array.isArray(s.delivery['zones']) ? (s.delivery['zones'] as Obj[]).map(z => ({ id: String(z['id']), label: String(z['label']), fee_ngn: Number(z['fee_ngn']) || 0, eta: String(z['eta'] ?? '') })) : [];
  return { zones, bank: { bank_name: String(s.commerce['bank_name'] ?? ''), account_name: String(s.commerce['account_name'] ?? ''), account_number: String(s.commerce['account_number'] ?? '') }, ngn_per_espee: Number(s.currency['ngn_per_espee']) || 0 };
});

export const validatePromo = createServerFn({ method: 'POST' }).inputValidator(z.object({ code: z.string().trim().min(2).max(40), items })).handler(async ({ data }) => {
  const db = await admin();
  const ip = getRequest().headers.get('cf-connecting-ip') ?? 'unknown';
  const { data: allowed } = await db.rpc('consume_submission_limit', { limit_key: `promo:${ip}` });
  if (!allowed) return { ok: false as const, message: 'Too many attempts. Please try again later.' };
  const { subtotal } = await priceBag(db, data.items);
  return evaluatePromo(db, data.code, subtotal);
});

export const placeOrder = createServerFn({ method: 'POST' }).inputValidator(z.object({
  items,
  customer: z.object({ full_name: z.string().trim().min(2).max(150), email: z.string().trim().email().max(200), phone: z.string().trim().min(7).max(40) }),
  address: z.object({ line1: z.string().trim().min(3).max(200), line2: z.string().trim().max(200).default(''), city: z.string().trim().min(2).max(100), state: z.string().trim().min(2).max(100), notes: z.string().trim().max(500).default('') }),
  zone: z.string().min(1).max(60),
  payment_method: z.enum(['bank_transfer', 'pay_on_delivery', 'card']),
  promo_code: z.string().trim().max(40).default(''),
  referral_code: z.string().trim().max(40).default(''),
})).handler(async ({ data }) => {
  const db = await admin();
  const ip = getRequest().headers.get('cf-connecting-ip') ?? 'unknown';
  const { data: allowed } = await db.rpc('consume_submission_limit', { limit_key: `order:${ip}:${data.customer.email.toLowerCase()}` });
  if (!allowed) throw new Error('Too many orders in a short time. Please try again later.');
  const { lines, subtotal } = await priceBag(db, data.items);
  const s = await settings(db);
  const zone = (Array.isArray(s.delivery['zones']) ? s.delivery['zones'] as Obj[] : []).find(z => z['id'] === data.zone);
  if (!zone) throw new Error('Please choose a delivery zone.');
  const fee = Number(zone['fee_ngn']) || 0;
  let discount = 0, promo: string | null = null;
  if (data.promo_code) { const r = await evaluatePromo(db, data.promo_code, subtotal); if (!r.ok) throw new Error(r.message); discount = r.discount; promo = r.code; }
  let referral: string | null = null;
  if (data.referral_code) { const { data: amb } = await db.from('programme_applications').select('referral_code').eq('programme', 'ambassador').eq('status', 'approved').eq('referral_code', data.referral_code.toUpperCase()).maybeSingle(); referral = amb?.referral_code ?? null; }
  const bearer = getRequest().headers.get('authorization')?.replace(/^Bearer /i, '');
  let userId: string | null = null;
  if (bearer) { const { data: who } = await db.auth.getUser(bearer); userId = who.user?.id ?? null; }
  if (!userId && lines.some(l => l.frequency)) throw new Error('Please sign in to start a subscription. One-time items can be ordered as a guest.');
  const payment_status = data.payment_method === 'bank_transfer' ? 'awaiting_transfer' : data.payment_method === 'pay_on_delivery' ? 'pay_on_delivery' : 'card_staging';
  const reference = `KG-${new Date().toISOString().slice(2, 10).replaceAll('-', '')}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const { data: order, error } = await db.from('orders').insert({
    user_id: userId, items: lines as never, subtotal_ngn: subtotal, delivery_fee_ngn: fee, discount_ngn: discount, total_ngn: subtotal + fee - discount,
    promo_code: promo, referral_code: referral, reference, customer_name: data.customer.full_name, customer_email: data.customer.email.toLowerCase(), customer_phone: data.customer.phone,
    shipping_address: data.address as never, delivery_zone: String(zone['label']), payment_method: data.payment_method, payment_status, fulfillment_status: 'received', status: 'placed',
  }).select('id,access_token').single();
  if (error) throw new Error('Your order could not be saved. Please try again.');
  const recurring = lines.filter(l => l.frequency);
  if (recurring.length && userId) {
    await db.from('subscriptions').insert(recurring.map(l => ({ user_id: userId, product_slug: l.slug, frequency: l.frequency!, quantity: l.quantity, status: 'active', order_id: order.id, next_delivery_at: addInterval(new Date(), l.frequency!).toISOString() })));
  }
  if (referral) {
    const { data: amb } = await db.from('programme_applications').select('user_id').eq('programme', 'ambassador').eq('status', 'approved').eq('referral_code', referral).maybeSingle();
    const pct = Number(s.commerce['commission_percent']) || 0, base = Math.max(0, subtotal - discount);
    await db.from('ambassador_commissions').insert({ order_id: order.id, order_reference: reference, referral_code: referral, user_id: amb?.user_id ?? null, base_ngn: base, percent: pct, amount_ngn: Math.round(base * pct / 100), status: 'pending' });
  }
  return { id: order.id, token: order.access_token };
});

export const getOrder = createServerFn({ method: 'POST' }).inputValidator(z.object({ id: z.string().uuid(), token: z.string().uuid() })).handler(async ({ data }) => {
  const db = await admin();
  const { data: o } = await db.from('orders').select('*').eq('id', data.id).eq('access_token', data.token).maybeSingle();
  if (!o) throw new Error('This order could not be found.');
  const { commerce } = await settings(db);
  const { access_token: _t, user_id: _u, ...safe } = o;
  return { order: safe, bank: { bank_name: String(commerce['bank_name'] ?? ''), account_name: String(commerce['account_name'] ?? ''), account_number: String(commerce['account_number'] ?? '') } };
});

export const trackReferralVisit = createServerFn({ method: 'POST' }).inputValidator(z.object({ code: z.string().trim().min(3).max(40), path: z.string().max(300).default('/') })).handler(async ({ data }) => {
  const db = await admin();
  const ip = getRequest().headers.get('cf-connecting-ip') ?? 'unknown';
  const { data: allowed } = await db.rpc('consume_submission_limit', { limit_key: `visit:${ip}` });
  if (!allowed) return { ok: false };
  const code = data.code.toUpperCase();
  const { data: amb } = await db.from('programme_applications').select('id').eq('programme', 'ambassador').eq('status', 'approved').eq('referral_code', code).maybeSingle();
  if (!amb) return { ok: false };
  await db.from('referral_visits').insert({ referral_code: code, path: data.path });
  return { ok: true };
});

export const getAmbassador = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: apps } = await context.supabase.from('programme_applications').select('id,status,referral_code,created_at').eq('user_id', context.userId).eq('programme', 'ambassador').order('created_at', { ascending: false });
  const approved = apps?.find(a => a.status === 'approved' && a.referral_code);
  if (!approved) return { status: apps?.[0]?.status ?? 'none', code: null, visits: 0, orders: [], sales_ngn: 0, commission_percent: 0, commission_ngn: 0, payouts: [], commissions: [] };
  const db = await admin(); const code = approved.referral_code!;
  const [{ count }, { data: orders }, { commerce }, { data: payouts }, { data: commissions }] = await Promise.all([
    db.from('referral_visits').select('id', { count: 'exact', head: true }).eq('referral_code', code),
    db.from('orders').select('reference,created_at,subtotal_ngn,discount_ngn,status,payment_status,fulfillment_status').eq('referral_code', code).order('created_at', { ascending: false }),
    settings(db),
    context.supabase.from('ambassador_payouts').select('*').order('created_at', { ascending: false }),
    context.supabase.from('ambassador_commissions').select('*').order('created_at', { ascending: false }),
  ]);
  const eligible = (orders ?? []).filter(o => o.status !== 'cancelled' && o.fulfillment_status !== 'cancelled');
  const sales = eligible.reduce((n, o) => n + Number(o.subtotal_ngn) - Number(o.discount_ngn), 0);
  const pct = Number(commerce['commission_percent']) || 0;
  return { status: 'approved', code, visits: count ?? 0, orders: orders ?? [], sales_ngn: sales, commission_percent: pct, commission_ngn: Math.round(sales * pct / 100), payouts: payouts ?? [], commissions: commissions ?? [] };
});

export const submitJobApplication = createServerFn({ method: 'POST' }).inputValidator(z.object({
  job_slug: z.string().min(1).max(120), full_name: z.string().trim().min(2).max(150), email: z.string().trim().email().max(200), phone: z.string().trim().max(40).default(''),
  location: z.string().trim().max(150).default(''), portfolio_url: z.union([z.literal(''), z.string().trim().url().max(300)]).default(''), experience: z.string().trim().max(100).default(''),
  cover_letter: z.string().trim().min(30).max(6000), website: z.string().max(0).default(''),
})).handler(async ({ data }) => {
  const db = await admin();
  const { data: allowed } = await db.rpc('consume_submission_limit', { limit_key: `job:${data.email.toLowerCase()}` });
  if (!allowed) throw new Error('Too many applications. Please try again later.');
  const { data: job } = await db.from('cms_records').select('id').eq('kind', 'job').eq('status', 'published').eq('slug', data.job_slug).maybeSingle();
  if (!job) throw new Error('This role is no longer open.');
  const { website: _w, ...entry } = data;
  const { error } = await db.from('job_applications').insert(entry);
  if (error) throw new Error('Your application could not be saved. Please try again.');
  return { ok: true };
});

// ---------- Administration ----------
const COMMERCE = ['super_admin', 'admin', 'commerce_manager'];
const PEOPLE = ['super_admin', 'admin', 'community_manager'];

export const getOperations = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const roles = await rolesOf(context);
  if (!roles.length) throw new Error('Access denied.');
  const db = await admin();
  const commerce = roles.some(r => COMMERCE.includes(r)), people = roles.some(r => PEOPLE.includes(r));
  const [orders, promos, jobs, payouts] = await Promise.all([
    commerce ? db.from('orders').select('id,reference,created_at,customer_name,customer_email,customer_phone,delivery_zone,shipping_address,items,total_ngn,payment_method,payment_status,fulfillment_status,promo_code,referral_code').order('created_at', { ascending: false }).limit(200) : null,
    commerce ? db.from('promo_codes').select('*').order('created_at', { ascending: false }) : null,
    people ? db.from('job_applications').select('*').order('created_at', { ascending: false }).limit(200) : null,
    people ? db.from('ambassador_payouts').select('*').order('created_at', { ascending: false }).limit(200) : null,
  ]);
  return { roles, orders: orders?.data ?? [], promos: promos?.data ?? [], jobs: jobs?.data ?? [], payouts: payouts?.data ?? [] };
});

export const updateOrder = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid(), fulfillment_status: z.enum(['received', 'processing', 'dispatched', 'delivered', 'cancelled']), payment_status: z.enum(['awaiting_transfer', 'pay_on_delivery', 'card_staging', 'paid', 'refunded', 'failed']) })).handler(async ({ context, data }) => {
  const roles = await rolesOf(context); if (!roles.some(r => COMMERCE.includes(r))) throw new Error('Access denied.');
  const db = await admin();
  const { error } = await db.from('orders').update({ fulfillment_status: data.fulfillment_status, payment_status: data.payment_status, status: data.fulfillment_status === 'cancelled' ? 'cancelled' : 'placed', updated_at: new Date().toISOString() }).eq('id', data.id);
  if (error) throw new Error('The order could not be updated.');
  if (data.fulfillment_status === 'cancelled' || data.payment_status === 'refunded') await db.from('ambassador_commissions').update({ status: 'void', updated_at: new Date().toISOString() }).eq('order_id', data.id).in('status', ['pending', 'approved']);
  await db.from('audit_logs').insert({ actor: context.userId, action: 'order_updated', entity: 'orders', entity_id: data.id, details: data as never });
  return { ok: true };
});

export const savePromo = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid().optional(), code: z.string().trim().regex(/^[A-Za-z0-9-]{3,40}$/), description: z.string().max(300), percent_off: z.number().min(0).max(100), amount_off_ngn: z.number().min(0), min_subtotal_ngn: z.number().min(0), active: z.boolean(), expires_at: z.string().max(40).nullable() })).handler(async ({ context, data }) => {
  const roles = await rolesOf(context); if (!roles.some(r => COMMERCE.includes(r))) throw new Error('Access denied.');
  const db = await admin();
  const { error } = await db.from('promo_codes').upsert({ ...data, code: data.code.toUpperCase(), expires_at: data.expires_at || null } as never);
  if (error) throw new Error('The promo code could not be saved. Codes must be unique.');
  await db.from('audit_logs').insert({ actor: context.userId, action: 'promo_saved', entity: 'promo_codes', details: data as never });
  return { ok: true };
});

export const updateJobApplication = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid(), status: z.enum(['new', 'reviewing', 'interview', 'offer', 'rejected']) })).handler(async ({ context, data }) => {
  const roles = await rolesOf(context); if (!roles.some(r => PEOPLE.includes(r))) throw new Error('Access denied.');
  const db = await admin(); const { error } = await db.from('job_applications').update({ status: data.status }).eq('id', data.id);
  if (error) throw new Error('The application could not be updated.'); return { ok: true };
});

export const savePayout = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ referral_code: z.string().trim().min(3).max(40), period_label: z.string().max(80), amount_ngn: z.number().min(0), status: z.enum(['pending', 'approved', 'paid']), note: z.string().max(300) })).handler(async ({ context, data }) => {
  const roles = await rolesOf(context); if (!roles.some(r => PEOPLE.includes(r))) throw new Error('Access denied.');
  const db = await admin();
  const { data: amb } = await db.from('programme_applications').select('user_id').eq('programme', 'ambassador').eq('referral_code', data.referral_code.toUpperCase()).maybeSingle();
  if (!amb?.user_id) throw new Error('No linked ambassador account uses this referral code.');
  const { error } = await db.from('ambassador_payouts').insert({ ...data, referral_code: data.referral_code.toUpperCase(), user_id: amb.user_id });
  if (error) throw new Error('The payout could not be recorded.');
  await db.from('audit_logs').insert({ actor: context.userId, action: 'payout_recorded', entity: 'ambassador_payouts', details: data as never });
  return { ok: true };
});

const ROLE_VALUES = ['super_admin', 'admin', 'content_editor', 'publisher', 'commerce_manager', 'community_manager'] as const;
export const listUsers = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const roles = await rolesOf(context); if (!roles.includes('super_admin')) throw new Error('Only super administrators can manage users.');
  const db = await admin();
  const [{ data: users, error }, { data: all }] = await Promise.all([db.auth.admin.listUsers({ perPage: 500 }), db.from('user_roles').select('user_id,role')]);
  if (error) throw new Error('Users could not be loaded.');
  return users.users.map(u => ({ id: u.id, email: u.email ?? '', created_at: u.created_at, last_sign_in_at: u.last_sign_in_at ?? null, roles: (all ?? []).filter(r => r.user_id === u.id).map(r => r.role as string) }));
});

export const setUserRole = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ user_id: z.string().uuid(), role: z.enum(ROLE_VALUES), grant: z.boolean() })).handler(async ({ context, data }) => {
  const roles = await rolesOf(context); if (!roles.includes('super_admin')) throw new Error('Only super administrators can manage roles.');
  if (!data.grant && data.user_id === context.userId && data.role === 'super_admin') throw new Error('You cannot remove your own super administrator role.');
  const db = await admin();
  const { error } = data.grant ? await db.from('user_roles').upsert({ user_id: data.user_id, role: data.role }, { onConflict: 'user_id,role' }) : await db.from('user_roles').delete().eq('user_id', data.user_id).eq('role', data.role);
  if (error) throw new Error('The role could not be updated.');
  await db.from('audit_logs').insert({ actor: context.userId, action: data.grant ? 'role_granted' : 'role_revoked', entity: 'user_roles', details: data as never });
  return { ok: true };
});
