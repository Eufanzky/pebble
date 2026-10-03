import { act, renderHook } from '@testing-library/react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useReorder } from './useReorder';

const IDS = ['a', 'b', 'c'];
const titleOf = (id: string) => `Task ${id.toUpperCase()}`;

function key(name: string) {
  return { key: name, preventDefault: vi.fn() } as unknown as KeyboardEvent<HTMLElement>;
}

function renderReorder(ids = IDS) {
  const onReorder = vi.fn();
  const view = renderHook(({ list }) => useReorder(list, titleOf, onReorder), { initialProps: { list: ids } });
  return { ...view, onReorder };
}

describe('useReorder by keyboard', () => {
  it('moves a task up or down with the arrow keys, and says where it went', () => {
    const { result, onReorder } = renderReorder();

    act(() => result.current.handleProps('c').onKeyDown(key('ArrowUp')));

    expect(onReorder).toHaveBeenCalledWith(['a', 'c', 'b']);
    expect(result.current.announcement).toBe('Moved "Task C" to position 2 of 3.');

    act(() => result.current.handleProps('a').onKeyDown(key('ArrowDown')));
    expect(onReorder).toHaveBeenLastCalledWith(['b', 'a', 'c']);
  });

  it('moves to the top or bottom with Home and End', () => {
    const { result, onReorder } = renderReorder();

    act(() => result.current.handleProps('c').onKeyDown(key('Home')));
    expect(onReorder).toHaveBeenCalledWith(['c', 'a', 'b']);

    act(() => result.current.handleProps('a').onKeyDown(key('End')));
    expect(onReorder).toHaveBeenLastCalledWith(['b', 'c', 'a']);
  });

  it('does nothing at the ends, and ignores other keys', () => {
    const { result, onReorder } = renderReorder();
    const other = key('Enter');

    act(() => result.current.handleProps('a').onKeyDown(key('ArrowUp')));
    act(() => result.current.handleProps('c').onKeyDown(key('ArrowDown')));
    act(() => result.current.handleProps('b').onKeyDown(other));

    expect(onReorder).not.toHaveBeenCalled();
    expect(other.preventDefault).not.toHaveBeenCalled();
    expect(result.current.announcement).toBe('');
  });
});

describe('useReorder by dragging', () => {
  /** A list element with three cards, 50px tall each, stacked from y=0. */
  function list() {
    const container = document.createElement('div');
    container.setAttribute('data-reorder-list', '');
    IDS.forEach((id, i) => {
      const card = document.createElement('article');
      card.dataset.taskId = id;
      card.getBoundingClientRect = () => ({ top: i * 50, height: 50 }) as DOMRect;
      card.appendChild(document.createElement('button'));
      container.appendChild(card);
    });
    return container;
  }

  function down(target: Element, button = 0) {
    return { button, currentTarget: target, preventDefault: vi.fn() } as unknown as PointerEvent<HTMLElement>;
  }

  /** The pointer moves (or is let go) anywhere on the page: the drag follows it on the window. */
  function on(type: 'pointermove' | 'pointerup' | 'pointercancel', clientY = 0) {
    act(() => {
      window.dispatchEvent(new MouseEvent(type, { clientY }));
    });
  }

  it('previews the order while dragging and saves it on letting go', () => {
    const { result, onReorder } = renderReorder();
    const handle = list().querySelector('[data-task-id="a"] button')!;

    act(() => result.current.handleProps('a').onPointerDown(down(handle)));
    expect(result.current.draggingId).toBe('a');

    on('pointermove', 140);
    expect(result.current.order).toEqual(['b', 'c', 'a']);
    expect(onReorder).not.toHaveBeenCalled();

    on('pointerup');
    expect(onReorder).toHaveBeenCalledWith(['b', 'c', 'a']);
    expect(result.current.draggingId).toBeNull();
    expect(result.current.announcement).toBe('Moved "Task A" to position 3 of 3.');

    // Listening stops with the drag
    on('pointermove', 0);
    expect(result.current.order).toEqual(IDS);
  });

  it('saves nothing when dropped where it started, or when the drag is cancelled', () => {
    const { result, onReorder } = renderReorder();
    const handle = list().querySelector('[data-task-id="b"] button')!;

    act(() => result.current.handleProps('b').onPointerDown(down(handle)));
    on('pointermove', 75);
    on('pointerup');
    act(() => result.current.handleProps('b').onPointerDown(down(handle)));
    on('pointermove', 0);
    on('pointercancel');

    expect(onReorder).not.toHaveBeenCalled();
    expect(result.current.order).toEqual(IDS);
    expect(result.current.draggingId).toBeNull();
  });

  it('only starts a drag with the main button, and inside a list', () => {
    const { result } = renderReorder();
    const handle = list().querySelector('[data-task-id="a"] button')!;

    act(() => result.current.handleProps('a').onPointerDown(down(handle, 2)));
    act(() => result.current.handleProps('a').onPointerDown(down(document.createElement('button'))));

    expect(result.current.draggingId).toBeNull();
  });

  it('stops following the pointer when the list goes away mid-drag', () => {
    const { result, onReorder, unmount } = renderReorder();
    const handle = list().querySelector('[data-task-id="a"] button')!;

    act(() => result.current.handleProps('a').onPointerDown(down(handle)));
    unmount();
    on('pointerup');

    expect(onReorder).not.toHaveBeenCalled();
  });
});
