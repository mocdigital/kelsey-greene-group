import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/editorial';
import { submitEnquiry } from '@/lib/platform.functions';

export function MovementEnquiry() {
  const send = useServerFn(submitEnquiry);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = String(form.get('message') ?? '');
    setPending(true);
    setError('');
    try {
      await send({ data: {
        full_name: String(form.get('full_name') ?? ''),
        email: String(form.get('email') ?? ''),
        organisation: String(form.get('organisation') ?? ''),
        business_area: '1 Million Breakfast Movement',
        enquiry_type: `Participation: ${String(form.get('participation') ?? '')}`,
        message: `Country / region: ${String(form.get('country') ?? '')}\nCity: ${String(form.get('city') ?? '')}\nConsent to respond: Yes\n\n${message}`,
        website: String(form.get('website') ?? ''),
      } });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your enquiry could not be sent. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return <section id="join-movement" className="movement-join section movement-dark">
    <div className="container movement-two-column">
      <div className="movement-join-copy">
        <Eyebrow>JOIN THE MOVEMENT</Eyebrow>
        <h2>Your place at<br />the table starts<br />with a hello.</h2>
        <p>Tell us how you would like to participate—whether as a consumer, a family, an ambassador or a business partner.</p>
        <div className="movement-conversation"><h3>One movement. The right conversation.</h3><p>For product enquiries, include the product name. For retail, distribution or partnerships, tell us about your organisation and market.</p></div>
      </div>
      {sent ? <div className="form-confirmation" role="status"><CheckCircle2 size={36} /><h3>Participation enquiry received.</h3><p>Your message has been saved for the Kelsey Greene Group team.</p><Button variant="cream" onClick={() => setSent(false)}>Send another enquiry <ArrowRight /></Button></div>
        : <form className="enquiry-form movement-enquiry" onSubmit={submit}>
          <p className="movement-required">Fields marked * are required.</p>
          <div className="form-grid">
            <label>Full name *<input name="full_name" autoComplete="name" required minLength={2} maxLength={150} placeholder="Your name" /></label>
            <label>Email address *<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@example.com" /></label>
            <label>Country / region *<select name="country" autoComplete="country-name" required defaultValue=""><option value="" disabled>Select your country / region</option>{['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Other African country', 'United Kingdom', 'United States', 'Canada', 'Europe', 'Other country / region'].map(country => <option key={country}>{country}</option>)}</select></label>
            <label>City<input name="city" autoComplete="address-level2" maxLength={150} placeholder="Your city" /></label>
            <label className="span-two">I would like to participate as *<select name="participation" required defaultValue=""><option value="" disabled>Consumer / family, ambassador, retailer, distributor or partner</option>{['Consumer / family', 'Ambassador', 'Retailer', 'Distributor', 'Partner'].map(role => <option key={role}>{role}</option>)}</select></label>
            <label className="span-two">Organisation (if applicable)<input name="organisation" autoComplete="organization" maxLength={200} placeholder="Your business or community organisation" /></label>
            <label className="span-two">Your message *<textarea name="message" required minLength={10} maxLength={4500} rows={5} placeholder="Tell us about your product interest or how you would like to take part…" /></label>
            <label className="honeypot">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          </div>
          <label className="movement-consent"><input type="checkbox" name="consent" required /><span>I agree that my details may be used to respond to this enquiry. Read our <Link to="/privacy">Privacy policy.</Link></span></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button variant="cream" type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send participation enquiry'}<ArrowRight /></Button>
        </form>}
    </div>
  </section>;
}