function isWebUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function openUrl(url: string): Promise<void> {
  if (!isWebUrl(url)) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}
