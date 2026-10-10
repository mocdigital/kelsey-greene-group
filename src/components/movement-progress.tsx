import {useQuery} from '@tanstack/react-query';
import {Check,PartyPopper} from 'lucide-react';
import {supabase} from '@/integrations/supabase/client';
import {campaignState,compactNumber,DEFAULT_MILESTONES} from '@/lib/growth';

type State=ReturnType<typeof campaignState>;
export function MilestoneTrack({state}:{state:State}){
 return <ol className="milestone-track" aria-label="Campaign milestones">{state.milestones.map(m=><li key={m.value} className={`milestone is-${m.status}`} aria-label={`${m.value.toLocaleString()} breakfasts — ${m.status==='reached'?'reached':m.status==='next'?`next milestone, ${m.progress}% of the way`:'upcoming'}`}><span className="milestone-dot">{m.status==='reached'?<Check size={14}/>:null}</span><strong>{compactNumber(m.value)}</strong><small>{m.status==='reached'?'Reached':m.status==='next'?`${m.progress}%`:'Upcoming'}</small></li>)}</ol>;
}

/** Public, database-backed progress towards the 1,000,000 verified breakfast experiences goal. */
export function MovementProgress(){
 const {data,isPending,isError}=useQuery({queryKey:['campaign-progress'],queryFn:async()=>{const {data,error}=await supabase.from('campaign_progress').select('verified_experiences,goal,milestones,updated_at').eq('id','movement').maybeSingle();if(error)throw error;return data;},staleTime:60_000});
 const state=campaignState(Number(data?.verified_experiences??0),Number(data?.goal??1000000),data?.milestones??DEFAULT_MILESTONES);
 return <div className="movement-progress" aria-busy={isPending}>
  {state.latestReached&&<p className="movement-celebrate" role="status"><PartyPopper size={18}/>{state.complete?'One million verified breakfasts — thank you!':`Milestone reached: ${state.latestReached.toLocaleString()} verified breakfasts.`}</p>}
  <div className="movement-progress-figures"><div><small>VERIFIED SO FAR</small><strong>{isPending?'—':state.verified.toLocaleString()}</strong></div><div><small>STILL TO GO</small><strong>{isPending?'—':state.remaining.toLocaleString()}</strong></div><div><small>OF THE GOAL</small><strong>{isPending?'—':`${state.percent}%`}</strong></div></div>
  <div className="movement-progress-bar"><span style={{width:`${Math.max(state.percent,state.verified?0.6:0)}%`}}/></div>
  <MilestoneTrack state={state}/>
  {isError&&<p><small>Live progress is unavailable right now.</small></p>}
  {data?.updated_at&&<p><small>Verified by the Movement team · updated {new Date(data.updated_at).toLocaleDateString()}</small></p>}
 </div>;
}
