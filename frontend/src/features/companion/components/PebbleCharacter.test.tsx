import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { setTestPreferences } from '@/test/preferences';
import PebbleCharacter from './PebbleCharacter';
import PebbleSpeechBubble from './PebbleSpeechBubble';

beforeEach(() => {
  setTestPreferences({ pebbleModel: 'mochi', reduceAnimations: false });
});

describe('PebbleCharacter', () => {
  it("draws the user's chosen model in the given mood and size", () => {
    const { container } = renderWithProviders(<PebbleCharacter mood="happy" size="small" />);

    expect(container.firstChild).toHaveClass('pebble-model', 'pebble-mochi', 'size-small', 'mood-happy');
    expect(container.firstChild).not.toHaveClass('no-motion');
  });

  it.each(['classic', 'chonky', 'mochi', 'minimal', 'chonky-plus', 'mochi-plus', 'minimal-plus'] as const)(
    'can draw the %s model, with CSS only',
    (model) => {
      const { container } = renderWithProviders(<PebbleCharacter model={model} />);

      expect(container.firstChild).toHaveClass(`pebble-${model}`);
      expect(container.querySelector('svg, img')).toBeNull();
    },
  );

  it('holds still with reduce animations on', () => {
    setTestPreferences({ reduceAnimations: true });

    const { container } = renderWithProviders(<PebbleCharacter />);

    expect(container.firstChild).toHaveClass('no-motion');
  });
});

describe('PebbleSpeechBubble', () => {
  it('shows the message', () => {
    const { getByText } = renderWithProviders(<PebbleSpeechBubble message="Ready when you are." />);

    expect(getByText('Ready when you are.')).toBeInTheDocument();
  });
});
