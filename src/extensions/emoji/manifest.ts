import { EmojiPickerView } from '../../components/emoji_picker/emoji_picker_view';
import { EmojiIcon } from '../../components/icons';
import type { ExtensionManifest } from '../../registry/types';

export const emojiExtension: ExtensionManifest = {
  id: 'emoji',
  name: 'Emoji & Symbols',
  icon: EmojiIcon(),
  description:
    'Find and copy emoji and special characters instantly. Supports skin tone modifiers and recent picks.',
  author: 'Raycast',
  commands: [
    {
      name: 'emoji',
      title: 'Search Emoji & Symbols',
      subtitle: 'Search Emoji',
      icon: EmojiIcon(),
      keywords: [
        'emoji',
        'symbol',
        'smiley',
        'emoticon',
      ],
      mode: 'view',
      component: EmojiPickerView,
      fullView: true,
      section: 'Suggestions',
      accessories: [{ text: 'Raycast' }],
      detail: {
        markdown: `# Search Emoji & Symbols

Find and copy emoji and special characters instantly. Supports skin tone modifiers and recent picks.`,
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
