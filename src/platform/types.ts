export interface ClipboardChangeEvent {
  content: string;
  contentType: 'text' | 'link' | 'color';
  timestamp: number;
}

export interface PlatformClipboard {
  writeText(text: string): Promise<void>;
  readText(): Promise<string>;
  onClipboardChange(
    handler: (event: ClipboardChangeEvent) => void,
  ): Promise<Unsubscribe>;
}

export interface PlatformShell {
  openUrl(url: string): Promise<void>;
  openDeepLink(url: string): Promise<void>;
}

export interface Unsubscribe {
  (): void;
}

export interface PlatformWindow {
  hide(): Promise<void>;
  setPositionPreference(position: string): Promise<void>;
  onFocusChanged(handler: (focused: boolean) => void): Promise<Unsubscribe>;
  onTrayNavigate(handler: (target: string) => void): Promise<Unsubscribe>;
  syncStoredPositionToBackend(): Promise<void>;
}

export interface FileSearchResult {
  id: string;
  name: string;
  path: string;
  fileType: string;
  size: number;
  modifiedAt: number;
}

export interface PlatformFiles {
  searchFiles(
    query: string,
    paths?: string[],
    maxResults?: number,
  ): Promise<FileSearchResult[]>;
  openFile(path: string): Promise<void>;
  revealInFinder(path: string): Promise<void>;
  moveToTrash(path: string): Promise<void>;
}

export interface AppEntry {
  id: string;
  name: string;
  path: string;
  icon: string | null;
}

export interface PlatformApps {
  discoverApplications(forceRefresh?: boolean): Promise<AppEntry[]>;
  launchApplication(path: string): Promise<void>;
}

export interface PlatformAutostart {
  enable(): Promise<void>;
  disable(): Promise<void>;
  isEnabled(): Promise<boolean>;
}

export interface PlatformAPI {
  readonly clipboard: PlatformClipboard;
  readonly shell: PlatformShell;
  readonly window: PlatformWindow;
  readonly files: PlatformFiles;
  readonly apps: PlatformApps;
  readonly autostart: PlatformAutostart;
}
