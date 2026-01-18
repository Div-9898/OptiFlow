'use client';

import { useState, useEffect, useRef } from 'react';
import { easeOutCubic } from '@/lib/utils';

interface UseAnimatedValueOptions {
  duration?: number;
  delay?: number;
  decimals?: number;
}

export function useAnimatedValue(
  targetValue: number,
  options: UseAnimatedValueOptions = {}
) {
  const { duration = 1000, delay = 0, decimals = 0 } = options;
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startValueRef.current = displayValue;
      startTimeRef.current = null;

      const animate = (currentTime: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = currentTime;
        }

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);

        const newValue =
          startValueRef.current +
          (targetValue - startValueRef.current) * easedProgress;

        setDisplayValue(
          decimals > 0
            ? parseFloat(newValue.toFixed(decimals))
            : Math.round(newValue)
        );

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, delay, decimals]);

  return displayValue;
}

export function useAnimatedPercentage(
  value: number,
  options: UseAnimatedValueOptions = {}
) {
  return useAnimatedValue(value * 100, { ...options, decimals: 1 });
}

export function useCountUp(
  endValue: number,
  options: UseAnimatedValueOptions = {}
) {
  const [hasStarted, setHasStarted] = useState(false);
  const animatedValue = useAnimatedValue(hasStarted ? endValue : 0, options);

  useEffect(() => {
    setHasStarted(true);
  }, []);

  return animatedValue;
}
