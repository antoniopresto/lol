import type {
  PlatformAPI,
  PlatformClipboard,
  PlatformFiles,
  PlatformShell,
  PlatformWindow,
} from './types';

const noop = () => {};

function isWebUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const clipboard: PlatformClipboard = {
  async writeText(text: string) {
    await navigator.clipboard.writeText(text);
  },
  async readText() {
    return navigator.clipboard.readText();
  },
  async onClipboardChange() {
    return noop;
  },
};

const shell: PlatformShell = {
  async openUrl(url: string) {
    if (!isWebUrl(url)) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  },
  async openDeepLink(url: string) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.click();
  },
};

const platformWindow: PlatformWindow = {
  async hide() {},
  async setPositionPreference() {},
  async onFocusChanged() {
    return noop;
  },
  async onTrayNavigate() {
    return noop;
  },
  async syncStoredPositionToBackend() {},
};

const files: PlatformFiles = {
  async searchFiles() {
    return [];
  },
  async openFile() {},
  async revealInFinder() {},
  async moveToTrash() {},
};

export const webPlatform: PlatformAPI = {
  clipboard,
  shell,
  window: platformWindow,
  files,
};
