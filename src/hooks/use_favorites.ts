import { useCallback, useMemo, useState } from 'react';

const STORAGE_KEY = 'raycast-favorites';

function loadFavorites(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every(id => typeof id === 'string')) {
        return parsed;
      }
    }
  } catch {
    return [];
  }
  return [];
}

function saveFavorites(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // no-op
  }
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
      saveFavorites(next);
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
      saveFavorites(next);
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
