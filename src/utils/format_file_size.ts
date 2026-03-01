const UNITS = [
  'B',
  'KB',
  'MB',
  'GB',
] as const;

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '--';
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < UNITS.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  const formatted =
    unitIndex === 0 ? `${size}` : size.toFixed(size < 10 ? 1 : 0);
  return `${formatted} ${UNITS[unitIndex]}`;
}
