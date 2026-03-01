import {
  FigmaIcon,
  SafariIcon,
  SlackIcon,
  TerminalIcon,
  VscodeIcon,
} from '../../components/icons';
import type { ExtensionManifest } from '../../registry/types';

export const applicationsExtension: ExtensionManifest = {
  id: 'applications',
  name: 'Applications',
  icon: SafariIcon(),
  description: 'Launch and switch between applications.',
  author: 'Raycast',
  commands: [
    {
      name: 'app-safari',
      title: 'Safari',
      subtitle: 'Application',
      icon: SafariIcon(),
      keywords: [
        'browser',
        'web',
        'internet',
      ],
      mode: 'no-view',
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
    },
    {
      name: 'app-vscode',
      title: 'Visual Studio Code',
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
      mode: 'no-view',
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
    },
    {
      name: 'app-terminal',
      title: 'Terminal',
      subtitle: 'Application',
      icon: TerminalIcon(),
      keywords: [
        'terminal',
        'shell',
        'command',
        'console',
      ],
      mode: 'no-view',
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
    },
    {
      name: 'app-figma',
      title: 'Figma',
      subtitle: 'Application',
      icon: FigmaIcon(),
      keywords: [
        'design',
        'prototype',
        'ui',
        'ux',
      ],
      mode: 'no-view',
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
    },
    {
      name: 'app-slack',
      title: 'Slack',
      subtitle: 'Application',
      icon: SlackIcon(),
      keywords: [
        'chat',
        'messaging',
        'communication',
        'team',
      ],
      mode: 'no-view',
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
    },
  ],
};
