import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('@tanstack/react-start', () => ({ useServerFn: () => send }));
vi.mock('@tanstack/react-query', () => ({ useSuspenseQuery: () => ({ data: [{ id: 'foods', kind: 'business', title: 'Foods & Agro-Allied' }] }) }));
vi.mock('@/lib/content', () => ({ contentOptions: {} }));
vi.mock('@/lib/platform.functions', () => ({ submitEnquiry: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({ Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a> }));
vi.mock('@/components/editorial', () => ({ Eyebrow: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, ArrowLink: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
import { PartnershipEnquiry } from '@/components/partnership-enquiry';
afterEach(() => { cleanup(); vi.clearAllMocks(); });
function fill() {
  for (const [label, value] of [['Full name *', 'Test Partner'], ['Email address *', 'partner@example.invalid'], ['Organisation *', 'Test Organisation'], ['Your role', 'Director'], ['Country / market *', 'Nigeria'], ['Phone (optional)', '+234000000000'], ['Partnership interest *', 'Commercial & supply'], ['Business area *', 'Foods & Agro-Allied'], ['Your message *', 'Interested in a supply relationship.']] as const) fireEvent.change(screen.getByLabelText(label), { target: { value } });
}
describe('Partnership enquiry', () => {
  it('preserves all partnership details and shows confirmation', async () => {
    send.mockResolvedValueOnce({ id: 'test' });
    const { container } = render(<PartnershipEnquiry />); fill(); fireEvent.click(screen.getByRole('checkbox'));
    const form = container.querySelector('form'); if (!form) throw new Error('Missing form'); fireEvent.submit(form);
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(send).toHaveBeenCalledWith({ data: expect.objectContaining({ organisation: 'Test Organisation', business_area: 'Foods & Agro-Allied', enquiry_type: 'Commercial & supply', message: expect.stringContaining('Country / market: Nigeria\nRole: Director\nPhone: +234000000000\nConsent to respond: Yes') }) });
  });
  it('requires consent before sending', () => {
    const { container } = render(<PartnershipEnquiry />); fill(); const form = container.querySelector('form'); if (!form) throw new Error('Missing form'); fireEvent.submit(form);
    expect(send).not.toHaveBeenCalled(); expect(screen.getByRole('alert')).toBeTruthy();
  });
  it('retains entered values when sending fails', async () => {
    send.mockRejectedValueOnce(new Error('Please try again.'));
    const { container } = render(<PartnershipEnquiry />); fill(); fireEvent.click(screen.getByRole('checkbox')); const form = container.querySelector('form'); if (!form) throw new Error('Missing form'); fireEvent.submit(form);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Please try again.'));
    expect((screen.getByLabelText('Organisation *') as HTMLInputElement).value).toBe('Test Organisation');
  });
});