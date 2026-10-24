type Fields = Record<string, unknown>;
export type MerchantOption = {code:string;label:string;businesses:string[]};
export function paymentConfig(commerce: Fields) {
  const merchants = (Array.isArray(commerce['espee_merchants']) ? commerce['espee_merchants'] : []).map(value => {
    const m = value && typeof value === 'object' ? value as Fields : {};
    return {code:String(m['code'] ?? '').trim(),label:String(m['label'] ?? ''),businesses:Array.isArray(m['businesses']) ? m['businesses'].map(String) : []};
  }).filter(m => m.code);
  return {bank:{bank_name:String(commerce['bank_name'] ?? ''),account_name:String(commerce['account_name'] ?? ''),account_number:String(commerce['account_number'] ?? '')},merchants,card_live:commerce['card_mode'] === 'live'};
}
export function relevantMerchants(merchants: MerchantOption[], businesses: string[]) {
  const seen = new Set<string>();
  return merchants.filter(m => {
    if (!m.code || seen.has(m.code) || !m.businesses.some(b => businesses.includes(b))) return false;
    seen.add(m.code);
    return true;
  });
}