import { storageGet } from '../utils/storage';
import type {
  AppEntry,
  ClipboardChangeEvent,
  FileSearchResult,
  PlatformAPI,
  PlatformApps,
  PlatformAutostart,
  PlatformClipboard,
  PlatformFiles,
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
    const { writeText } = await import('@tauri-apps/plugin-clipboard-manager');
    await writeText(text);
  },
  async readText() {
    const { readText } = await import('@tauri-apps/plugin-clipboard-manager');
    return readText();
  },
  async onClipboardChange(handler: (event: ClipboardChangeEvent) => void) {
    const { listen } = await import('@tauri-apps/api/event');
    return listen<ClipboardChangeEvent>('clipboard-changed', event => {
      handler(event.payload);
    });
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

const files: PlatformFiles = {
  async searchFiles(
    query: string,
    paths?: string[],
    maxResults?: number,
  ): Promise<FileSearchResult[]> {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<FileSearchResult[]>('search_files', {
      query,
      paths: paths ?? [],
      maxResults: maxResults ?? 200,
    });
  },
  async openFile(path: string) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('open_file', { path });
  },
  async revealInFinder(path: string) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('reveal_in_finder', { path });
  },
  async moveToTrash(path: string) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('move_to_trash', { path });
  },
};

const apps: PlatformApps = {
  async discoverApplications(forceRefresh = false): Promise<AppEntry[]> {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<AppEntry[]>('discover_applications', {
      forceRefresh,
    });
  },
  async launchApplication(path: string) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('launch_application', { path });
  },
};

const autostart: PlatformAutostart = {
  async enable() {
    const { enable } = await import('@tauri-apps/plugin-autostart');
    await enable();
  },
  async disable() {
    const { disable } = await import('@tauri-apps/plugin-autostart');
    await disable();
  },
  async isEnabled() {
    const { isEnabled } = await import('@tauri-apps/plugin-autostart');
    return isEnabled();
  },
};

export const tauriPlatform: PlatformAPI = {
  clipboard,
  shell,
  window: platformWindow,
  files,
  apps,
  autostart,
};
