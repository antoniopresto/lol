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
}

export function useWindow(options: UseWindowOptions = {}) {
  const onShowRef = useRef(options.onShow);
  const onHideRef = useRef(options.onHide);

  useEffect(() => {
    onShowRef.current = options.onShow;
    onHideRef.current = options.onHide;
  });

  useEffect(() => {
    if (!isTauri) return;

    let unlisten: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();

      const unlistenFocus = await appWindow.onFocusChanged(
        ({ payload: focused }) => {
          if (focused) {
            onShowRef.current?.();
          } else {
            onHideRef.current?.();
          }
        },
      );

      if (cancelled) {
        unlistenFocus();
      } else {
        unlisten = unlistenFocus;
      }
    })();

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  const hideWindow = useCallback(async () => {
    if (!isTauri) return;
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().hide();
  }, []);

  return { hideWindow, isTauri };
}
