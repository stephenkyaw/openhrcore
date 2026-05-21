import { useEffect, useRef, useState } from 'react';

export function useClock(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  const idRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    idRef.current = setInterval(() => setNow(new Date()), intervalMs);
    return () => {
      if (idRef.current !== null) clearInterval(idRef.current);
    };
  }, [intervalMs]);
  return now;
}
