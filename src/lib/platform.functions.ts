import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { getRequest, setResponseHeader } from '@tanstack/react-start/server';

export const getContent = createServerFn({ method: 'GET' }).handler(async () => {
  setResponseHeader('Cache-Control', 'no-store');
  const key = (process.env['SUPABASE_PUBLISHABLE_KEY'] ?? process.env['VITE_SUPABASE_PUBLISHABLE_KEY'])!;
  const client = createClient((process.env['SUPABASE_URL'] ?? process.env['VITE_SUPABASE_URL'])!, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const headers = new Headers(init?.headers); if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization'); headers.set('apikey',key); return fetch(input,{...init,headers}); } } });
  const {data,error} = await client.from('cms_records').select('id,kind,slug,title,description,payload,status,position,seo_title,seo_description').eq('status','published').order('position');
  if(error) throw new Error('The content could not be loaded. Please try again.');
  return data ?? [];
});

export const submitEnquiry = createServerFn({method:'POST'}).inputValidator(z.object({ full_name:z.string().trim().min(2).max(150),email:z.string().email().max(200),organisation:z.string().max(200).default(''),business_area:z.string().min(1).max(100),enquiry_type:z.string().min(1).max(100),message:z.string().trim().min(10).max(5000),website:z.string().max(0).default('') })).handler(async({data})=>{
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const ip=getRequest().headers.get('cf-connecting-ip') ?? 'unknown';
  const {data:allowed,error:limitError}=await supabaseAdmin.rpc('consume_submission_limit',{limit_key:`enquiry:${ip}:${data.email.toLowerCase()}`});
  if(limitError || !allowed) throw new Error('Too many enquiries. Please try again later.');
  const {website,...entry}=data;
  const {data:record,error}=await supabaseAdmin.from('enquiry_submissions').insert(entry).select('id').single();
  if(error) throw new Error('Your enquiry could not be saved. Please try again.');
  return {id:record.id};
});

export const submitApplication = createServerFn({method:'POST'}).inputValidator(z.object({programme:z.enum(['ambassador','distributor','retailer','breakfast-club','sponsorship','breakfast-day']),full_name:z.string().trim().min(2).max(150),email:z.string().email().max(200),phone:z.string().max(80).default(''),location:z.string().max(200).default(''),organisation:z.string().max(200).default(''),message:z.string().max(5000).default(''),website:z.string().max(0).default('') })).handler(async({data})=>{
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const {data:allowed,error:limitError}=await supabaseAdmin.rpc('consume_submission_limit',{limit_key:`application:${data.email.toLowerCase()}`});
  if(limitError || !allowed) throw new Error('Too many applications. Please try again later.');
  const {website,...entry}=data;
  const bearer=getRequest().headers.get('authorization')?.replace(/^Bearer /i,'');
   let userId:string|null=null;
   if(bearer){const {data:identity,error:identityError}=await supabaseAdmin.auth.getUser(bearer);if(!identityError && identity.user?.email?.toLowerCase()===entry.email.toLowerCase())userId=identity.user.id;}
   const {data:record,error}=await supabaseAdmin.from('programme_applications').insert({...entry,user_id:userId}).select('id').single();
  if(error) throw new Error('Your application could not be saved. Please try again.');
  return {id:record.id};
});

export const getAccount = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const [profile,orders,subscriptions,applications,roles] = await Promise.all([
    context.supabase.from('profiles').select('*').eq('id',context.userId).maybeSingle(),
    context.supabase.from('orders').select('*').eq('user_id',context.userId).order('created_at',{ascending:false}),
    context.supabase.from('subscriptions').select('*').eq('user_id',context.userId),
    context.supabase.from('programme_applications').select('*').eq('user_id',context.userId),
    context.supabase.from('user_roles').select('role').eq('user_id',context.userId)
  ]);
  if([profile,orders,subscriptions,applications,roles].some(r=>r.error)) throw new Error('Your account could not be loaded.');
  return {profile:profile.data,orders:orders.data??[],subscriptions:subscriptions.data??[],applications:applications.data??[],roles:roles.data??[]};
});
export const saveProfile = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({full_name:z.string().min(2).max(150),phone:z.string().max(80),organisation:z.string().max(200)})).handler(async({context,data})=>{
  const {error}=await context.supabase.from('profiles').update(data).eq('id',context.userId); if(error) throw new Error('Your profile could not be saved.'); return {ok:true};
});
export const getAdminData = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {data:roles,error}=await context.supabase.from('user_roles').select('role').eq('user_id',context.userId);
  if(error || !roles?.length) throw new Error('Administration access has not been granted to this account.');
  const names=roles.map(r=>r.role);
  const {data:records,error:recordsError}=await context.supabase.from('cms_records').select('*').order('position');
  if(recordsError) throw new Error('Content could not be loaded.');
  const {data:applications}=await context.supabase.from('programme_applications').select('*').order('created_at',{ascending:false});
  const {data:enquiries}=await context.supabase.from('enquiry_submissions').select('*').order('created_at',{ascending:false});
  const {data:logs}=await context.supabase.from('audit_logs').select('*').order('created_at',{ascending:false}).limit(100);
  const {data:versions}=await context.supabase.from('content_versions').select('*').order('created_at',{ascending:false}).limit(100);
  return {roles:names,records:records??[],applications:applications??[],enquiries:enquiries??[],logs:logs??[],versions:versions??[]};
});
export const saveContent = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid().optional(),kind:z.string().min(1).max(80),slug:z.string().regex(/^[a-z0-9-]+$/),title:z.string().min(1).max(200),description:z.string().max(10000),payload:z.record(z.unknown()),status:z.enum(['draft','published','archived']),position:z.number().int(),seo_title:z.string().max(200),seo_description:z.string().max(500)})).handler(async({context,data})=>{
  const {data:roles}=await context.supabase.from('user_roles').select('role').eq('user_id',context.userId); const names=roles?.map(r=>r.role)??[];
  if(!names.length) throw new Error('Access denied.');
  // External hosts (e.g. Vercel) have no service key; fall back to the editor's own session, which RLS checks.
  const supabaseAdmin=process.env['SUPABASE_SERVICE_ROLE_KEY'] ? (await import('@/integrations/supabase/client.server')).supabaseAdmin : context.supabase;
  const previous=data.id ? await supabaseAdmin.from('cms_records').select('*').eq('id',data.id).single() : null;
  const admin=names.includes('admin') || names.includes('super_admin');
  const canEdit=admin || names.includes('publisher') || (names.includes('content_editor') && !['product','setting'].includes(data.kind)) || (names.includes('commerce_manager') && ['product','bundle'].includes(data.kind));
  const canPublish=admin || names.includes('publisher');
  if(previous?.error) throw new Error('The record could not be loaded.');
   if(previous?.data && previous.data.kind!==data.kind && !admin) throw new Error('Only administrators can change a content type.');
   const publishing=data.status==='published' || previous?.data?.status==='published' || data.status!==(previous?.data?.status??'draft');
  if(!canEdit || (publishing && !canPublish)) throw new Error('Your role cannot make this change. Editing and publishing have separate permissions.');
  const {data:record,error}=await supabaseAdmin.from('cms_records').upsert(data as never).select('id').single();
  if(error) throw new Error('Content could not be saved. Check the fields and unique slug.');
  await supabaseAdmin.from('audit_logs').insert({actor:context.userId,action:'content_saved',entity:'cms_records',entity_id:record.id,details:{previous:previous?.data??null,current:data} as never});
  return {id:record.id};
});
export const reviewApplication = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid(),status:z.enum(['approved','rejected','pending'])})).handler(async({context,data})=>{
  const {data:roles}=await context.supabase.from('user_roles').select('role').eq('user_id',context.userId);
  if(!roles?.some(r=>r.role==='admin'||r.role==='community_manager')) throw new Error('Access denied.');
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const {data:application}=await supabaseAdmin.from('programme_applications').select('programme,referral_code').eq('id',data.id).single();
  const code=application?.programme==='ambassador'&&data.status==='approved' ? application.referral_code??`KG-${crypto.randomUUID().slice(0,8).toUpperCase()}` : application?.referral_code;
  const {error}=await supabaseAdmin.from('programme_applications').update({status:data.status,referral_code:code??null}).eq('id',data.id); if(error) throw new Error('The application could not be updated.');
  await supabaseAdmin.from('audit_logs').insert({actor:context.userId,action:`application_${data.status}`,entity:'programme_applications',entity_id:data.id}); return {ok:true};
});
