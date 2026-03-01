import type { ListItemData } from './types';

export type NavViewData =
  | {
      type: 'command';
      commandId: string;
    }
  | {
      type: 'detail';
      item: ListItemData;
    };

export const TRAY_COMMAND_MAP: Record<
  string,
  {
    id: string;
    name: string;
  }
> = {
  clipboard: {
    id: 'clipboard-history',
    name: 'Clipboard History',
  },
  snippets: {
    id: 'snippets',
    name: 'Snippets',
  },
  settings: {
    id: 'settings',
    name: 'Settings',
  },
  about: {
    id: 'settings',
    name: 'Settings',
  },
  'check-updates': {
    id: 'settings',
    name: 'Settings',
  },
};
