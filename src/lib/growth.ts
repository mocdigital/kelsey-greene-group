export const DEFAULT_MILESTONES = [10000, 50000, 100000, 250000, 500000, 750000, 1000000];
export const SUBSCRIPTION_FREQUENCIES = ['monthly', 'quarterly', 'biannual'] as const;
export type SubscriptionFrequency = typeof SUBSCRIPTION_FREQUENCIES[number];
export const frequencyLabels: Record<SubscriptionFrequency, string> = { monthly: 'Every month', quarterly: 'Every 3 months', biannual: 'Every 6 months' };
const months: Record<string, number> = { monthly: 1, quarterly: 3, biannual: 6 };
export function addInterval(from: Date, frequency: string) { const d = new Date(from); d.setMonth(d.getMonth() + (months[frequency] ?? 1)); return d; }

export type MilestoneState = { value: number; status: 'reached' | 'next' | 'upcoming'; progress: number };
export function campaignState(verified: number, goal: number, milestones: unknown) {
  const list = (Array.isArray(milestones) ? milestones : DEFAULT_MILESTONES).map(Number).filter(n => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  const safe = Math.max(0, Math.floor(verified)), target = goal > 0 ? goal : 1000000;
  let nextFound = false;
  const states: MilestoneState[] = list.map(value => {
    if (safe >= value) return { value, status: 'reached', progress: 100 };
    if (!nextFound) { nextFound = true; return { value, status: 'next', progress: Math.round(safe / value * 1000) / 10 }; }
    return { value, status: 'upcoming', progress: 0 };
  });
  return { verified: safe, goal: target, remaining: Math.max(0, target - safe), percent: Math.min(100, Math.round(safe / target * 10000) / 100), milestones: states, latestReached: states.filter(m => m.status === 'reached').at(-1)?.value ?? null, complete: safe >= target };
}

/** Products that can be ordered on a recurring schedule: breakfast range goods and boxes, never property. */
export function subscriptionEligible(p: Record<string, unknown>) {
  return p['listing_type'] !== 'property' && (!p['business_slug'] || p['business_slug'] === 'foods-agro-allied');
}

export function compactNumber(n: number) { return n >= 1000000 ? `${n / 1000000}M` : n >= 1000 ? `${n / 1000}k` : String(n); }
