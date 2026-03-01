import { useCallback, useEffect, useMemo, useState } from 'react';
import { settingsDb } from '../utils/database';

const DB_KEY = 'favorites';

function parseIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(v => typeof v === 'string')) {
      return parsed as string[];
    }
  } catch {
    // invalid
  }
  return [];
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    settingsDb
      .get(DB_KEY)
      .then(raw => {
        if (!cancelled) setFavoriteIds(parseIds(raw));
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, []);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const isFavorite = useCallback(
    (id: string) => favoriteSet.has(id),
    [favoriteSet],
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds(prev => {
      const next = prev.includes(id)
        ? prev.filter(fid => fid !== id)
        : [
            ...prev,
            id,
          ];
      settingsDb.set(DB_KEY, JSON.stringify(next)).catch(console.error);
      return next;
    });
  }, []);

  const moveFavorite = useCallback((id: string, direction: 'up' | 'down') => {
    setFavoriteIds(prev => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      next[idx] = prev[targetIdx]!;
      next[targetIdx] = prev[idx]!;
      settingsDb.set(DB_KEY, JSON.stringify(next)).catch(console.error);
      return next;
    });
  }, []);

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    moveFavorite,
  };
}
