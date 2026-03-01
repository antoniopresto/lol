import { useEffect, useRef } from 'react';

export interface KeyCombo {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
}

export interface ShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

type ComboKey = string;

function comboToKey(combo: KeyCombo): ComboKey {
  const parts: string[] = [];
  if (combo.meta) parts.push('meta');
  if (combo.ctrl) parts.push('ctrl');
  if (combo.alt) parts.push('alt');
  if (combo.shift) parts.push('shift');
  parts.push(combo.key.toLowerCase());
  return parts.join('+');
}

const activeShortcuts = new Map<ComboKey, number>();

function hasModifier(combo: KeyCombo): boolean {
  return !!(combo.meta || combo.ctrl || combo.alt || combo.shift);
}

function registerCombo(combo: KeyCombo): ComboKey {
  const key = comboToKey(combo);
  if (import.meta.env.DEV && !hasModifier(combo)) {
    console.warn(
      `[useKeyboardShortcut] Shortcut "${key}" has no modifier keys. ` +
        `This will fire while typing in inputs.`,
    );
  }
  const count = activeShortcuts.get(key) ?? 0;
  if (import.meta.env.DEV && count > 0) {
    console.warn(
      `[useKeyboardShortcut] Duplicate shortcut registered: ${key}. ` +
        `Both handlers will fire for this combo.`,
    );
  }
  activeShortcuts.set(key, count + 1);
  return key;
}

function unregisterCombo(key: ComboKey) {
  const count = activeShortcuts.get(key) ?? 0;
  if (count <= 1) {
    activeShortcuts.delete(key);
  } else {
    activeShortcuts.set(key, count - 1);
  }
}

function matchesCombo(e: KeyboardEvent, combo: KeyCombo): boolean {
  if (e.key.toLowerCase() !== combo.key.toLowerCase()) return false;
  if (!!combo.meta !== e.metaKey) return false;
  if (!!combo.ctrl !== e.ctrlKey) return false;
  if (!!combo.alt !== e.altKey) return false;
  if (!!combo.shift !== e.shiftKey) return false;
  return true;
}

export type ShortcutHandler = (e: KeyboardEvent) => void;

export function useKeyboardShortcut(
  combo: KeyCombo,
  handler: ShortcutHandler | (() => void),
  options?: ShortcutOptions,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const enabled = options?.enabled ?? true;
  const preventDefault = options?.preventDefault ?? true;

  useEffect(() => {
    if (!enabled) return;

    const comboKey = registerCombo(combo);

    function handleKeyDown(e: KeyboardEvent) {
      if (matchesCombo(e, combo)) {
        if (preventDefault) {
          e.preventDefault();
        }
        handlerRef.current(e);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unregisterCombo(comboKey);
    };
  }, [
    combo.key,
    combo.meta,
    combo.ctrl,
    combo.alt,
    combo.shift,
    enabled,
    preventDefault,
  ]);
}
