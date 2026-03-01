import { useCallback, useEffect, useState } from 'react';
import { recentCommandDb } from '../utils/database';

const MAX_RECENT = 10;

export function useRecentCommands() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    recentCommandDb
      .getAll(MAX_RECENT)
      .then(ids => {
        if (!cancelled) setRecentIds(ids);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, []);

  const addRecent = useCallback((id: string) => {
    setRecentIds(prev => {
      const next = [
        id,
        ...prev.filter(rid => rid !== id),
      ].slice(0, MAX_RECENT);
      return next;
    });
    recentCommandDb.add(id).catch(console.error);
  }, []);

  const clearRecent = useCallback(() => {
    setRecentIds([]);
    recentCommandDb.clear().catch(console.error);
  }, []);

  return {
    recentIds,
    addRecent,
    clearRecent,
  };
}
