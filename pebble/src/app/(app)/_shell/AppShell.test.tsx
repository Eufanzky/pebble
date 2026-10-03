import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { act, render, screen, userEvent } from '@/test/render';
import { setTestPreferences } from '@/test/preferences';
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

describe('AppShell navigation', () => {
  it('collapses the sidebar to icons and back, keeping every link named', async () => {
    const user = userEvent.setup();
    const { container } = render(<AppShell><Page title="Today" /></AppShell>);
    const sidebar = container.querySelector('.sidebar')!;
    const toggle = screen.getByRole('button', { name: 'Collapse navigation' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);

    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    expect(screen.getByRole('button', { name: 'Expand navigation' })).toHaveAttribute('aria-expanded', 'false');
    for (const name of ['Today', 'Documents', 'Stats', 'Activity', 'Focus', 'Settings']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }

    await user.click(screen.getByRole('button', { name: 'Expand navigation' }));
    expect(sidebar).not.toHaveAttribute('data-collapsed');
  });

  it('remembers the collapsed sidebar on this device', async () => {
    const user = userEvent.setup();
    const first = render(<AppShell><Page title="Today" /></AppShell>);
    await user.click(screen.getByRole('button', { name: 'Collapse navigation' }));
    first.unmount();

    const { container } = render(<AppShell><Page title="Today" /></AppShell>);

    expect(container.querySelector('.sidebar')).toHaveAttribute('data-collapsed', 'true');
    await user.click(screen.getByRole('button', { name: 'Expand navigation' }));
  });

  it('fades between pages, but swaps at once with reduced motion', () => {
    setTestPreferences({ reduceAnimations: false });
    const motion = render(<AppShell><Page title="Today" /></AppShell>);
    pathname = '/documents';
    motion.rerender(<AppShell><Page title="documents" /></AppShell>);
    expect(motion.container.querySelector('.page-transition')).toHaveAttribute('data-leaving', 'true');
    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    motion.unmount();

    setTestPreferences({ reduceAnimations: true });
    pathname = '/today';
    const still = render(<AppShell><Page title="Today" /></AppShell>);
    pathname = '/documents';
    still.rerender(<AppShell><Page title="documents" /></AppShell>);

    expect(still.container.querySelector('.page-transition')).not.toHaveAttribute('data-leaving');
    expect(screen.getByRole('heading', { name: 'documents' })).toBeInTheDocument();
  });
});
