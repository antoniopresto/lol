import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToastData, ToastStyle } from '../components/toast/toast';

const AUTO_DISMISS_MS = 3000;
const EXIT_ANIMATION_MS = 200;

let nextId = 0;

interface ShowToastOptions {
  style?: ToastStyle;
  title: string;
  message?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const hide = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              exiting: true,
            }
          : t));
    const exitTimer = setTimeout(() => {
      timersRef.current.delete(`${id}-exit`);
      setToasts(prev => prev.filter(t => t.id !== id));
    }, EXIT_ANIMATION_MS);
    timersRef.current.set(`${id}-exit`, exitTimer);
  }, []);

  const show = useCallback(
    (options: ShowToastOptions) => {
      const id = String(nextId++);
      const toast: ToastData = {
        id,
        style: options.style ?? 'info',
        title: options.title,
        message: options.message,
        exiting: false,
      };

      setToasts(prev => [
        toast,
        ...prev,
      ]);

      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        hide(id);
      }, AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);

      return id;
    },
    [hide],
  );

  return {
    toasts,
    show,
    hide,
  };
}
