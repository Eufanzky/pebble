import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signIn } from 'next-auth/react';
import { SignInView } from './SignInView';

vi.mock('next-auth/react', () => ({ signIn: vi.fn(), signOut: vi.fn() }));

beforeEach(() => {
  vi.mocked(signIn).mockClear();
});

describe('SignInView', () => {
  it('offers only the ways this deployment has set up', () => {
    render(<SignInView providers={['github']} callbackUrl="/today" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Pebble is here when you're ready.");
    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue with Google' })).not.toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Dev login' })).not.toBeInTheDocument();
  });

  it('signs in with a provider and comes back to the page the user asked for', async () => {
    const user = userEvent.setup();
    render(<SignInView providers={['github', 'google']} callbackUrl="/documents" />);

    await user.click(screen.getByRole('button', { name: 'Continue with Google' }));

    expect(signIn).toHaveBeenCalledWith('google', { redirectTo: '/documents' });
    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeDisabled();
  });

  it('signs in with the dev login under the name typed', async () => {
    const user = userEvent.setup();
    render(<SignInView providers={['dev']} callbackUrl="/today" />);

    const name = screen.getByRole('textbox', { name: 'Name' });
    await user.clear(name);
    await user.type(name, 'sam');
    await user.click(screen.getByRole('button', { name: 'Sign in as sam' }));

    expect(signIn).toHaveBeenCalledWith('dev', { name: 'sam', redirectTo: '/today' });
  });

  it('wakes Pebble while a way to sign in has focus', async () => {
    const user = userEvent.setup();
    const { container } = render(<SignInView providers={['github']} callbackUrl="/today" />);
    const pebble = () => container.querySelector('.pb-model')!;
    expect(pebble()).toHaveClass('mood-sleepy');

    await user.tab();

    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toHaveFocus();
    expect(pebble()).toHaveClass('mood-normal');
  });

  it('says so gently when a sign-in did not finish', () => {
    render(<SignInView providers={['github']} callbackUrl="/today" error />);

    expect(screen.getByRole('alert')).toHaveTextContent("Sign-in didn't finish. Try again, or pick another way.");
  });

  it('explains when no way to sign in is set up', () => {
    render(<SignInView providers={[]} callbackUrl="/today" />);

    expect(screen.getByText(/Sign-in isn't set up here yet/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<SignInView providers={['github', 'google', 'dev']} callbackUrl="/today" error />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
