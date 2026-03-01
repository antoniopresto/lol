import { FileSearchView } from '../../components/file_search/file_search_view';
import { FileSearchCommandIcon } from '../../data/file_search_data';
import type { ExtensionManifest } from '../../registry/types';

export const fileSearchExtension: ExtensionManifest = {
  id: 'file-search',
  name: 'File Search',
  icon: FileSearchCommandIcon(),
  description:
    'Search and browse files on your system. Quickly find documents, code, images, and more.',
  author: 'Raycast',
  commands: [
    {
      name: 'file-search',
      title: 'File Search',
      subtitle: 'Search Files',
      icon: FileSearchCommandIcon(),
      keywords: [
        'file',
        'search',
        'find',
        'document',
        'folder',
      ],
      mode: 'view',
      component: FileSearchView,
      fullView: true,
      section: 'Suggestions',
      accessories: [{ text: 'Raycast' }],
      detail: {
        markdown: `# File Search

Search and browse files on your system. Quickly find documents, code, images, and more.

## Features
- Search by file name or path
- Filter by file type
- Open files directly
- Copy file paths`,
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
