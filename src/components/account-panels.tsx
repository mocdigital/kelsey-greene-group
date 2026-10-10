import {Link} from '@tanstack/react-router';
import {useQuery,useQueryClient,useSuspenseQuery} from '@tanstack/react-query';
import {useServerFn} from '@tanstack/react-start';
import {useState} from 'react';
import {Pause,Play,X,Sparkles} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {updateSubscription,getBreakfastClub} from '@/lib/growth.functions';
import {SUBSCRIPTION_FREQUENCIES,frequencyLabels,type SubscriptionFrequency} from '@/lib/growth';
import {contentOptions} from '@/lib/content';
import {label} from '@/lib/money';

type Sub={id:string;product_slug:string;frequency:string;status:string;quantity:number;next_delivery_at:string|null;created_at:string};
export function SubscriptionsPanel({subscriptions}:{subscriptions:Sub[]}){
 const update=useServerFn(updateSubscription),qc=useQueryClient(),{data}=useSuspenseQuery(contentOptions),[msg,setMsg]=useState(''),[busy,setBusy]=useState('');
 async function act(id:string,action:'pause'|'resume'|'cancel'|'frequency',frequency?:SubscriptionFrequency){if(action==='cancel'&&!window.confirm('Cancel this subscription? You can start a new one any time.'))return;setBusy(id);setMsg('');try{await update({data:{id,action,frequency}});await qc.invalidateQueries({queryKey:['account']});setMsg(action==='frequency'?'Delivery frequency updated.':`Subscription ${action==='pause'?'paused':action==='resume'?'resumed':'cancelled'}.`)}catch(e){setMsg(e instanceof Error?e.message:'Could not update subscription.')}finally{setBusy('')}}
 const title=(slug:string)=>data.find(r=>r.kind==='product'&&r.slug===slug)?.title??slug;
 return <><h3>Your subscriptions</h3>{msg&&<p className="notice" role="status">{msg}</p>}{subscriptions.length?subscriptions.map(s=><article key={s.id} className="admin-item"><div><h3>{s.quantity} × {title(s.product_slug)}</h3><p>{frequencyLabels[s.frequency as SubscriptionFrequency]??s.frequency} · {label(s.status)}{s.status==='active'&&s.next_delivery_at&&` · next delivery around ${new Date(s.next_delivery_at).toLocaleDateString()}`}</p></div>{s.status!=='cancelled'&&<div className="admin-buttons flex-wrap"><select aria-label={`Frequency for ${title(s.product_slug)}`} value={s.frequency} disabled={busy===s.id} onChange={e=>act(s.id,'frequency',e.target.value as SubscriptionFrequency)}>{SUBSCRIPTION_FREQUENCIES.map(f=><option key={f} value={f}>{frequencyLabels[f]}</option>)}</select>{s.status==='paused'?<Button size="sm" variant="outline" disabled={busy===s.id} onClick={()=>act(s.id,'resume')}><Play/>Resume</Button>:<Button size="sm" variant="outline" disabled={busy===s.id} onClick={()=>act(s.id,'pause')}><Pause/>Pause</Button>}<Button size="sm" variant="ghost" disabled={busy===s.id} onClick={()=>act(s.id,'cancel')}><X/>Cancel</Button></div>}</article>):<p className="empty-state">You have no subscriptions yet. Choose “Subscribe” on any breakfast product to have it delivered every month, 3 months or 6 months. <Link to="/shop" className="underline">Browse the range</Link></p>}<p className="kg-sample">Renewals are confirmed by the team before each delivery, and you pay by bank transfer or on delivery. Nothing is charged automatically.</p></>;
}

export function BreakfastClubPanel(){
 const fetch=useServerFn(getBreakfastClub),{data,error,isPending}=useQuery({queryKey:['breakfast-club'],queryFn:()=>fetch()});
 if(isPending)return <p>Loading your membership…</p>;if(error)return <p role="alert">{error.message}</p>;
 const member=data.status==='member';
 return <><div className={member?'club-card is-member':'club-card'}><small>BREAKFAST CLUB</small><h3>{member?'You’re a member.':data.status==='pending'?'Your membership is being reviewed.':'Join the Breakfast Club.'}</h3><p>{member?`Member${data.since?` since ${new Date(data.since).toLocaleDateString()}`:''}. Thank you for being part of the 1 Million Breakfast Movement.`:'Members get early access, member recipes and invitations to community breakfasts. Join by applying, or by starting any breakfast subscription.'}</p>{!member&&data.status!=='pending'&&<div className="admin-buttons"><Button asChild><Link to="/participate/$programme" params={{programme:'breakfast-club'}}>Apply to join</Link></Button><Button variant="outline" asChild><Link to="/shop">Start a subscription</Link></Button></div>}</div>
 <h3 className="mt-8">Member benefits</h3><div className="club-perks">{data.perks.map(p=><div key={p.title} className={member?'':'is-locked'}><Sparkles size={16}/><b>{p.title}</b>{member?<p>{p.body}</p>:<p>Unlocks when you join.</p>}</div>)}</div>
 {member&&<><h3 className="mt-8">Members’ table</h3>{data.content.length?<ul className="club-content">{data.content.map(c=><li key={c.slug}>{c.kind==='recipe'?<Link to="/recipes/$slug" params={{slug:c.slug}} className="arrow-link">{c.title}</Link>:<b>{c.title}</b>}<p>{c.description}</p></li>)}</ul>:<p className="empty-state">New member content is on its way.</p>}</>}</>;
}
