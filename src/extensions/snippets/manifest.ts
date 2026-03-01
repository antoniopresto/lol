import { SnippetsIcon } from '../../components/icons';
import { SnippetManagerView } from '../../components/snippet_manager/snippet_manager_view';
import type { ExtensionManifest } from '../../registry/types';

export const snippetsExtension: ExtensionManifest = {
  id: 'snippets',
  name: 'Snippets',
  icon: SnippetsIcon(),
  description:
    'Quickly find and insert your saved text snippets. Create shortcuts for frequently typed text.',
  author: 'Raycast',
  commands: [
    {
      name: 'snippets',
      title: 'Search Snippets',
      subtitle: 'Search Snippets',
      icon: SnippetsIcon(),
      keywords: [
        'snippet',
        'text',
        'expand',
        'template',
      ],
      mode: 'view',
      component: SnippetManagerView,
      fullView: true,
      section: 'Suggestions',
      accessories: [
        { date: new Date(Date.now() - 1000 * 60 * 60 * 3) },
        { text: 'Raycast' },
      ],
      detail: {
        markdown: `# Search Snippets

Quickly find and insert your saved text snippets. Create shortcuts for frequently typed text.

## Usage
1. Create a snippet with a keyword
2. Type the keyword anywhere
3. The snippet auto-expands`,
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
        ],
      },
    },
  ],
};
