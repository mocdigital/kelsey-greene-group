import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('@tanstack/react-start', () => ({ useServerFn: () => send }));
vi.mock('@/lib/platform.functions', () => ({ submitEnquiry: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({ Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a> }));
vi.mock('@/components/editorial', () => ({ Eyebrow: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
import { MovementEnquiry } from '@/components/movement-enquiry';

afterEach(() => { cleanup(); vi.clearAllMocks(); });

function fillForm() {
  fireEvent.change(screen.getByLabelText('Full name *'), { target: { value: 'Test Participant' } });
  fireEvent.change(screen.getByLabelText('Email address *'), { target: { value: 'test@example.invalid' } });
  fireEvent.change(screen.getByLabelText('Country / region *'), { target: { value: 'Nigeria' } });
  fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Lagos' } });
  fireEvent.change(screen.getByLabelText('I would like to participate as *'), { target: { value: 'Retailer' } });
  fireEvent.change(screen.getByLabelText('Your message *'), { target: { value: 'Interested in the breakfast range.' } });
  fireEvent.click(screen.getByRole('checkbox'));
}

describe('Movement participation enquiry', () => {
  it('preserves region and participation details and shows confirmation', async () => {
    send.mockResolvedValueOnce({ id: 'test' });
    const { container } = render(<MovementEnquiry />);
    fillForm();
    const form = container.querySelector('form');
    if (!form) throw new Error('Missing enquiry form');
    fireEvent.submit(form);
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(send).toHaveBeenCalledWith({ data: expect.objectContaining({ business_area: '1 Million Breakfast Movement', enquiry_type: 'Participation: Retailer', message: expect.stringContaining('Country / region: Nigeria\nCity: Lagos\nConsent to respond: Yes') }) });
  });

  it('shows submission errors without losing the form', async () => {
    send.mockRejectedValueOnce(new Error('Please try again.'));
    const { container } = render(<MovementEnquiry />);
    fillForm();
    const form = container.querySelector('form');
    if (!form) throw new Error('Missing enquiry form');
    fireEvent.submit(form);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Please try again.'));
    expect(screen.getByLabelText('Full name *')).toBeTruthy();
  });
});