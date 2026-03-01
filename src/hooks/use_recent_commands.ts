import { useCallback, useState } from 'react';
import { isStringArray, storageGet, storageSet } from '../utils/storage';

const STORAGE_KEY = 'recent-commands';
const MAX_RECENT = 10;

function loadRecent(): string[] {
  return storageGet(STORAGE_KEY, isStringArray) ?? [];
}

export function useRecentCommands() {
  const [recentIds, setRecentIds] = useState<string[]>(loadRecent);

  const addRecent = useCallback((id: string) => {
    setRecentIds(prev => {
      const next = [
        id,
        ...prev.filter(rid => rid !== id),
      ].slice(0, MAX_RECENT);
      storageSet(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentIds([]);
    storageSet(STORAGE_KEY, []);
  }, []);

  return {
    recentIds,
    addRecent,
    clearRecent,
  };
}
