'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Reads `text` aloud with the browser's speech synthesis and tracks which
 * word is being spoken, so the reader can highlight it.
 */
export function useReadAloud(text: string) {
  const [reading, setReading] = useState(false);
  const [wordIndex, setWordIndex] = useState(-1);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setReading(false);
    setWordIndex(-1);
  }, []);

  useEffect(() => {
    if (!reading) return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    let spoken = 0;
    utterance.onboundary = (event) => {
      if (event.name === 'word') setWordIndex(spoken++);
    };
    utterance.onend = () => {
      setReading(false);
      setWordIndex(-1);
    };

    synth.cancel();
    synth.speak(utterance);
    return () => synth.cancel();
  }, [reading, text]);

  // Stop speaking when the reader goes away
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const toggle = useCallback(() => (reading ? stop() : setReading(true)), [reading, stop]);

  return { reading, wordIndex, toggle, stop };
}
