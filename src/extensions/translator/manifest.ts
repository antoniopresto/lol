import { TranslateIcon } from '../../components/icons';
import { TranslatorView } from '../../components/translator/translator_view';
import type { ExtensionManifest } from '../../registry/types';

export const translatorExtension: ExtensionManifest = {
  id: 'translator',
  name: 'Translator',
  icon: TranslateIcon(),
  description: 'Translate text between 25+ languages with instant results.',
  author: 'Raycast',
  commands: [
    {
      name: 'translator',
      title: 'Translate',
      subtitle: 'Translator',
      icon: TranslateIcon(),
      keywords: [
        'translate',
        'translator',
        'language',
        'languages',
        'convert',
        'text',
        'multilingual',
        'spanish',
        'french',
        'german',
      ],
      mode: 'view',
      component: TranslatorView,
      fullView: true,
      section: 'Suggestions',
      accessories: [{ text: 'Raycast' }],
      detail: {
        markdown: `# Translator

Translate text between multiple languages instantly.

## Features
- 25+ language support
- Auto-detect source language
- Swap language direction
- Translation history
- Copy translations`,
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
