import { useCallback, useEffect, useState } from 'react';
import { settingsDb } from '../utils/database';

type ThemePreference = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';

const DB_KEY = 'theme';

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'dark' || value === 'light' || value === 'system';
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference;
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>('dark');
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    resolveTheme('dark'));

  useEffect(() => {
    let cancelled = false;
    settingsDb
      .get(DB_KEY)
      .then(raw => {
        if (cancelled) return;
        const pref = isThemePreference(raw) ? raw : 'dark';
        setPreference(pref);
        const r = resolveTheme(pref);
        setResolved(r);
        applyTheme(r);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, []);

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
    settingsDb.set(DB_KEY, value).catch(console.error);
  }, []);

  return {
    preference,
    resolved,
    setTheme,
  };
}
