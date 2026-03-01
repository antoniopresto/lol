import { FloatingNotesView } from '../../components/floating_notes/floating_notes_view';
import { NotesIcon } from '../../components/icons';
import type { ExtensionManifest } from '../../registry/types';

export const floatingNotesExtension: ExtensionManifest = {
  id: 'floating-notes',
  name: 'Floating Notes',
  icon: NotesIcon(),
  description:
    'Create and manage quick notes. Markdown-enabled editor with auto-save.',
  author: 'Raycast',
  commands: [
    {
      name: 'floating-notes',
      title: 'Floating Notes',
      subtitle: 'Floating Notes',
      icon: NotesIcon(),
      keywords: [
        'note',
        'notes',
        'floating',
        'write',
        'markdown',
        'text',
        'memo',
      ],
      mode: 'view',
      component: FloatingNotesView,
      fullView: true,
      section: 'Suggestions',
      accessories: [{ text: 'Raycast' }],
      detail: {
        markdown: `# Floating Notes

Create and manage quick notes with a markdown-enabled editor.

## Features
- Auto-save with 500ms debounce
- Markdown content support
- Full-text search across notes
- Recent and older sections`,
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
