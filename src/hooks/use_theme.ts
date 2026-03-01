import { useCallback, useEffect, useState } from 'react';

type ThemePreference = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';

const STORAGE_KEY = 'raycast-theme';

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference;
}

function loadPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light' || stored === 'system') {
    return stored;
  }
  return 'dark';
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(loadPreference);
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    resolveTheme(loadPreference()));

  useEffect(() => {
    const r = resolveTheme(preference);
    setResolved(r);
    applyTheme(r);
  }, [preference]);

  useEffect(() => {
    if (preference !== 'system') return;

    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => {
      const r = resolveTheme('system');
      setResolved(r);
      applyTheme(r);
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [preference]);

  const setTheme = useCallback((value: ThemePreference) => {
    setPreference(value);
    localStorage.setItem(STORAGE_KEY, value);
  }, []);

  return {
    preference,
    resolved,
    setTheme,
  };
}
