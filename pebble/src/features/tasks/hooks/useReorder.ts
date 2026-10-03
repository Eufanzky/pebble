'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { dropIndex, moveBy, moveTo } from '../lib/organise';

export const REORDER_HINT = 'Use the arrow keys to move this task up or down, or drag it.';

type Drag = { id: string; order: string[] };

/**
 * Reordering a list by keyboard (arrow keys, Home and End on the handle) or by
 * dragging the handle (mouse, pen or touch). While dragging, `order` previews
 * the new order; letting go saves it with `onReorder`. `announcement` says
 * where a task went, for screen readers.
 *
 * A drag follows the pointer on the window, not on the handle: moving the
 * card in the DOM to preview the order makes the browser drop pointer capture.
 */
export function useReorder(ids: string[], titleOf: (id: string) => string, onReorder: (ids: string[]) => void) {
  const [drag, setDragState] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const setDrag = (next: Drag | null) => {
    dragRef.current = next;
    setDragState(next);
  };

  // A drag still going when the list unmounts stops listening
  useEffect(() => () => stopRef.current?.(), []);

  const commit = useCallback(
    (id: string, order: string[], from: string[]) => {
      if (order.join() === from.join()) return;
      onReorder(order);
      setAnnouncement(`Moved "${titleOf(id)}" to position ${order.indexOf(id) + 1} of ${order.length}.`);
    },
    [onReorder, titleOf],
  );

  const handleProps = (id: string) => ({
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      const delta = { ArrowUp: -1, ArrowDown: 1 }[e.key];
      const edge = { Home: 0, End: ids.length - 1 }[e.key];
      if (delta === undefined && edge === undefined) return;
      e.preventDefault();
      commit(id, delta !== undefined ? moveBy(ids, id, delta) : moveTo(ids, id, edge!), ids);
    },
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      const list = e.currentTarget.closest('[data-reorder-list]');
      if (!list) return;
      e.preventDefault();
      const from = ids;
      setDrag({ id, order: from });

      const move = (event: { clientY: number }) => {
        const others = Array.from(list.querySelectorAll<HTMLElement>('[data-task-id]')).filter(
          (el) => el.dataset.taskId !== id,
        );
        const middles = others.map((el) => {
          const box = el.getBoundingClientRect();
          return box.top + box.height / 2;
        });
        const order = moveTo(from, id, dropIndex(middles, event.clientY));
        if (order.join() !== dragRef.current?.order.join()) setDrag({ id, order });
      };
      const stop = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', drop);
        window.removeEventListener('pointercancel', cancel);
        stopRef.current = null;
      };
      const drop = () => {
        const order = dragRef.current?.order ?? from;
        stop();
        setDrag(null);
        commit(id, order, from);
      };
      const cancel = () => {
        stop();
        setDrag(null);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', drop);
      window.addEventListener('pointercancel', cancel);
      stopRef.current = stop;
    },
  });

  return { order: drag?.order ?? ids, draggingId: drag?.id ?? null, handleProps, announcement };
}
