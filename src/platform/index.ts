import type { PlatformAPI } from './types';
import { webPlatform } from './web';

export type {
  AppEntry,
  ClipboardChangeEvent,
  FileSearchResult,
  PlatformAPI,
  PlatformApps,
  PlatformClipboard,
  PlatformFiles,
  PlatformShell,
  PlatformWindow,
  Unsubscribe,
} from './types';

function detectTauri(): boolean {
  try {
    return '__TAURI_INTERNALS__' in window;
  } catch {
    return false;
  }
}

export const isTauri = detectTauri();

let _platform: PlatformAPI | undefined;
let _initPromise: Promise<PlatformAPI> | undefined;

export function getPlatform(): PlatformAPI {
  if (_platform) return _platform;

  if (isTauri) {
    throw new Error(
      'Platform not initialized. Call initPlatform() before getPlatform() in Tauri mode.',
    );
  }

  _platform = webPlatform;
  return _platform;
}

export function initPlatform(): Promise<PlatformAPI> {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    if (isTauri) {
      const { tauriPlatform } = await import('./tauri');
      _platform = tauriPlatform;
    } else {
      _platform = webPlatform;
    }
    return _platform;
  })();

  return _initPromise;
}
