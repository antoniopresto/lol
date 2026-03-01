import type { ReactNode } from 'react';
import {
  FigmaIcon,
  SafariIcon,
  SlackIcon,
  TerminalIcon,
  VscodeIcon,
} from '../components/icons/icons';

export interface ClipboardEntry {
  id: string;
  content: string;
  contentType: 'text' | 'link' | 'color' | 'image';
  sourceApp: string;
  sourceIcon: ReactNode;
  copiedAt: Date;
  pinned: boolean;
}

const now = Date.now();

export const MOCK_CLIPBOARD_ENTRIES: ClipboardEntry[] = [
  {
    id: 'clip-1',
    content: 'npm install @raycast/api',
    contentType: 'text',
    sourceApp: 'Terminal',
    sourceIcon: TerminalIcon(),
    copiedAt: new Date(now - 1000 * 60 * 2),
    pinned: true,
  },
  {
    id: 'clip-2',
    content: 'const handleSubmit = useCallback(() => { ... })',
    contentType: 'text',
    sourceApp: 'VS Code',
    sourceIcon: VscodeIcon(),
    copiedAt: new Date(now - 1000 * 60 * 5),
    pinned: true,
  },
  {
    id: 'clip-3',
    content: 'https://docs.raycast.com/api-reference',
    contentType: 'link',
    sourceApp: 'Safari',
    sourceIcon: SafariIcon(),
    copiedAt: new Date(now - 1000 * 60 * 8),
    pinned: false,
  },
  {
    id: 'clip-4',
    content: '#007AFF',
    contentType: 'color',
    sourceApp: 'Figma',
    sourceIcon: FigmaIcon(),
    copiedAt: new Date(now - 1000 * 60 * 15),
    pinned: false,
  },
  {
    id: 'clip-5',
    content: 'Hey, can you review the PR when you get a chance?',
    contentType: 'text',
    sourceApp: 'Slack',
    sourceIcon: SlackIcon(),
    copiedAt: new Date(now - 1000 * 60 * 30),
    pinned: false,
  },
  {
    id: 'clip-6',
    content:
      'export interface ListItemData {\n  id: string;\n  title: string;\n  subtitle?: string;\n}',
    contentType: 'text',
    sourceApp: 'VS Code',
    sourceIcon: VscodeIcon(),
    copiedAt: new Date(now - 1000 * 60 * 45),
    pinned: false,
  },
  {
    id: 'clip-7',
    content: 'https://github.com/raycast/extensions/pull/1234',
    contentType: 'link',
    sourceApp: 'Safari',
    sourceIcon: SafariIcon(),
    copiedAt: new Date(now - 1000 * 60 * 60),
    pinned: false,
  },
  {
    id: 'clip-8',
    content: 'ssh user@192.168.1.100',
    contentType: 'text',
    sourceApp: 'Terminal',
    sourceIcon: TerminalIcon(),
    copiedAt: new Date(now - 1000 * 60 * 60 * 2),
    pinned: false,
  },
  {
    id: 'clip-9',
    content: '#FF453A',
    contentType: 'color',
    sourceApp: 'Figma',
    sourceIcon: FigmaIcon(),
    copiedAt: new Date(now - 1000 * 60 * 60 * 3),
    pinned: false,
  },
  {
    id: 'clip-10',
    content:
      'Great work on the design system updates! The new components look clean.',
    contentType: 'text',
    sourceApp: 'Slack',
    sourceIcon: SlackIcon(),
    copiedAt: new Date(now - 1000 * 60 * 60 * 5),
    pinned: false,
  },
  {
    id: 'clip-11',
    content: 'git rebase -i HEAD~3',
    contentType: 'text',
    sourceApp: 'Terminal',
    sourceIcon: TerminalIcon(),
    copiedAt: new Date(now - 1000 * 60 * 60 * 8),
    pinned: false,
  },
  {
    id: 'clip-12',
    content: 'https://www.figma.com/file/abc123/Design-System',
    contentType: 'link',
    sourceApp: 'Figma',
    sourceIcon: FigmaIcon(),
    copiedAt: new Date(now - 1000 * 60 * 60 * 24),
    pinned: false,
  },
  {
    id: 'clip-13',
    content: 'Screenshot 2026-03-01 at 10.30.15.png',
    contentType: 'image',
    sourceApp: 'Safari',
    sourceIcon: SafariIcon(),
    copiedAt: new Date(now - 1000 * 60 * 20),
    pinned: false,
  },
  {
    id: 'clip-14',
    content: 'app-icon-design-v3.png',
    contentType: 'image',
    sourceApp: 'Figma',
    sourceIcon: FigmaIcon(),
    copiedAt: new Date(now - 1000 * 60 * 60 * 4),
    pinned: false,
  },
];
