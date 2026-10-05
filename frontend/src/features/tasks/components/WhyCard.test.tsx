import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import WhyCard from './WhyCard';

describe('WhyCard', () => {
  it('reveals the reasoning when asked and hides it again', async () => {
    const { user } = renderWithProviders(<WhyCard explanation="One step per section." />);

    await user.click(screen.getByRole('button', { name: /Why did Pebble do this\?/ }));

    expect(screen.getByText('One step per section.')).toBeVisible();
    expect(screen.getByText('WhyBot explains:')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Hide explanation/ }));

    expect(screen.getByRole('button', { name: /Why did Pebble do this\?/ })).toBeInTheDocument();
  });
});
