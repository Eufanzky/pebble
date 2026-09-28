import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { act, render, screen, userEvent } from '@/test/render';
import AppShell from './AppShell';

let pathname = '/today';
vi.mock('next/navigation', () => ({ usePathname: () => pathname, useRouter: () => ({ push: vi.fn() }) }));

afterEach(() => {
  pathname = '/today';
  vi.useRealTimers();
});

function Page({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

describe('AppShell keyboard paths', () => {
  it('offers a skip link as the first stop, and it leads to the main content', async () => {
    const user = userEvent.setup();
    render(<AppShell><Page title="Today" /></AppShell>);

    await user.tab();

    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute('href', '#main-content');
    expect(document.getElementById('main-content')).toHaveAttribute('tabindex', '-1');
  });

  it('marks the current page in the navigation', () => {
    render(<AppShell><Page title="Today" /></AppShell>);

    expect(screen.getByRole('link', { current: 'page' })).toHaveAttribute('href', '/today');
  });

  it('moves focus to the new page heading after navigating, but not on first load', () => {
    vi.useFakeTimers();
    const { rerender } = render(<AppShell><Page title="Today" /></AppShell>);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('heading', { name: 'Today' })).not.toHaveFocus();

    pathname = '/documents';
    rerender(<AppShell><Page title="documents" /></AppShell>);
    act(() => vi.advanceTimersByTime(1000));

    expect(screen.getByRole('heading', { name: 'documents' })).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { container } = render(<AppShell><Page title="Today" /></AppShell>);

    expect(await axe(container)).toHaveNoViolations();
  });
});
