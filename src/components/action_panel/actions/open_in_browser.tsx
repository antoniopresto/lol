import type { ReactNode } from 'react';
import { openUrl } from '../../../utils/open_url';
import type { DropdownAction } from '../actions_dropdown';
import type { ShowHUD } from './types';

export function OpenInBrowserHUDIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 3H4.5A1.5 1.5 0 003 4.5v7A1.5 1.5 0 004.5 13h7a1.5 1.5 0 001.5-1.5V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 3h4v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 3L8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface PerformOpenOptions {
  hudTitle?: string;
  hudIcon?: ReactNode;
  onOpen?: () => void;
}

export function performOpen(
  url: string,
  showHUD: ShowHUD,
  options?: PerformOpenOptions,
): void {
  openUrl(url);
  showHUD({
    icon: options?.hudIcon ?? <OpenInBrowserHUDIcon />,
    title: options?.hudTitle ?? 'Opened in Browser',
  });
  options?.onOpen?.();
}

interface CreateOpenInBrowserActionOptions {
  url: string;
  title?: string;
  hudTitle?: string;
  hudIcon?: ReactNode;
  shortcut?: ReactNode;
  onOpen?: () => void;
}

export function createOpenInBrowserAction(
  options: CreateOpenInBrowserActionOptions,
  showHUD: ShowHUD,
): DropdownAction {
  return {
    label: options.title ?? 'Open in Browser',
    shortcut: options.shortcut,
    onClick: () => {
      performOpen(options.url, showHUD, {
        hudTitle: options.hudTitle,
        hudIcon: options.hudIcon,
        onOpen: options.onOpen,
      });
    },
  };
}
