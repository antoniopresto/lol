import { storageGet } from '../utils/storage';
import type {
  PlatformAPI,
  PlatformClipboard,
  PlatformShell,
  PlatformWindow,
} from './types';

const SETTINGS_STORAGE_KEY = 'settings-general';

function isSettingsWithPosition(v: unknown): v is { windowPosition: string } {
  return (
    typeof v === 'object' &&
    v !== null &&
    'windowPosition' in v &&
    typeof v.windowPosition === 'string'
  );
}

const clipboard: PlatformClipboard = {
  async writeText(text: string) {
    await navigator.clipboard.writeText(text);
  },
  async readText() {
    return navigator.clipboard.readText();
  },
};

const shell: PlatformShell = {
  async openUrl(url: string) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return;
      }
    } catch {
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  },
  async openDeepLink(url: string) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.click();
  },
};

const platformWindow: PlatformWindow = {
  async hide() {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().hide();
  },
  async setPositionPreference(position: string) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('set_window_position_pref', { position });
  },
  async onFocusChanged(handler: (focused: boolean) => void) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    return getCurrentWindow().onFocusChanged(({ payload: focused }) => {
      handler(focused);
    });
  },
  async onTrayNavigate(handler: (target: string) => void) {
    const { listen } = await import('@tauri-apps/api/event');
    return listen<string>('tray-navigate', event => {
      handler(event.payload);
    });
  },
  async syncStoredPositionToBackend() {
    const stored = storageGet(SETTINGS_STORAGE_KEY, isSettingsWithPosition);
    if (!stored?.windowPosition) return;

    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('set_window_position_pref', {
      position: stored.windowPosition,
    });
  },
};

export const tauriPlatform: PlatformAPI = {
  clipboard,
  shell,
  window: platformWindow,
};
