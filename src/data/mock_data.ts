import {
  CalculatorIcon,
  ChatIcon,
  ClipboardIcon,
  CpuIcon,
  EmojiIcon,
  FigmaIcon,
  PaletteIcon,
  SafariIcon,
  SlackIcon,
  SnippetsIcon,
  TerminalIcon,
  VscodeIcon,
  WindowIcon,
} from '../components/icons/icons';
import type { ColorItemData, SectionData } from '../types';

export const MOCK_SECTIONS: SectionData[] = [
  {
    title: 'Suggestions',
    items: [
      {
        id: 'clipboard-history',
        title: 'Clipboard History',
        subtitle: 'Search Clipboard History',
        icon: ClipboardIcon(),
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
      {
        id: 'snippets',
        title: 'Search Snippets',
        subtitle: 'Search Snippets',
        icon: SnippetsIcon(),
        accessories: [{ text: 'Raycast' }],
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
      {
        id: 'emoji',
        title: 'Search Emoji & Symbols',
        subtitle: 'Search Emoji',
        icon: EmojiIcon(),
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
  },
  {
    title: 'Commands',
    items: [
      {
        id: 'window-management',
        title: 'Window Management',
        subtitle: 'Organize Windows',
        icon: WindowIcon(),
        accessories: [
          {
            tag: {
              text: 'Layout',
              color: 'purple',
            },
          },
          { text: 'Raycast' },
        ],
        detail: {
          markdown: `# Window Management

Organize and resize windows efficiently with keyboard shortcuts.

## Available Layouts
- **Left Half** / **Right Half**
- **Top Half** / **Bottom Half**
- **Maximize**
- **Center**
- **Reasonable Size**`,
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
      {
        id: 'calculator',
        title: 'Calculator',
        subtitle: 'Quick Calculations',
        icon: CalculatorIcon(),
        accessories: [{ text: 'Raycast' }],
        detail: {
          markdown: `# Calculator

Perform quick calculations right from the command bar. Supports basic arithmetic, percentages, and unit conversions.`,
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
      {
        id: 'define-word',
        title: 'Define Word',
        subtitle: 'Dictionary',
        icon: ChatIcon(),
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
      {
        id: 'system-monitor',
        title: 'System Monitor',
        subtitle: 'CPU, Memory, Disk',
        icon: CpuIcon(),
        accessories: [
          {
            tag: {
              text: 'System',
              color: 'orange',
            },
          },
          { text: 'Raycast' },
        ],
        detail: {
          markdown: `# System Monitor

Monitor your system resources in real-time. Check CPU usage, memory, disk space, and network activity.`,
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
      {
        id: 'color-picker',
        title: 'Color Picker',
        subtitle: 'Pick Colors',
        icon: PaletteIcon(),
        accessories: [{ text: 'Raycast' }],
      },
    ],
  },
  {
    title: 'Applications',
    items: [
      {
        id: 'app-safari',
        title: 'Safari',
        subtitle: 'Application',
        icon: SafariIcon(),
        accessories: [{ text: 'App' }],
        detail: {
          markdown: `# Safari

Apple's web browser for macOS. Fast, energy-efficient, and privacy-focused.`,
          metadata: [
            {
              type: 'label',
              title: 'Kind',
              text: 'Application',
            },
            {
              type: 'link',
              title: 'Website',
              text: 'apple.com/safari',
              target: 'https://www.apple.com/safari/',
            },
          ],
        },
      },
      {
        id: 'app-vscode',
        title: 'Visual Studio Code',
        subtitle: 'Application',
        icon: VscodeIcon(),
        accessories: [{ text: 'App' }],
        detail: {
          markdown: `# Visual Studio Code

Lightweight but powerful source code editor by Microsoft. Supports hundreds of languages and extensions.`,
          metadata: [
            {
              type: 'label',
              title: 'Kind',
              text: 'Application',
            },
            {
              type: 'link',
              title: 'Website',
              text: 'code.visualstudio.com',
              target: 'https://code.visualstudio.com',
            },
          ],
        },
      },
      {
        id: 'app-terminal',
        title: 'Terminal',
        subtitle: 'Application',
        icon: TerminalIcon(),
        accessories: [{ text: 'App' }],
        detail: {
          markdown: `# Terminal

The built-in terminal emulator for macOS. Provides command-line access to the operating system.`,
          metadata: [
            {
              type: 'label',
              title: 'Kind',
              text: 'Application',
            },
            {
              type: 'label',
              title: 'Version',
              text: '2.14',
            },
          ],
        },
      },
      {
        id: 'app-figma',
        title: 'Figma',
        subtitle: 'Application',
        icon: FigmaIcon(),
        accessories: [{ text: 'App' }],
        detail: {
          markdown: `# Figma

Collaborative design tool for building meaningful products. Design, prototype, and gather feedback.`,
          metadata: [
            {
              type: 'label',
              title: 'Kind',
              text: 'Application',
            },
            {
              type: 'link',
              title: 'Website',
              text: 'figma.com',
              target: 'https://www.figma.com',
            },
          ],
        },
      },
      {
        id: 'app-slack',
        title: 'Slack',
        subtitle: 'Application',
        icon: SlackIcon(),
        accessories: [{ text: 'App' }],
        detail: {
          markdown: `# Slack

Business communication platform for teams. Channels, direct messages, and integrations.`,
          metadata: [
            {
              type: 'label',
              title: 'Kind',
              text: 'Application',
            },
            {
              type: 'link',
              title: 'Website',
              text: 'slack.com',
              target: 'https://slack.com',
            },
          ],
        },
      },
    ],
  },
];

export const MOCK_COLORS: ColorItemData[] = [
  {
    id: 'color-red',
    title: 'Red',
    subtitle: '#FF3B30',
    color: '#FF3B30',
  },
  {
    id: 'color-orange',
    title: 'Orange',
    subtitle: '#FF9500',
    color: '#FF9500',
  },
  {
    id: 'color-yellow',
    title: 'Yellow',
    subtitle: '#FFCC00',
    color: '#FFCC00',
  },
  {
    id: 'color-green',
    title: 'Green',
    subtitle: '#34C759',
    color: '#34C759',
  },
  {
    id: 'color-teal',
    title: 'Teal',
    subtitle: '#5AC8FA',
    color: '#5AC8FA',
  },
  {
    id: 'color-blue',
    title: 'Blue',
    subtitle: '#007AFF',
    color: '#007AFF',
  },
  {
    id: 'color-indigo',
    title: 'Indigo',
    subtitle: '#5856D6',
    color: '#5856D6',
  },
  {
    id: 'color-purple',
    title: 'Purple',
    subtitle: '#AF52DE',
    color: '#AF52DE',
  },
  {
    id: 'color-pink',
    title: 'Pink',
    subtitle: '#FF2D55',
    color: '#FF2D55',
  },
  {
    id: 'color-brown',
    title: 'Brown',
    subtitle: '#A2845E',
    color: '#A2845E',
  },
  {
    id: 'color-gray',
    title: 'Gray',
    subtitle: '#8E8E93',
    color: '#8E8E93',
  },
  {
    id: 'color-white',
    title: 'White',
    subtitle: '#FFFFFF',
    color: '#FFFFFF',
  },
];
