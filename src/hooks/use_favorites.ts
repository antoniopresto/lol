import { useCallback, useMemo, useState } from 'react';
import { isStringArray, storageGet, storageSet } from '../utils/storage';

const STORAGE_KEY = 'favorites';

function loadFavorites(): string[] {
  return storageGet(STORAGE_KEY, isStringArray) ?? [];
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFavorites);

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
      storageSet(STORAGE_KEY, next);
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
      storageSet(STORAGE_KEY, next);
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
