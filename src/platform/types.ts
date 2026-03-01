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

export interface PlatformAPI {
  readonly clipboard: PlatformClipboard;
  readonly shell: PlatformShell;
  readonly window: PlatformWindow;
}
