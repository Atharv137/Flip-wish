import { useState, useEffect, useRef } from 'react';

/**
 * JavaScript Concept: Closures
 * This custom hook demonstrates the use of a closure.
 * The inner function (the setTimeout callback and the returned function)
 * retains access to the outer function's scope variables (like 'timerRef').
 */
export function useSearchDebounce(value: string, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  // timerRef is part of the outer scope, accessed by the closure below
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set a new timer
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // The cleanup function is a closure accessing timerRef
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
