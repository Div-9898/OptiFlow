'use client';

import { useEffect, useState, useCallback } from 'react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

export function useKonamiCode(callback: () => void) {
  const [index, setIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Check if the pressed key matches the expected key in the sequence
      if (e.code === KONAMI_CODE[index]) {
        const nextIndex = index + 1;

        if (nextIndex === KONAMI_CODE.length) {
          // Full sequence completed!
          callback();
          setIndex(0);
          setShowHint(false);
        } else {
          setIndex(nextIndex);

          // Show hint after first 4 correct keys
          if (nextIndex >= 4) {
            setShowHint(true);
          }
        }
      } else {
        // Reset on wrong key
        setIndex(0);
        setShowHint(false);
      }
    },
    [index, callback]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    progress: index / KONAMI_CODE.length,
    showHint,
    currentIndex: index,
  };
}
