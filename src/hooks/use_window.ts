import { useCallback, useEffect, useRef } from 'react';
import { storageGet } from '../utils/storage';

export const isTauri = (() => {
  try {
    return '__TAURI_INTERNALS__' in window;
  } catch {
    return false;
  }
})();

interface UseWindowOptions {
  onShow?: () => void;
  onHide?: () => void;
  onTrayNavigate?: (target: string) => void;
}

const SETTINGS_STORAGE_KEY = 'settings-general';

function isSettingsWithPosition(v: unknown): v is { windowPosition: string } {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as Record<string, unknown>).windowPosition === 'string'
  );
}

async function syncStoredPositionToBackend() {
  if (!isTauri) return;
  const stored = storageGet(SETTINGS_STORAGE_KEY, isSettingsWithPosition);
  if (stored?.windowPosition) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('set_window_position_pref', {
      position: stored.windowPosition,
    }).catch((e: unknown) => {
      console.warn('failed to sync position preference:', e);
    });
  }
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

      await syncStoredPositionToBackend();

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

  const setPositionPreference = useCallback(async (position: string) => {
    if (!isTauri) return;
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('set_window_position_pref', { position });
  }, []);

  return {
    hideWindow,
    setPositionPreference,
    isTauri,
  };
}
