import { QuicklinksView } from '../../components/quicklinks/quicklinks_view';
import { QuicklinksCommandIcon } from '../../data/quicklinks_data';
import type { ExtensionManifest } from '../../registry/types';

export const quicklinksExtension: ExtensionManifest = {
  id: 'quicklinks',
  name: 'Quicklinks',
  icon: QuicklinksCommandIcon(),
  description:
    'Open your saved quicklinks instantly. URLs, file paths, and deep links at your fingertips.',
  author: 'Raycast',
  commands: [
    {
      name: 'quicklinks',
      title: 'Search Quicklinks',
      subtitle: 'Search Quicklinks',
      icon: QuicklinksCommandIcon(),
      keywords: [
        'quicklink',
        'link',
        'bookmark',
        'url',
        'shortcut',
      ],
      mode: 'view',
      component: QuicklinksView,
      fullView: true,
      section: 'Suggestions',
      accessories: [
        {
          tag: {
            text: 'Productivity',
            color: 'blue',
          },
        },
        { text: 'Raycast' },
      ],
      detail: {
        markdown: `# Search Quicklinks

Open your saved quicklinks instantly. URLs, file paths, and deep links at your fingertips.

## Features
- Open URLs in browser
- Open file paths in Finder
- Launch deep links to apps
- Query placeholders for dynamic input`,
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
                text: 'Productivity',
                color: 'blue',
              },
              {
                text: 'Links',
                color: 'green',
              },
            ],
          },
        ],
      },
    },
  ],
};
