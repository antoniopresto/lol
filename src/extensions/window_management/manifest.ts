import { WindowManagementView } from '../../components/window_management/window_management_view';
import { WindowManagementCommandIcon } from '../../data/window_layouts_data';
import type { ExtensionManifest } from '../../registry/types';

export const windowManagementExtension: ExtensionManifest = {
  id: 'window-management',
  name: 'Window Management',
  icon: WindowManagementCommandIcon(),
  description:
    'Organize and resize windows efficiently with keyboard shortcuts.',
  author: 'Raycast',
  commands: [
    {
      name: 'window-management',
      title: 'Window Management',
      subtitle: 'Organize Windows',
      icon: WindowManagementCommandIcon(),
      keywords: [
        'window',
        'resize',
        'layout',
        'organize',
        'tile',
      ],
      mode: 'view',
      component: WindowManagementView,
      fullView: true,
      section: 'Commands',
      accessories: [
        {
          tag: {
            text: 'Layout',
            color: 'purple',
          },
        },
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
        { text: 'Raycast' },
      ],
      detail: {
        markdown: `# Window Management

Organize and resize windows efficiently with keyboard shortcuts.

## Halves
- **Left Half** / **Right Half** / **Top Half** / **Bottom Half**

## Thirds
- **First Third** / **Middle Third** / **Last Third**
- **First Two Thirds** / **Last Two Thirds**

## Quarters
- **Top Left** / **Top Right** / **Bottom Left** / **Bottom Right**

## Other
- **Maximize** / **Center** / **Reasonable Size**`,
        metadata: [
          {
            type: 'label',
            title: 'Application',
            text: 'Raycast',
          },
          {
            type: 'label',
            title: 'Type',
            text: 'Command',
          },
          { type: 'separator' },
          {
            type: 'tag-list',
            title: 'Tags',
            tags: [
              {
                text: 'Windows',
                color: 'purple',
              },
              {
                text: 'Layout',
                color: 'orange',
              },
            ],
          },
        ],
      },
    },
  ],
};
