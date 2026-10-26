import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { listSponsorships, updateSponsorship, getSponsorshipProofUrl } from '@/lib/sponsorship.functions';

const STATUSES = ['awaiting_payment', 'proof_submitted', 'confirmed', 'cancelled'] as const;
const nice = (s: string) => s.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());

export function SponsorshipsPanel() {
  const fetch = useServerFn(listSponsorships), upd = useServerFn(updateSponsorship), proof = useServerFn(getSponsorshipProofUrl), qc = useQueryClient();
  const [msg, setMsg] = useState('');
  const { data, error, isPending } = useQuery({ queryKey: ['admin-sponsorships'], queryFn: () => fetch(), retry: false });
  if (isPending) return <p>Loading sponsorships…</p>;
  if (error) return <p role="alert">{error.message}</p>;
  return <section>
    {msg && <p className="notice" role="status">{msg}</p>}
    {data.length ? data.map(s => <article key={s.id} className="admin-item"><div>
      <h3>{s.first_name} {s.last_name} · {s.boxes ? `${s.boxes} boxes` : 'Custom amount'} · {Number(s.amount).toLocaleString('en-US')} {s.currency}</h3>
      <p>{new Date(s.created_at).toLocaleString()} · {s.email} · {s.phone} · {[s.city, s.country].filter(Boolean).join(', ')}{s.organisation && ` · ${s.organisation}`}</p>
      <p>Paying by {s.payment_method === 'espees' ? 'ESPEES' : 'Naira bank transfer'}{s.note && ` · ${s.note}`}</p>
      {s.proof_path ? <Button size="sm" variant="outline" type="button" onClick={async () => { try { const r = await proof({ data: { id: s.id } }); window.open(r.url, '_blank', 'noopener'); } catch (e) { setMsg(e instanceof Error ? e.message : 'Could not open receipt.'); } }}>View proof of payment</Button> : <p><small>No proof of payment uploaded yet.</small></p>}
    </div><select aria-label="Sponsorship status" defaultValue={s.status} onChange={async e => { setMsg(''); try { await upd({ data: { id: s.id, status: e.target.value as typeof STATUSES[number] } }); await qc.invalidateQueries({ queryKey: ['admin-sponsorships'] }); setMsg('Sponsorship updated.'); } catch (err) { setMsg(err instanceof Error ? err.message : 'Update failed.'); } }}>{STATUSES.map(v => <option key={v} value={v}>{nice(v)}</option>)}</select></article>) : <p className="empty-state">No sponsorships yet.</p>}
  </section>;
}
