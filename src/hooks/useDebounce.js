import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value by the specified delay.
 * @param {*} value - The value to debounce
 * @param {number} [delay=100] - The debounce delay in milliseconds
 * @returns {*} The debounced value
 */
export function useDebounce(value, delay = 100) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}