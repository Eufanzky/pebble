import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { setTestPreferences } from '@/test/preferences';
import { AmbientBackground } from './AmbientBackground';

function renderAmbient(mood: Parameters<typeof AmbientBackground>[0]['mood'] = 'today') {
  const { container } = renderWithProviders(<AmbientBackground mood={mood} />);
  return container.querySelector('.ambient') as HTMLElement;
}

describe('AmbientBackground', () => {
  it('is decorative: hidden from screen readers, with no images', () => {
    setTestPreferences({ reduceAnimations: false, calmMode: false });

    const ambient = renderAmbient('documents');

    expect(ambient).toHaveAttribute('aria-hidden', 'true');
    expect(ambient).toHaveAttribute('data-mood', 'documents');
    expect(ambient.querySelectorAll('img')).toHaveLength(0);
    expect(ambient.querySelectorAll('.ambient__field')).toHaveLength(3);
  });

  it('drifts by default', () => {
    setTestPreferences({ reduceAnimations: false, calmMode: false });

    expect(renderAmbient()).not.toHaveAttribute('data-still');
  });

  it.each([
    ['reduce animations', { reduceAnimations: true, calmMode: false }],
    ['calm mode', { reduceAnimations: false, calmMode: true }],
  ])('holds still with %s', (_, preferences) => {
    setTestPreferences(preferences);

    expect(renderAmbient()).toHaveAttribute('data-still', 'true');
  });
});
