import { Link, useLocation } from '@tanstack/react-router';
import { ShoppingBag } from 'lucide-react';
import { currencies } from '@/lib/pricing';
import { useSite } from './site-provider';
import { Button } from './ui/button';

export function CurrencySelector() {
  const { currency, setCurrency } = useSite();
  return <label className="market-currency">Currency<select aria-label="Display currency" value={currency} onChange={event => setCurrency(event.target.value)}>{currencies.map(value => <option key={value} value={value}>{({ ESPEE: 'ESPEE', NGN: 'Naira (NGN)', USD: 'US dollar (USD)', GHS: 'Ghana cedis (GHS)' })[value]}</option>)}</select></label>;
}

export function ShoppingCurrencyBar() {
  const path = useLocation({ select: location => location.pathname });
  const { cart } = useSite();
  if (!(path.startsWith('/shop/') || ['/cart', '/checkout', '/discovery-box'].includes(path) || path.startsWith('/orders/'))) return null;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <div className="shopping-currency-bar"><div className="container"><Link to="/shop" className="shopping-flow-label">Marketplace</Link><CurrencySelector/><Button variant="outline" asChild><Link to="/cart" aria-label={`Shopping bag, ${count} items`}><ShoppingBag/><span>Bag{count > 0 ? ` · ${count}` : ''}</span></Link></Button></div></div>;
}