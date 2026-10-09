import {createFileRoute,Link} from '@tanstack/react-router';
import {useQuery} from '@tanstack/react-query';
import {useServerFn} from '@tanstack/react-start';
import {useState} from 'react';
import {Copy} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Eyebrow} from '@/components/editorial';
import {getAmbassador} from '@/lib/commerce.functions';
import {meta} from '@/lib/content';
import {ngn,label} from '@/lib/money';
import '@/components/commerce-pages.css';
export const Route=createFileRoute('/_authenticated/ambassador')({head:()=>meta('Ambassador dashboard','Track your Kelsey Greene referral link, visits, orders and commission.'),component:Ambassador});
function Ambassador(){const fetch=useServerFn(getAmbassador),{data,error,isPending}=useQuery({queryKey:['ambassador'],queryFn:()=>fetch()}),[copied,setCopied]=useState(false);
 if(isPending)return <section className="section container"><p>Loading your dashboard…</p></section>;
 if(error)return <section className="section container"><p role="alert">{error.message}</p></section>;
 if(!data?.code)return <section className="section"><div className="container legal-content"><Eyebrow>AMBASSADOR PROGRAMME</Eyebrow><h1 className="mt-5">{data?.status==='pending'?'Your application is being reviewed.':'Become an ambassador.'}</h1><p>{data?.status==='pending'?'Your referral link and dashboard will appear here once the community team approves your application.':'Share the 1 Million Breakfast Movement with your community. Apply using the same email as this account.'}</p>{data?.status!=='pending'&&<Button asChild><Link to="/participate/$programme" params={{programme:'ambassador'}}>Apply now</Link></Button>}</div></section>;
 const link=typeof window!=='undefined'?`${window.location.origin}/shop?ref=${data.code}`:'';
 return <section className="section"><div className="container"><Eyebrow>AMBASSADOR DASHBOARD</Eyebrow><h1 className="mt-5">Your referrals.</h1>
 <div className="kg-panel mt-8"><h3>Your referral link</h3><p>Code <b>{data.code}</b></p><div className="kg-promo"><input readOnly value={link} aria-label="Referral link"/><Button variant="outline" onClick={()=>{navigator.clipboard.writeText(link);setCopied(true)}}><Copy/>{copied?'Copied':'Copy'}</Button></div></div>
 <div className="kg-stats"><div className="kg-stat"><span>Visits</span><strong>{data.visits}</strong></div><div className="kg-stat"><span>Attributed orders</span><strong>{data.orders.length}</strong></div><div className="kg-stat"><span>Eligible sales</span><strong>{ngn(data.sales_ngn)}</strong></div><div className="kg-stat"><span>Est. commission ({data.commission_percent}%)</span><strong>{ngn(data.commission_ngn)}</strong></div></div>
 <p className="kg-sample">Commission figures are estimates using the current illustrative rate and are confirmed by the team before payout.</p>
 <h2 className="mt-10">Attributed orders</h2>{data.orders.length?<div className="kg-table-wrap"><table className="list-table"><thead><tr><th>Order</th><th>Date</th><th>Sale</th><th>Status</th></tr></thead><tbody>{data.orders.map(o=><tr key={o.reference}><td>{o.reference}</td><td>{new Date(o.created_at).toLocaleDateString()}</td><td>{ngn(Number(o.subtotal_ngn)-Number(o.discount_ngn))}</td><td>{label(o.fulfillment_status)}</td></tr>)}</tbody></table></div>:<p className="empty-state">No orders yet. Share your link to get started.</p>}
 <h2 className="mt-10">Payout history</h2>{data.payouts.length?<div className="kg-table-wrap"><table className="list-table"><thead><tr><th>Period</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead><tbody>{data.payouts.map(p=><tr key={p.id}><td>{p.period_label}</td><td>{ngn(p.amount_ngn)}</td><td>{label(p.status)}</td><td>{p.note}</td></tr>)}</tbody></table></div>:<p className="empty-state">No payouts recorded yet.</p>}
 </div></section>}
