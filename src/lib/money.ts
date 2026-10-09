export const ngn=(n:number|string|null|undefined)=>`₦${Number(n??0).toLocaleString('en-NG',{maximumFractionDigits:0})}`;
export const label=(s:string)=>s.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
export const paymentLabels:Record<string,string>={bank_transfer:'Direct bank transfer',pay_on_delivery:'Pay on delivery',card:'Card (staging — not charged)'};
export const fulfilmentSteps=['received','processing','dispatched','delivered'] as const;
