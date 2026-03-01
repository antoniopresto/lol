import { getPlatform } from '../platform';

export async function copyToClipboard(text: string): Promise<void> {
  await getPlatform().clipboard.writeText(text);
}

export async function readClipboard(): Promise<string> {
  return getPlatform().clipboard.readText();
}
