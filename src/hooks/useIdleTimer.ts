
import { useState, useEffect, useCallback, useRef } from 'react';

interface IdleTimerProps {
  onIdle: (idleTime: number) => void;
  idleThreshold?: number; // in milliseconds
}

export const useIdleTimer = ({ onIdle, idleThreshold = 5 * 60 * 1000 }: IdleTimerProps): { isIdle: boolean } => {
  const [isIdle, setIsIdle] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleActivity = useCallback(() => {
    if (isIdle) {
      const idleDuration = Date.now() - lastActivityRef.current;
      onIdle(idleDuration);
      setIsIdle(false);
    }
    lastActivityRef.current = Date.now();
  }, [isIdle, onIdle]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity));

    const checkIdle = (): void => {
      if (!isIdle && Date.now() - lastActivityRef.current > idleThreshold) {
        setIsIdle(true);
      }
    };

    timerRef.current = setInterval(checkIdle, 1000);

    return (): void => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleActivity, isIdle, idleThreshold]);

  return { isIdle };
};
