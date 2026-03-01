import { ClipboardHistoryView } from '../../components/clipboard_history/clipboard_history_view';
import { ClipboardIcon } from '../../components/icons';
import type { ExtensionManifest } from '../../registry/types';

export const clipboardExtension: ExtensionManifest = {
  id: 'clipboard-history',
  name: 'Clipboard History',
  icon: ClipboardIcon(),
  description:
    'View and manage your clipboard history. Search through previously copied items and paste them quickly.',
  author: 'Raycast',
  commands: [
    {
      name: 'clipboard-history',
      title: 'Clipboard History',
      subtitle: 'Search Clipboard History',
      icon: ClipboardIcon(),
      keywords: [
        'clipboard',
        'paste',
        'copy',
        'history',
      ],
      mode: 'view',
      component: ClipboardHistoryView,
      fullView: true,
      section: 'Suggestions',
      accessories: [
        {
          tag: {
            text: 'Productivity',
            color: 'blue',
          },
        },
        { date: new Date(Date.now() - 1000 * 60 * 30) },
        {
          text: 'Raycast',
          tooltip: 'Provided by Raycast',
        },
      ],
      detail: {
        markdown: `# Clipboard History

View and manage your clipboard history. Search through previously copied items and paste them quickly.

## Features
- Automatic clipboard monitoring
- Pin frequently used items
- Search by content type
- Clear history on demand`,
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
                text: 'Clipboard',
                color: 'green',
              },
            ],
          },
        ],
      },
    },
  ],
};
