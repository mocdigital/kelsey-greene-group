import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { submitEnquiry } from '@/lib/platform.functions';
import { contentOptions, payload } from '@/lib/content';
import { currencies } from '@/lib/pricing';
import { useSite } from './site-provider';

export const SPONSOR_BOX_OPTIONS = [10, 50, 100, 500] as const;
export const ESPEE_PER_BOX = 8;
export const sponsorEspee = (boxes: number) => boxes * ESPEE_PER_BOX;
const rateKey: Record<string, string> = { NGN: 'ngn_per_espee', USD: 'usd_per_espee', GHS: 'ghs_per_espee' };
export function espeeToCurrency(espee: number, currency: string, rates: Record<string, unknown>) {
  if (currency === 'ESPEE') return espee;
  const rate = Number(rates[rateKey[currency]]);
  return rate > 0 ? Math.round(espee * rate * 100) / 100 : 0;
}

export function SponsorBoxButton({ children = 'Sponsor a box', variant = 'outline', className = 'movement-button' }: { children?: React.ReactNode; variant?: 'outline' | 'default'; className?: string }) {
  const [open, setOpen] = useState(false);
  return <><Button type="button" variant={variant} className={className} onClick={() => setOpen(true)}>{children} <ArrowRight /></Button><SponsorBoxDialog open={open} onOpenChange={setOpen} /></>;
}

function SponsorBoxDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data } = useSuspenseQuery(contentOptions);
  const rates = payload(data.find(r => r.kind === 'setting' && r.slug === 'currency'));
  const site = useSite();
  const send = useServerFn(submitEnquiry);
  const [currency, setCurrency] = useState(site.currency || 'ESPEE');
  const [boxes, setBoxes] = useState<number | null>(10);
  const [amount, setAmount] = useState(String(espeeToCurrency(sponsorEspee(10), site.currency || 'ESPEE', rates)));
  const [pending, setPending] = useState(false), [error, setError] = useState(''), [sent, setSent] = useState(false);

  function pick(n: number) { setBoxes(n); setAmount(String(espeeToCurrency(sponsorEspee(n), currency, rates))); }
  function changeCurrency(c: string) { setCurrency(c); if (boxes) setAmount(String(espeeToCurrency(sponsorEspee(boxes), c, rates))); }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    if (!(Number(amount) > 0)) { setError('Choose a box option or enter an amount.'); return; }
    setPending(true); setError('');
    try {
      await send({ data: {
        full_name: `${String(f.get('first_name') ?? '').trim()} ${String(f.get('last_name') ?? '').trim()}`.trim(),
        email: String(f.get('email') ?? ''),
        organisation: String(f.get('organisation') ?? ''),
        business_area: '1 Million Breakfast Movement',
        enquiry_type: 'Sponsor a box',
        message: `Sponsorship: ${boxes ? `${boxes} boxes` : 'Custom amount'}\nAmount: ${amount} ${currency}\nPhone: ${String(f.get('phone') ?? '')}\nCountry: ${String(f.get('country') ?? '')}\nCity: ${String(f.get('city') ?? '')}\n\n${String(f.get('message') ?? '')}`,
        website: String(f.get('website') ?? ''),
      } });
      setSent(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'Your sponsorship could not be sent. Please try again.'); }
    finally { setPending(false); }
  }

  return <Dialog open={open} onOpenChange={value => { onOpenChange(value); if (!value) setSent(false); }}>
    <DialogContent className="sponsor-dialog">
      <DialogHeader><DialogTitle>Sponsor breakfast boxes</DialogTitle><DialogDescription>Choose how many boxes to sponsor, or enter your own amount. Our team will contact you with payment details.</DialogDescription></DialogHeader>
      {sent ? <div className="sponsor-sent" role="status"><CheckCircle2 /><h3>Thank you for sponsoring.</h3><p>We have received your sponsorship details and will be in touch shortly.</p><Button onClick={() => onOpenChange(false)}>Close</Button></div> :
      <form onSubmit={submit} className="sponsor-form">
        <label>Currency<select value={currency} onChange={e => changeCurrency(e.target.value)}>{currencies.map(c => <option key={c} value={c}>{c === 'ESPEE' ? 'ESPEES' : c}</option>)}</select></label>
        <fieldset><legend>Choose number of boxes</legend><div className="sponsor-options">{SPONSOR_BOX_OPTIONS.map(n => <button type="button" key={n} aria-pressed={boxes === n} className={boxes === n ? 'active' : ''} onClick={() => pick(n)}><strong>{n} boxes</strong><small>{espeeToCurrency(sponsorEspee(n), currency, rates).toLocaleString('en-US')} {currency === 'ESPEE' ? 'ESPEES' : currency}</small></button>)}</div></fieldset>
        <label>Or type amount ({currency === 'ESPEE' ? 'ESPEES' : currency})<input type="number" min="0" step="any" required value={amount} onChange={e => { setAmount(e.target.value); setBoxes(null); }} /></label>
        <div className="sponsor-grid">
          <label>First name<input name="first_name" required minLength={1} autoComplete="given-name" /></label>
          <label>Last name<input name="last_name" required autoComplete="family-name" /></label>
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Phone<input name="phone" type="tel" required autoComplete="tel" /></label>
          <label>Country<input name="country" required autoComplete="country-name" /></label>
          <label>City<input name="city" autoComplete="address-level2" /></label>
          <label className="span">Organisation (optional)<input name="organisation" autoComplete="organization" /></label>
          <label className="span">Note (optional)<textarea name="message" rows={2} /></label>
        </div>
        <input name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
        {error && <p className="notice" role="alert">{error}</p>}
        <Button type="submit" disabled={pending}>{pending ? 'Sending…' : 'Sponsor now'} <ArrowRight /></Button>
      </form>}
    </DialogContent>
  </Dialog>;
}
