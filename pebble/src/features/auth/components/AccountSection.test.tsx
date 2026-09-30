import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { signOut } from 'next-auth/react';
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

  it('has no axe violations', async () => {
    const { container } = render(<AccountSection name="Sam" userId="google:1" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
