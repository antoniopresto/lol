import { useCallback, useEffect, useState } from 'react';
import type { ClipboardEntry } from '../data/clipboard_data';
import { MOCK_CLIPBOARD_ENTRIES } from '../data/clipboard_data';
import type { ClipboardChangeEvent } from '../platform';
import { getPlatform, isTauri } from '../platform';
import { storageGet, storageSet } from '../utils/storage';

const HISTORY_KEY = 'clipboard-history';
const MAX_ENTRIES = 1000;

interface StoredEntry {
  id: string;
  content: string;
  contentType: 'text' | 'link' | 'color' | 'image';
  sourceApp: string;
  copiedAt: string;
  pinned: boolean;
}

function isStoredEntryArray(value: unknown): value is StoredEntry[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    v =>
      typeof v === 'object' &&
      v !== null &&
      'id' in v &&
      typeof v.id === 'string' &&
      'content' in v &&
      typeof v.content === 'string' &&
      'contentType' in v &&
      typeof v.contentType === 'string' &&
      'copiedAt' in v &&
      typeof v.copiedAt === 'string' &&
      'pinned' in v &&
      typeof v.pinned === 'boolean',
  );
}

function serializeEntries(entries: ClipboardEntry[]): StoredEntry[] {
  return entries.map(e => ({
    id: e.id,
    content: e.content,
    contentType: e.contentType,
    sourceApp: e.sourceApp,
    copiedAt: e.copiedAt.toISOString(),
    pinned: e.pinned,
  }));
}

function deserializeEntries(stored: StoredEntry[]): ClipboardEntry[] {
  return stored.map(e => {
    const date = new Date(e.copiedAt);
    return {
      id: e.id,
      content: e.content,
      contentType: e.contentType,
      sourceApp: e.sourceApp,
      sourceIcon: null,
      copiedAt: isNaN(date.getTime()) ? new Date() : date,
      pinned: e.pinned,
    };
  });
}

function loadEntries(): ClipboardEntry[] {
  const stored = storageGet(HISTORY_KEY, isStoredEntryArray);
  if (stored && stored.length > 0) {
    return deserializeEntries(stored);
  }
  if (!isTauri) {
    return MOCK_CLIPBOARD_ENTRIES.map(e => ({ ...e }));
  }
  return [];
}

function persistEntries(entries: ClipboardEntry[]) {
  storageSet(HISTORY_KEY, serializeEntries(entries));
}

function createEntryFromEvent(event: ClipboardChangeEvent): ClipboardEntry {
  return {
    id: `clip-${event.timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    content: event.content,
    contentType: event.contentType,
    sourceApp: 'System',
    sourceIcon: null,
    copiedAt: new Date(event.timestamp),
    pinned: false,
  };
}

function trimToMaxEntries(entries: ClipboardEntry[]): ClipboardEntry[] {
  if (entries.length <= MAX_ENTRIES) return entries;
  const pinned = entries.filter(e => e.pinned);
  const unpinned = entries.filter(e => !e.pinned);
  const unpinnedLimit = Math.max(0, MAX_ENTRIES - pinned.length);
  return [...pinned, ...unpinned.slice(0, unpinnedLimit)];
}

export function useClipboardHistory() {
  const [entries, setEntries] = useState<ClipboardEntry[]>(loadEntries);

  useEffect(() => {
    if (!isTauri) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    getPlatform()
      .clipboard.onClipboardChange((event: ClipboardChangeEvent) => {
        if (cancelled) return;

        setEntries(prev => {
          const existing = prev.find(
            e => e.content === event.content && !e.pinned,
          );

          let next: ClipboardEntry[];
          if (existing) {
            next = [
              { ...existing, copiedAt: new Date(event.timestamp) },
              ...prev.filter(e => e.id !== existing.id),
            ];
          } else {
            next = [createEntryFromEvent(event), ...prev];
          }

          next = trimToMaxEntries(next);
          persistEntries(next);
          return next;
        });
      })
      .then(unsub => {
        if (cancelled) {
          unsub();
        } else {
          unsubscribe = unsub;
        }
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const togglePin = useCallback((entryId: string) => {
    setEntries(prev => {
      const next = prev.map(e =>
        e.id === entryId
          ? {
              ...e,
              pinned: !e.pinned,
            }
          : e);
      persistEntries(next);
      return next;
    });
  }, []);

  const deleteEntry = useCallback((entryId: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== entryId);
      persistEntries(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
    persistEntries([]);
  }, []);

  return {
    entries,
    togglePin,
    deleteEntry,
    clearAll,
  };
}
