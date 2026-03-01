import { ClipboardHistoryView } from '../components/clipboard_history/clipboard_history_view';
import { ColorPickerView } from '../components/color_picker/color_picker_view';
import { EmojiPickerView } from '../components/emoji_picker/emoji_picker_view';
import { FileSearchView } from '../components/file_search/file_search_view';
import {
  CalculatorIcon,
  ChatIcon,
  ClipboardIcon,
  CpuIcon,
  EmojiIcon,
  FigmaIcon,
  GearIcon,
  PaletteIcon,
  SafariIcon,
  SlackIcon,
  SnippetsIcon,
  TerminalIcon,
  VscodeIcon,
  WindowIcon,
} from '../components/icons';
import { QuicklinksView } from '../components/quicklinks/quicklinks_view';
import { SettingsView } from '../components/settings/settings_view';
import { SnippetManagerView } from '../components/snippet_manager/snippet_manager_view';
import { FileSearchCommandIcon } from '../data/file_search_data';
import { QuicklinksCommandIcon } from '../data/quicklinks_data';
import { registerCommand } from './command_registry';

registerCommand({
  id: 'clipboard-history',
  name: 'Clipboard History',
  subtitle: 'Search Clipboard History',
  icon: ClipboardIcon(),
  keywords: [
    'clipboard',
    'paste',
    'copy',
    'history',
  ],
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
  component: ClipboardHistoryView,
  fullView: true,
});

registerCommand({
  id: 'snippets',
  name: 'Search Snippets',
  subtitle: 'Search Snippets',
  icon: SnippetsIcon(),
  keywords: [
    'snippet',
    'text',
    'expand',
    'template',
  ],
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
  component: SnippetManagerView,
  fullView: true,
});

registerCommand({
  id: 'file-search',
  name: 'File Search',
  subtitle: 'Search Files',
  icon: FileSearchCommandIcon(),
  keywords: [
    'file',
    'search',
    'find',
    'document',
    'folder',
  ],
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
  component: FileSearchView,
  fullView: true,
});

registerCommand({
  id: 'quicklinks',
  name: 'Search Quicklinks',
  subtitle: 'Search Quicklinks',
  icon: QuicklinksCommandIcon(),
  keywords: [
    'quicklink',
    'link',
    'bookmark',
    'url',
    'shortcut',
  ],
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
  component: QuicklinksView,
  fullView: true,
});

registerCommand({
  id: 'emoji',
  name: 'Search Emoji & Symbols',
  subtitle: 'Search Emoji',
  icon: EmojiIcon(),
  keywords: [
    'emoji',
    'symbol',
    'smiley',
    'emoticon',
  ],
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
  component: EmojiPickerView,
  fullView: true,
});

registerCommand({
  id: 'window-management',
  name: 'Window Management',
  subtitle: 'Organize Windows',
  icon: WindowIcon(),
  keywords: [
    'window',
    'resize',
    'layout',
    'organize',
    'tile',
  ],
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
});

registerCommand({
  id: 'calculator',
  name: 'Calculator',
  subtitle: 'Quick Calculations',
  icon: CalculatorIcon(),
  keywords: [
    'calculate',
    'math',
    'arithmetic',
  ],
  section: 'Commands',
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
});

registerCommand({
  id: 'define-word',
  name: 'Define Word',
  subtitle: 'Dictionary',
  icon: ChatIcon(),
  keywords: [
    'define',
    'dictionary',
    'word',
    'meaning',
  ],
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
});

registerCommand({
  id: 'system-monitor',
  name: 'System Monitor',
  subtitle: 'CPU, Memory, Disk',
  icon: CpuIcon(),
  keywords: [
    'system',
    'monitor',
    'cpu',
    'memory',
    'disk',
    'network',
  ],
  section: 'Commands',
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
});

registerCommand({
  id: 'color-picker',
  name: 'Color Picker',
  subtitle: 'Pick Colors',
  icon: PaletteIcon(),
  keywords: [
    'color',
    'picker',
    'palette',
    'hex',
    'rgb',
  ],
  section: 'Commands',
  accessories: [{ text: 'Raycast' }],
  component: ColorPickerView,
  fullView: true,
});

registerCommand({
  id: 'settings',
  name: 'Raycast Settings',
  subtitle: 'Preferences',
  icon: GearIcon(),
  keywords: [
    'settings',
    'preferences',
    'config',
    'configuration',
  ],
  aliases: ['preferences'],
  section: 'Commands',
  accessories: [
    { text: '⌘,' },
    { text: 'Raycast' },
  ],
  component: SettingsView,
  fullView: true,
});

registerCommand({
  id: 'app-safari',
  name: 'Safari',
  subtitle: 'Application',
  icon: SafariIcon(),
  keywords: [
    'browser',
    'web',
    'internet',
  ],
  section: 'Applications',
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
});

registerCommand({
  id: 'app-vscode',
  name: 'Visual Studio Code',
  subtitle: 'Application',
  icon: VscodeIcon(),
  keywords: [
    'code',
    'editor',
    'ide',
    'vscode',
  ],
  aliases: [
    'vscode',
    'code',
  ],
  section: 'Applications',
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
});

registerCommand({
  id: 'app-terminal',
  name: 'Terminal',
  subtitle: 'Application',
  icon: TerminalIcon(),
  keywords: [
    'terminal',
    'shell',
    'command',
    'console',
  ],
  section: 'Applications',
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
});

registerCommand({
  id: 'app-figma',
  name: 'Figma',
  subtitle: 'Application',
  icon: FigmaIcon(),
  keywords: [
    'design',
    'prototype',
    'ui',
    'ux',
  ],
  section: 'Applications',
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
});

registerCommand({
  id: 'app-slack',
  name: 'Slack',
  subtitle: 'Application',
  icon: SlackIcon(),
  keywords: [
    'chat',
    'messaging',
    'communication',
    'team',
  ],
  section: 'Applications',
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
});
