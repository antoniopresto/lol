import { useCallback, useEffect, useRef } from 'react';
import { getPlatform, isTauri } from '../platform';

export { isTauri };

interface UseWindowOptions {
  onShow?: () => void;
  onHide?: () => void;
  onTrayNavigate?: (target: string) => void;
}

export function useWindow(options: UseWindowOptions = {}) {
  const onShowRef = useRef(options.onShow);
  const onHideRef = useRef(options.onHide);
  const onTrayNavigateRef = useRef(options.onTrayNavigate);

  useEffect(() => {
    onShowRef.current = options.onShow;
    onHideRef.current = options.onHide;
    onTrayNavigateRef.current = options.onTrayNavigate;
  });

  useEffect(() => {
    if (!isTauri) return;

    let unlistenFocus: (() => void) | undefined;
    let unlistenTray: (() => void) | undefined;
    let cancelled = false;

    const platformWindow = getPlatform().window;

    (async () => {
      await platformWindow.syncStoredPositionToBackend();

      const focusUnsub = await platformWindow.onFocusChanged(focused => {
        if (focused) {
          onShowRef.current?.();
        } else {
          onHideRef.current?.();
        }
      });

      const trayUnsub = await platformWindow.onTrayNavigate(target => {
        onTrayNavigateRef.current?.(target);
      });

      if (cancelled) {
        focusUnsub();
        trayUnsub();
      } else {
        unlistenFocus = focusUnsub;
        unlistenTray = trayUnsub;
      }
    })();

    return () => {
      cancelled = true;
      unlistenFocus?.();
      unlistenTray?.();
    };
  }, []);

  const hideWindow = useCallback(async () => {
    if (!isTauri) return;
    await getPlatform().window.hide();
  }, []);

  const setPositionPreference = useCallback(async (position: string) => {
    if (!isTauri) return;
    await getPlatform().window.setPositionPreference(position);
  }, []);

  return {
    hideWindow,
    setPositionPreference,
    isTauri,
  };
}
