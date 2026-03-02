import { useEffect, useRef, useState } from 'react';

export const SEARCH_DEBOUNCE_MS = 150;

export function useDebounce<T>(
  value: T,
  delay: number,
): {
  debouncedValue: T;
  isPending: boolean;
} {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isPending, setIsPending] = useState(false);
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (Object.is(value, previousValueRef.current)) {
      return;
    }
    previousValueRef.current = value;
    setIsPending(true);

    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [
    value,
    delay,
  ]);

  return {
    debouncedValue,
    isPending,
  };
}
