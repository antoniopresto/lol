import { ChatIcon } from '../../components/icons';
import type { ExtensionManifest } from '../../registry/types';

export const dictionaryExtension: ExtensionManifest = {
  id: 'dictionary',
  name: 'Dictionary',
  icon: ChatIcon(),
  description:
    'Look up word definitions, synonyms, and usage examples using the built-in dictionary.',
  author: 'Raycast',
  commands: [
    {
      name: 'define-word',
      title: 'Define Word',
      subtitle: 'Dictionary',
      icon: ChatIcon(),
      keywords: [
        'define',
        'dictionary',
        'word',
        'meaning',
      ],
      mode: 'no-view',
      section: 'Commands',
      accessories: [{ text: 'Raycast' }],
      detail: {
        markdown: `# Define Word

Look up word definitions, synonyms, and usage examples using the built-in dictionary.`,
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
