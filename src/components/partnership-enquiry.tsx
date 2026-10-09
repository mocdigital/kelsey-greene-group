import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow, ArrowLink } from '@/components/editorial';
import { contentOptions } from '@/lib/content';
import { submitEnquiry } from '@/lib/platform.functions';

export function PartnershipEnquiry() {
  const { data } = useSuspenseQuery(contentOptions);
  const send = useServerFn(submitEnquiry);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get('consent') !== 'on') { setError('Please agree to the use of your details to respond to this enquiry.'); return; }
    setPending(true); setError('');
    try {
      await send({ data: {
        full_name: String(form.get('full_name') ?? ''), email: String(form.get('email') ?? ''),
        organisation: String(form.get('organisation') ?? ''), business_area: String(form.get('business_area') ?? ''),
        enquiry_type: String(form.get('interest') ?? ''), website: String(form.get('website') ?? ''),
        message: `Country / market: ${String(form.get('market') ?? '')}\nRole: ${String(form.get('role') ?? '')}\nPhone: ${String(form.get('phone') ?? '')}\nConsent to respond: Yes\n\n${String(form.get('message') ?? '')}`,
      } });
      setSent(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'Your enquiry could not be sent. Please try again.'); }
    finally { setPending(false); }
  }
  return <section className="section portfolio-dark" id="partnership-enquiry"><div className="container partnership-form-layout">
    <div className="partnership-form-copy"><Eyebrow>START THE CONVERSATION</Eyebrow><h2>Your interests.<br />Our next conversation.</h2><p>Tell us about your organisation, the business area you are interested in and the opportunity you would like to explore.</p><div className="partnership-form-help"><h3>A useful starting point</h3><p>Share your market, relevant capabilities and what a potential relationship could look like. You do not need to have every detail settled to begin a conversation.</p><ArrowLink to="/shop">Looking for a product instead? Visit Shop</ArrowLink></div></div>
    {sent ? <div className="form-confirmation" role="status"><CheckCircle2 size={36} /><h3>Partnership enquiry received.</h3><p>Your message has been saved for the Kelsey Greene Group team.</p><Button variant="cream" onClick={() => setSent(false)}>Send another enquiry<ArrowRight /></Button></div> : <form onSubmit={submit} className="enquiry-form partnership-enquiry"><p className="partnership-required">Fields marked * are required.</p><div className="form-grid">
      <label>Full name *<input name="full_name" autoComplete="name" required minLength={2} maxLength={150} placeholder="Your name" /></label>
      <label>Email address *<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@example.com" /></label>
      <label>Organisation *<input name="organisation" autoComplete="organization" required maxLength={200} placeholder="Business or organisation name" /></label>
      <label>Your role<input name="role" autoComplete="organization-title" maxLength={150} placeholder="Your role or title" /></label>
      <label>Country / market *<input name="market" required maxLength={150} placeholder="Your country or market" /></label>
      <label>Phone (optional)<input name="phone" type="tel" autoComplete="tel" maxLength={50} placeholder="Include country code" /></label>
      <label className="span-two">Partnership interest *<select name="interest" required defaultValue=""><option value="" disabled>Select a partnership interest</option>{['Retail & distribution', 'Commercial & supply', 'Strategic & market opportunities', 'Sponsorship & community'].map(v => <option key={v}>{v}</option>)}</select></label>
      <label className="span-two">Business area *<select name="business_area" required defaultValue=""><option value="" disabled>Select a business or Group-wide opportunity</option><option>The Group</option>{data.filter(r => r.kind === 'business').map(r => <option key={r.id}>{r.title}</option>)}<option>1 Million Breakfast Movement</option></select></label>
      <label className="span-two">Your message *<textarea name="message" required minLength={10} maxLength={4200} rows={5} placeholder="Describe the opportunity, your organisation and how you see us working together." /></label>
      <label className="honeypot">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    </div><label className="partnership-consent"><input name="consent" type="checkbox" required /><span>I agree that my details may be used to respond to this enquiry. Read our <Link to="/privacy">Privacy policy.</Link></span></label>{error && <p role="alert" className="form-error">{error}</p>}<Button type="submit" variant="cream" className="editorial-button" disabled={pending}>{pending ? 'Sending…' : 'Send partnership enquiry'}<ArrowRight /></Button></form>}
  </div></section>;
}