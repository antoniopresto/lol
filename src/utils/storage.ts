const PREFIX = 'raycast-';

function prefixKey(key: string): string {
  return `${PREFIX}${key}`;
}

export function storageGet<T>(
  key: string,
  validate: (value: unknown) => value is T,
): T | null {
  try {
    const raw = localStorage.getItem(prefixKey(key));
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(prefixKey(key), JSON.stringify(value));
  } catch {
    // localStorage unavailable
  }
}

export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(prefixKey(key));
  } catch {
    // localStorage unavailable
  }
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(v => typeof v === 'string');
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isBooleanRecord(
  value: unknown,
): value is Record<string, boolean> {
  if (!isRecord(value)) return false;
  return Object.values(value).every(v => typeof v === 'boolean');
}
