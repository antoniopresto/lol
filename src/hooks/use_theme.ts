import { useCallback, useEffect, useState } from 'react';
import { storageGet, storageSet } from '../utils/storage';

type ThemePreference = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';

const STORAGE_KEY = 'theme';

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

function loadPreference(): ThemePreference {
  const fromStorage = storageGet(STORAGE_KEY, isThemePreference);
  if (fromStorage) return fromStorage;

  try {
    const raw = localStorage.getItem('raycast-theme');
    if (raw && isThemePreference(raw)) {
      storageSet(STORAGE_KEY, raw);
      return raw;
    }
  } catch {
    // unavailable
  }
  return 'dark';
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(loadPreference);
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    resolveTheme(preference));

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
    storageSet(STORAGE_KEY, value);
  }, []);

  return {
    preference,
    resolved,
    setTheme,
  };
}
