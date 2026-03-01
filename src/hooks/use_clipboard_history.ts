import { useCallback, useEffect, useRef, useState } from 'react';
import type { ClipboardEntry } from '../data/clipboard_data';
import { MOCK_CLIPBOARD_ENTRIES } from '../data/clipboard_data';
import type { ClipboardChangeEvent } from '../platform';
import { getPlatform, isTauri } from '../platform';
import type { ClipboardEntryRow } from '../utils/database';
import { clipboardDb } from '../utils/database';

const MAX_ENTRIES = 1000;

const VALID_CONTENT_TYPES = new Set<ClipboardEntry['contentType']>([
  'text',
  'link',
  'color',
  'image',
]);

function validContentType(value: string): ClipboardEntry['contentType'] {
  return VALID_CONTENT_TYPES.has(value as ClipboardEntry['contentType'])
    ? (value as ClipboardEntry['contentType'])
    : 'text';
}

function rowToEntry(row: ClipboardEntryRow): ClipboardEntry {
  const date = new Date(row.copied_at);
  return {
    id: row.id,
    content: row.content,
    contentType: validContentType(row.content_type),
    sourceApp: row.source_app,
    sourceIcon: null,
    copiedAt: isNaN(date.getTime()) ? new Date() : date,
    pinned: row.pinned === 1,
  };
}

function entryToRow(entry: ClipboardEntry): ClipboardEntryRow {
  return {
    id: entry.id,
    content: entry.content,
    content_type: entry.contentType,
    source_app: entry.sourceApp,
    copied_at: entry.copiedAt.toISOString(),
    pinned: entry.pinned ? 1 : 0,
  };
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

function trimToMaxEntries(entries: ClipboardEntry[]): {
  kept: ClipboardEntry[];
  removed: string[];
} {
  if (entries.length <= MAX_ENTRIES)
    return {
      kept: entries,
      removed: [],
    };
  const pinned = entries.filter(e => e.pinned);
  const unpinned = entries.filter(e => !e.pinned);
  const unpinnedLimit = Math.max(0, MAX_ENTRIES - pinned.length);
  const kept = [
    ...pinned,
    ...unpinned.slice(0, unpinnedLimit),
  ];
  const removedIds = unpinned.slice(unpinnedLimit).map(e => e.id);
  return {
    kept,
    removed: removedIds,
  };
}

export function useClipboardHistory() {
  const [entries, setEntries] = useState<ClipboardEntry[]>([]);
  const entriesRef = useRef<ClipboardEntry[]>([]);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    let aborted = false;

    clipboardDb
      .getAll(MAX_ENTRIES)
      .then(rows => {
        if (aborted) return;
        if (rows.length > 0) {
          setEntries(rows.map(rowToEntry));
        } else if (!isTauri) {
          const mock = MOCK_CLIPBOARD_ENTRIES.map(e => ({ ...e }));
          setEntries(mock);
          Promise.all(mock.map(e => clipboardDb.insert(entryToRow(e)))).catch(
            console.error,
          );
        }
      })
      .catch(err => {
        console.error('Failed to load clipboard history:', err);
        if (!isTauri && !aborted) {
          setEntries(MOCK_CLIPBOARD_ENTRIES.map(e => ({ ...e })));
        }
      });

    return () => {
      aborted = true;
    };
  }, []);

  useEffect(() => {
    if (!isTauri) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    getPlatform()
      .clipboard.onClipboardChange((event: ClipboardChangeEvent) => {
        if (cancelled) return;

        const prev = entriesRef.current;
        const existing = prev.find(
          e => e.content === event.content && !e.pinned,
        );

        let next: ClipboardEntry[];
        if (existing) {
          const updated = {
            ...existing,
            copiedAt: new Date(event.timestamp),
          };
          next = [
            updated,
            ...prev.filter(e => e.id !== existing.id),
          ];
          clipboardDb
            .update(existing.id, {
              copied_at: updated.copiedAt.toISOString(),
            })
            .catch(console.error);
        } else {
          const newEntry = createEntryFromEvent(event);
          next = [
            newEntry,
            ...prev,
          ];
          clipboardDb.insert(entryToRow(newEntry)).catch(console.error);
        }

        const { kept, removed } = trimToMaxEntries(next);
        if (removed.length > 0) {
          Promise.all(removed.map(id => clipboardDb.delete(id))).catch(
            console.error,
          );
        }

        setEntries(kept);
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
      const entry = prev.find(e => e.id === entryId);
      if (!entry) return prev;
      const newPinned = !entry.pinned;
      clipboardDb
        .update(entryId, { pinned: newPinned ? 1 : 0 })
        .catch(console.error);
      return prev.map(e =>
        e.id === entryId
          ? {
              ...e,
              pinned: newPinned,
            }
          : e);
    });
  }, []);

  const deleteEntry = useCallback((entryId: string) => {
    setEntries(prev => prev.filter(e => e.id !== entryId));
    clipboardDb.delete(entryId).catch(console.error);
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
    clipboardDb.clear().catch(console.error);
  }, []);

  return {
    entries,
    togglePin,
    deleteEntry,
    clearAll,
  };
}
