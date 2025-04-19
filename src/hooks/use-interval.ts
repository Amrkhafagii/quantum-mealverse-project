
import { useEffect, useRef } from 'react';

/**
 * Custom hook that implements setInterval with automatic cleanup
 * @param callback The function to call on interval
 * @param delay The delay in milliseconds, or null to pause the interval
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }
    
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
