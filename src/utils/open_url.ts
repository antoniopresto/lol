function isWebUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function openUrl(url: string): void {
  if (!isWebUrl(url)) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openDeepLink(url: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.click();
}
