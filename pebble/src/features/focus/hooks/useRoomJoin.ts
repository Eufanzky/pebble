'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RoomInfo } from '../data/rooms';

export const JOIN_STEP_MS = 600;
export const JOIN_MS = 3000;
export const JOIN_STEPS = 4;

/**
 * Joining a sample room: a short, staged loading screen, then the room.
 * Timers are cleared if the page goes away mid-join.
 */
export function useRoomJoin(onJoined: (room: RoomInfo) => void) {
  const [joining, setJoining] = useState(false);
  const [step, setStep] = useState(0);
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const join = useCallback(
    (next: RoomInfo) => {
      setJoining(true);
      setStep(0);
      for (let s = 1; s <= JOIN_STEPS; s++) {
        timers.current.push(setTimeout(() => setStep(s), s * JOIN_STEP_MS));
      }
      timers.current.push(
        setTimeout(() => {
          setJoining(false);
          setRoom(next);
          onJoined(next);
        }, JOIN_MS),
      );
    },
    [onJoined],
  );

  const leave = useCallback(() => setRoom(null), []);

  return { joining, step, room, join, leave };
}
