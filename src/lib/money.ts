export const ngn=(n:number|string|null|undefined)=>`₦${Number(n??0).toLocaleString('en-NG',{maximumFractionDigits:0})}`;
export const label=(s:string)=>s.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
export const paymentLabels:Record<string,string>={bank_transfer:'Direct bank transfer',espees:'Pay via ESPEES',pay_on_delivery:'Pay on delivery',card:'Card payment (coming soon)'};
export const fulfilmentSteps=['received','processing','dispatched','delivered'] as const;
