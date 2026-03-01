import { useCallback, useEffect, useRef } from 'react';

let isTauri = false;
try {
  isTauri = '__TAURI_INTERNALS__' in window;
} catch {
  // not in Tauri
}

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

    (async () => {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const { listen } = await import('@tauri-apps/api/event');
      const appWindow = getCurrentWindow();

      const focusUnsub = await appWindow.onFocusChanged(({
        payload: focused,
      }) => {
        if (focused) {
          onShowRef.current?.();
        } else {
          onHideRef.current?.();
        }
      });

      const trayUnsub = await listen<string>('tray-navigate', event => {
        onTrayNavigateRef.current?.(event.payload);
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
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().hide();
  }, []);

  return {
    hideWindow,
    isTauri,
  };
}
