import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import WhyCard from './WhyCard';

describe('WhyCard', () => {
  it('reveals the reasoning when asked and hides it again', async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(<WhyCard explanation="One step per section." onOpen={onOpen} />);

    await user.click(screen.getByRole('button', { name: /Why did Pebble do this\?/ }));

    expect(screen.getByText('One step per section.')).toBeVisible();
    expect(screen.getByText('Pebble explains:')).toBeInTheDocument();
    expect(onOpen).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: /Hide explanation/ }));

    expect(screen.getByRole('button', { name: /Why did Pebble do this\?/ })).toBeInTheDocument();
    expect(onOpen).toHaveBeenCalledOnce(); // only opening is logged
  });

  it('works without an onOpen handler', async () => {
    const { user } = renderWithProviders(<WhyCard explanation="Short task." />);

    await user.click(screen.getByRole('button', { name: /Why did Pebble do this\?/ }));

    expect(screen.getByRole('button', { name: /Hide explanation/ })).toBeInTheDocument();
  });
});
