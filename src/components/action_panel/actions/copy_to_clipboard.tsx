import type { ReactNode } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';
import type { DropdownAction } from '../actions_dropdown';

export function CopyHUDIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClipboardHUDIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="4"
        y="2"
        width="8"
        height="12"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M6.5 2.5h3a.5.5 0 0 0 .5-.5v-.5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1V2a.5.5 0 0 0 .5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

type ShowHUD = (options: {
  icon?: ReactNode;
  title: string;
}) => string;

interface PerformCopyOptions {
  hudTitle?: string;
  hudIcon?: ReactNode;
  onCopy?: () => void;
}

export function performCopy(
  content: string,
  showHUD: ShowHUD,
  options?: PerformCopyOptions,
): void {
  copyToClipboard(content).catch(() => {});
  showHUD({
    icon: options?.hudIcon ?? <CopyHUDIcon />,
    title: options?.hudTitle ?? 'Copied to Clipboard',
  });
  options?.onCopy?.();
}

interface CreateCopyActionOptions {
  content: string;
  title?: string;
  hudTitle?: string;
  hudIcon?: ReactNode;
  shortcut?: ReactNode;
  onCopy?: () => void;
}

export function createCopyAction(
  options: CreateCopyActionOptions,
  showHUD: ShowHUD,
): DropdownAction {
  return {
    label: options.title ?? 'Copy',
    shortcut: options.shortcut,
    onClick: () => {
      performCopy(options.content, showHUD, {
        hudTitle: options.hudTitle,
        hudIcon: options.hudIcon,
        onCopy: options.onCopy,
      });
    },
  };
}
