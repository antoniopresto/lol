import { useCallback, useEffect, useRef, useState } from 'react';
import { isTauri } from '../platform';

export function useDbSearch<TRow, TEntry>(
  query: string,
  dbSearch: (query: string) => Promise<TRow[]>,
  rowToEntry: (row: TRow) => TEntry,
): {
  results: TEntry[] | null;
  invalidate: () => void;
} {
  const [results, setResults] = useState<TEntry[] | null>(null);
  const requestIdRef = useRef(0);

  const invalidate = useCallback(() => {
    requestIdRef.current++;
    setResults(null);
  }, []);

  useEffect(() => {
    if (!isTauri || !query.trim()) {
      setResults(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    let cancelled = false;

    dbSearch(query)
      .then(rows => {
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }
        setResults(rows.map(rowToEntry));
      })
      .catch(err => {
        console.error('FTS5 search failed:', err);
        if (!cancelled && requestId === requestIdRef.current) {
          setResults(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    query,
    dbSearch,
    rowToEntry,
  ]);

  return {
    results,
    invalidate,
  };
}
