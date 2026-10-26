import { Link, useLocation } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import { currencyOptions } from '@/lib/pricing';
import { contentOptions, payload } from '@/lib/content';
import { useSite } from './site-provider';
import { Button } from './ui/button';

export function useCurrencyOptions() {
  const { data } = useSuspenseQuery(contentOptions);
  return currencyOptions(payload(data.find(r => r.kind === 'setting' && r.slug === 'currency')));
}

export function CurrencySelector() {
  const { currency, setCurrency } = useSite();
  const options = useCurrencyOptions();
  return <label className="market-currency">Currency<select aria-label="Display currency" value={options.some(o => o.code === currency) ? currency : 'ESPEE'} onChange={event => setCurrency(event.target.value)}>{options.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}</select></label>;
}

export function ShoppingCurrencyBar() {
  const path = useLocation({ select: location => location.pathname });
  const { cart } = useSite();
  if (!(path.startsWith('/shop/') || ['/cart', '/checkout', '/discovery-box'].includes(path) || path.startsWith('/orders/'))) return null;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <div className="shopping-currency-bar"><div className="container"><Link to="/shop" className="shopping-flow-label">Marketplace</Link><CurrencySelector/><Button variant="outline" asChild><Link to="/cart" aria-label={`Shopping bag, ${count} items`}><ShoppingBag/><span>Bag{count > 0 ? ` · ${count}` : ''}</span></Link></Button></div></div>;
}
