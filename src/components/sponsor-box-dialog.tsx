import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { submitSponsorship, uploadSponsorshipProof } from '@/lib/sponsorship.functions';
import { contentOptions, payload } from '@/lib/content';
import { currencyOptions, rateFor } from '@/lib/pricing';
import { SPONSOR_BOX_OPTIONS, sponsorEspee, SPONSOR_PAYMENT, espeeToCurrency } from '@/lib/sponsorship';
import { useSite } from './site-provider';

export { SPONSOR_BOX_OPTIONS, ESPEE_PER_BOX, sponsorEspee, SPONSOR_PAYMENT, espeeToCurrency } from '@/lib/sponsorship';

export function SponsorBoxButton({ children = 'Sponsor a box', variant = 'outline', className = 'movement-button' }: { children?: React.ReactNode; variant?: 'outline' | 'default'; className?: string }) {
  const [open, setOpen] = useState(false);
  return <><Button type="button" variant={variant} className={className} onClick={() => setOpen(true)}>{children} <ArrowRight /></Button><SponsorBoxDialog open={open} onOpenChange={setOpen} /></>;
}

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return <span className="sponsor-copy"><strong>{value}</strong><Button type="button" size="icon" variant="ghost" aria-label={`Copy ${label}`} onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard unavailable */ } }}>{copied ? <Check /> : <Copy />}</Button></span>;
}

function SponsorBoxDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data } = useSuspenseQuery(contentOptions);
  const rates = payload(data.find(r => r.kind === 'setting' && r.slug === 'currency'));
  const options = currencyOptions(rates);
  const site = useSite();
  const send = useServerFn(submitSponsorship), upload = useServerFn(uploadSponsorshipProof);
  const initial = options.some(o => o.code === site.currency) ? site.currency : 'ESPEE';
  const [currency, setCurrency] = useState(initial);
  const [boxes, setBoxes] = useState<number | null>(10);
  const [amount, setAmount] = useState(String(espeeToCurrency(sponsorEspee(10), initial, rates)));
  const [method, setMethod] = useState<'espees' | 'bank_transfer'>(initial === 'ESPEE' ? 'espees' : 'bank_transfer');
  const [record, setRecord] = useState<{ id: string; token: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false), [error, setError] = useState(''), [step, setStep] = useState<'details' | 'pay' | 'done'>('details');
  const unit = (c: string) => c === 'ESPEE' ? 'ESPEES' : c;
  const espeeTotal = currency === 'ESPEE' ? Number(amount) : Number(amount) / (rateFor(currency, rates) || NaN);
  const ngnRate = rateFor('NGN', rates);
  const due = method === 'espees' ? `${(Number.isFinite(espeeTotal) ? espeeTotal : 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} ESPEES` : currency === 'NGN' ? `₦${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : ngnRate > 0 && Number.isFinite(espeeTotal) ? `₦${(espeeTotal * ngnRate).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : `${amount} ${unit(currency)}`;

  function pick(n: number) { setBoxes(n); setAmount(String(espeeToCurrency(sponsorEspee(n), currency, rates))); }
  function changeCurrency(c: string) { setCurrency(c); setMethod(c === 'ESPEE' ? 'espees' : 'bank_transfer'); if (boxes) setAmount(String(espeeToCurrency(sponsorEspee(boxes), c, rates))); }
  function reset() { setStep('details'); setRecord(null); setFile(null); setError(''); }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget), v = (k: string) => String(f.get(k) ?? '').trim();
    if (!(Number(amount) > 0)) { setError('Choose a box option or enter an amount.'); return; }
    setPending(true); setError('');
    try {
      const r = await send({ data: { first_name: v('first_name'), last_name: v('last_name'), email: v('email'), phone: v('phone'), country: v('country'), city: v('city'), organisation: v('organisation'), note: v('message'), boxes, amount: Number(amount), currency, payment_method: method, website: v('website') } });
      setRecord(r); setStep('pay');
    } catch (err) { setError(err instanceof Error ? err.message : 'Your sponsorship could not be sent. Please try again.'); }
    finally { setPending(false); }
  }

  async function sendProof() {
    if (!record) return;
    if (!file) { setError('Please upload your proof of payment.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Please upload a file under 5 MB.'); return; }
    setPending(true); setError('');
    try {
      const buf = new Uint8Array(await file.arrayBuffer()); let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      await upload({ data: { id: record.id, token: record.token, payment_method: method, type: file.type as 'image/png', base64: btoa(bin) } });
      setStep('done');
    } catch (err) { setError(err instanceof Error ? err.message : 'Your receipt could not be uploaded.'); }
    finally { setPending(false); }
  }

  return <Dialog open={open} onOpenChange={value => { onOpenChange(value); if (!value) reset(); }}>
    <DialogContent className="sponsor-dialog">
      <DialogHeader><DialogTitle>{step === 'pay' ? 'Complete your sponsorship' : 'Sponsor breakfast boxes'}</DialogTitle><DialogDescription>{step === 'pay' ? `Send ${due} using the details below, then upload your proof of payment.` : 'Choose how many boxes to sponsor, or enter your own amount.'}</DialogDescription></DialogHeader>
      {step === 'done' ? <div className="sponsor-sent" role="status"><CheckCircle2 /><h3>Thank you for sponsoring.</h3><p>We have received your proof of payment and will confirm your sponsorship shortly.</p><Button onClick={() => onOpenChange(false)}>Close</Button></div> :
      step === 'pay' ? <div className="sponsor-form">
        <fieldset><legend>Payment method</legend><div className="sponsor-options sponsor-methods">
          <button type="button" aria-pressed={method === 'espees'} className={method === 'espees' ? 'active' : ''} onClick={() => setMethod('espees')}><strong>Pay with ESPEES</strong></button>
          <button type="button" aria-pressed={method === 'bank_transfer'} className={method === 'bank_transfer' ? 'active' : ''} onClick={() => setMethod('bank_transfer')}><strong>Pay in Naira</strong><small>Bank transfer</small></button>
        </div></fieldset>
        <dl className="sponsor-pay-details">
          <div><dt>Amount</dt><dd><strong>{due}</strong></dd></div>
          {method === 'espees' ? <div><dt>Merchant code</dt><dd><CopyValue value={SPONSOR_PAYMENT.merchant_code} label="merchant code" /></dd></div> : <>
            <div><dt>Account name</dt><dd><strong>{SPONSOR_PAYMENT.account_name}</strong></dd></div>
            <div><dt>Account number</dt><dd><CopyValue value={SPONSOR_PAYMENT.account_number} label="account number" /></dd></div>
            <div><dt>Bank</dt><dd><strong>{SPONSOR_PAYMENT.bank_name}</strong></dd></div></>}
          <div><dt>Narration</dt><dd><CopyValue value={SPONSOR_PAYMENT.narration} label="narration" /></dd></div>
        </dl>
        <label>Upload proof of payment (required)<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} /></label>
        {error && <p className="notice" role="alert">{error}</p>}
        <Button type="button" onClick={sendProof} disabled={pending}>{pending ? 'Uploading…' : 'Submit proof of payment'} <ArrowRight /></Button>
      </div> :
      <form onSubmit={submit} className="sponsor-form">
        <label>Currency<select value={currency} onChange={e => changeCurrency(e.target.value)}>{options.map(o => <option key={o.code} value={o.code}>{unit(o.code)}</option>)}</select></label>
        <fieldset><legend>Choose number of boxes</legend><div className="sponsor-options">{SPONSOR_BOX_OPTIONS.map(n => <button type="button" key={n} aria-pressed={boxes === n} className={boxes === n ? 'active' : ''} onClick={() => pick(n)}><strong>{n} boxes</strong><small>{espeeToCurrency(sponsorEspee(n), currency, rates).toLocaleString('en-US')} {unit(currency)}</small></button>)}</div></fieldset>
        <label>Or type amount ({unit(currency)})<input type="number" min="0" step="any" required value={amount} onChange={e => { setAmount(e.target.value); setBoxes(null); }} /></label>
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
