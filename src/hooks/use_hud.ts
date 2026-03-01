import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { HUDData } from '../components/hud/hud';

const AUTO_DISMISS_MS = 1500;
const EXIT_ANIMATION_MS = 150;

let nextId = 0;

interface ShowHUDOptions {
  icon?: ReactNode;
  title: string;
}

export function useHUD() {
  const [items, setItems] = useState<HUDData[]>([]);
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
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              exiting: true,
            }
          : item));
    const exitTimer = setTimeout(() => {
      timersRef.current.delete(`${id}-exit`);
      setItems(prev => prev.filter(item => item.id !== id));
    }, EXIT_ANIMATION_MS);
    timersRef.current.set(`${id}-exit`, exitTimer);
  }, []);

  const show = useCallback(
    (options: ShowHUDOptions) => {
      const id = String(nextId++);
      const hud: HUDData = {
        id,
        icon: options.icon,
        title: options.title,
        exiting: false,
      };

      setItems(prev => [
        hud,
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
    items,
    show,
    hide,
  };
}
