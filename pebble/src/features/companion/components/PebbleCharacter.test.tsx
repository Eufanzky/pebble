import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHookWithProviders, renderWithProviders } from '@/test/render';
import { usePreferences } from '@/shared/preferences';
import PebbleCharacter from './PebbleCharacter';
import PebbleSpeechBubble from './PebbleSpeechBubble';

beforeEach(() => {
  const { result, unmount } = renderHookWithProviders(() => usePreferences());
  act(() => result.current.setPreferences((prev) => ({ ...prev, pebbleModel: 'mochi', reduceAnimations: false })));
  unmount();
});

describe('PebbleCharacter', () => {
  it("draws the user's chosen model in the given mood and size", () => {
    const { container } = renderWithProviders(<PebbleCharacter mood="happy" size="small" />);

    expect(container.firstChild).toHaveClass('pb-model', 'pb-mochi', 'size-small', 'mood-happy');
    expect(container.firstChild).not.toHaveClass('no-motion');
  });

  it.each(['classic', 'chonky', 'mochi', 'minimal', 'chonky-plus', 'mochi-plus', 'minimal-plus'] as const)(
    'can draw the %s model, with CSS only',
    (model) => {
      const { container } = renderWithProviders(<PebbleCharacter model={model} />);

      expect(container.firstChild).toHaveClass(`pb-${model}`);
      expect(container.querySelector('svg, img')).toBeNull();
    },
  );

  it('holds still with reduce animations on', () => {
    const { result, unmount } = renderHookWithProviders(() => usePreferences());
    act(() => result.current.setPreferences((prev) => ({ ...prev, reduceAnimations: true })));
    unmount();

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
