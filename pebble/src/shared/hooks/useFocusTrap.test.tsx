import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '@/test/render';
import { useFocusTrap } from './useFocusTrap';

function Modal({ onEscape, active = true }: { onEscape: () => void; active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active, onEscape);
  return (
    <div ref={ref} role="dialog">
      <button>First</button>
      <button>Last</button>
    </div>
  );
}

function Page({ onEscape = () => {}, active = true }: { onEscape?: () => void; active?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <Modal active={active} onEscape={() => { onEscape(); setOpen(false); }} />}
    </>
  );
}

describe('useFocusTrap', () => {
  it('focuses the first control, wraps Tab both ways, and closes on Escape', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(<Page onEscape={onEscape} />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'First' })).toHaveFocus());

    await user.tab();
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(onEscape).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });

  it('ignores keys while inactive', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(<Page onEscape={onEscape} active={false} />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.keyboard('{Escape}');

    expect(onEscape).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });
});
