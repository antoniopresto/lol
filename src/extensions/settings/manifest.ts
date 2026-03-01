import { GearIcon } from '../../components/icons';
import { SettingsView } from '../../components/settings/settings_view';
import type { ExtensionManifest } from '../../registry/types';

export const settingsExtension: ExtensionManifest = {
  id: 'settings',
  name: 'Settings',
  icon: GearIcon(),
  description: 'Configure Raycast preferences and manage extensions.',
  author: 'Raycast',
  commands: [
    {
      name: 'settings',
      title: 'Raycast Settings',
      subtitle: 'Preferences',
      icon: GearIcon(),
      keywords: [
        'settings',
        'preferences',
        'config',
        'configuration',
      ],
      aliases: ['preferences'],
      mode: 'view',
      component: SettingsView,
      fullView: true,
      section: 'Commands',
      accessories: [
        { text: '⌘,' },
        { text: 'Raycast' },
      ],
    },
  ],
};
