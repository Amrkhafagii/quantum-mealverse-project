
import { useRef, useEffect, useState } from "react";

// Tracks elapsed time (in seconds) spent in the form
export function useReviewFormTimer(isActive: boolean) {
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      timer.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isActive && timer.current) {
      clearInterval(timer.current);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [isActive]);
  
  const reset = () => setSeconds(0);

  return { seconds, reset };
}
