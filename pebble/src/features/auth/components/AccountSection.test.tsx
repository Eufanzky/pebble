import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { signOut } from 'next-auth/react';
import { accountHandlers, accountStore } from '@/test/msw/account';
import { server } from '@/test/msw/server';
import { AccountSection } from './AccountSection';

vi.mock('next-auth/react', () => ({ signIn: vi.fn(), signOut: vi.fn() }));

describe('AccountSection', () => {
  it('says who is signed in, and how', () => {
    render(<AccountSection name="Sam" userId="github:42" />);

    expect(screen.getByText('Signed in as Sam with GitHub.')).toBeInTheDocument();
  });

  it('signs out to the sign-in page', async () => {
    const user = userEvent.setup();
    render(<AccountSection name="dev" userId="dev:dev" />);

    expect(screen.getByText('Signed in as dev with the dev login.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(signOut).toHaveBeenCalledWith({ redirectTo: '/signin' });
  });

  it('offers to download or delete the data, and deletes only after asking', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<AccountSection name="Sam" userId="github:42" />);

    expect(screen.getByRole('heading', { name: 'Your data' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download my data' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Delete my account' }));

    expect(window.confirm).toHaveBeenCalledOnce();
    expect(accountStore.deleted()).toBe(false);
  });

  it('shows a gentle note when the download fails', async () => {
    const user = userEvent.setup();
    server.use(...accountHandlers.status(503));
    render(<AccountSection name="Sam" userId="github:42" />);

    await user.click(screen.getByRole('button', { name: 'Download my data' }));

    expect(await screen.findByRole('status')).toHaveTextContent("Pebble couldn't get your data just now.");
  });

  it('has no axe violations', async () => {
    const { container } = render(<AccountSection name="Sam" userId="google:1" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
