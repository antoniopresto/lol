import { getPlatform } from '../platform';

export async function openUrl(url: string): Promise<void> {
  await getPlatform().shell.openUrl(url);
}

export async function openDeepLink(url: string): Promise<void> {
  await getPlatform().shell.openDeepLink(url);
}
