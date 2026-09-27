import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test/render';
import ChatLauncher from './ChatLauncher';

describe('ChatLauncher', () => {
  // A-017: the mouth used `translateX(-50)`, invalid CSS, so it wasn't centred.
  it('centres the mouth with a valid transform', () => {
    const { container } = render(<ChatLauncher isOpen={false} noMotion onToggle={vi.fn()} />);

    const mouth = container.querySelector<HTMLElement>('[data-part="mouth"]');

    expect(mouth?.style.transform).toBe('translateX(-50%)');
  });

  it('hides the mouth and offers to close when the chat is open', () => {
    const { container } = render(<ChatLauncher isOpen noMotion onToggle={vi.fn()} />);

    expect(container.querySelector('[data-part="mouth"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'Close chat with Pebble' })).toBeInTheDocument();
  });
});
