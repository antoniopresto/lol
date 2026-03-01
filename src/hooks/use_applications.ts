import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppEntry } from '../platform';
import { getPlatform, isTauri } from '../platform';

interface UseApplicationsResult {
  applications: AppEntry[];
  loading: boolean;
  refresh: () => void;
}

export function useApplications(): UseApplicationsResult {
  const [applications, setApplications] = useState<AppEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const loadedRef = useRef(false);

  const loadApps = useCallback((forceRefresh: boolean) => {
    if (!isTauri) return;
    setLoading(true);
    getPlatform()
      .apps.discoverApplications(forceRefresh)
      .then(setApplications)
      .catch(err => {
        console.error('Failed to discover applications:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadApps(false);
  }, [loadApps]);

  const refresh = useCallback(() => {
    loadApps(false);
  }, [loadApps]);

  return {
    applications,
    loading,
    refresh,
  };
}
