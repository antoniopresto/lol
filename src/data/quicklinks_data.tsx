import type { ReactNode } from 'react';
import type { TagColor } from '../constants/tag_colors';

export type QuicklinkType = 'url' | 'file' | 'deeplink';

export interface QuicklinkEntry {
  id: string;
  name: string;
  link: string;
  type: QuicklinkType;
  icon?: ReactNode;
  application?: string;
  tags?: {
    text: string;
    color?: TagColor;
  }[];
  createdAt: Date;
}

function WebIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="1" width="18" height="18" rx="4" fill="#007AFF" />
      <circle
        cx="10"
        cy="10"
        r="5"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        fill="none"
      />
      <ellipse
        cx="10"
        cy="10"
        rx="2.2"
        ry="5"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        fill="none"
      />
      <line x1="5" y1="10" x2="15" y2="10" stroke="#FFFFFF" strokeWidth="1.2" />
    </svg>
  );
}

function FilePathIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="1" width="18" height="18" rx="4" fill="#FF9500" />
      <path
        d="M5 8a2 2 0 012-2h2.5l1.5 1.5H15a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5H7A2 2 0 015 12.5V8z"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function DeeplinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="1" width="18" height="18" rx="4" fill="#BF5AF2" />
      <path
        d="M8.5 11.5l3-3"
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M11 9l1.5-1.5a1.75 1.75 0 012.5 2.5L13.5 11.5"
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9 11l-1.5 1.5a1.75 1.75 0 002.5 2.5L11.5 13.5"
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function getQuicklinkIcon(type: QuicklinkType): ReactNode {
  switch (type) {
    case 'url':
      return <WebIcon />;
    case 'file':
      return <FilePathIcon />;
    case 'deeplink':
      return <DeeplinkIcon />;
  }
}

export function QuicklinksCommandIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <defs>
        <linearGradient id="quicklinks-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5AC8FA" />
          <stop offset="100%" stopColor="#007AFF" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="18"
        height="18"
        rx="4"
        fill="url(#quicklinks-bg)"
      />
      <path
        d="M8.5 11.5l3-3"
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M11 9l1.5-1.5a1.75 1.75 0 012.5 2.5L13.5 11.5"
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9 11l-1.5 1.5a1.75 1.75 0 002.5 2.5L11.5 13.5"
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const QUICKLINK_TYPE_LABELS: Record<QuicklinkType, string> = {
  url: 'URL',
  file: 'File Path',
  deeplink: 'Deep Link',
};

export { QUICKLINK_TYPE_LABELS };

const now = Date.now();

export const MOCK_QUICKLINKS: QuicklinkEntry[] = [
  {
    id: 'ql-1',
    name: 'Google Search',
    link: 'https://google.com/search?q={query}',
    type: 'url',
    application: 'Safari',
    tags: [
      {
        text: 'Search',
        color: 'blue',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 30),
  },
  {
    id: 'ql-2',
    name: 'GitHub',
    link: 'https://github.com',
    type: 'url',
    tags: [
      {
        text: 'Dev',
        color: 'purple',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 25),
  },
  {
    id: 'ql-3',
    name: 'YouTube',
    link: 'https://youtube.com',
    type: 'url',
    application: 'Safari',
    tags: [
      {
        text: 'Media',
        color: 'red',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 20),
  },
  {
    id: 'ql-4',
    name: 'Downloads Folder',
    link: '~/Downloads',
    type: 'file',
    tags: [
      {
        text: 'Folder',
        color: 'orange',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 15),
  },
  {
    id: 'ql-5',
    name: 'Projects Folder',
    link: '~/Projects',
    type: 'file',
    tags: [
      {
        text: 'Folder',
        color: 'orange',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 14),
  },
  {
    id: 'ql-6',
    name: 'Figma Dashboard',
    link: 'https://figma.com/files',
    type: 'url',
    application: 'Figma',
    tags: [
      {
        text: 'Design',
        color: 'green',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 12),
  },
  {
    id: 'ql-7',
    name: 'Slack Workspace',
    link: 'slack://open',
    type: 'deeplink',
    application: 'Slack',
    tags: [
      {
        text: 'Communication',
        color: 'blue',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 10),
  },
  {
    id: 'ql-8',
    name: 'Stack Overflow',
    link: 'https://stackoverflow.com/search?q={query}',
    type: 'url',
    tags: [
      {
        text: 'Dev',
        color: 'purple',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 8),
  },
  {
    id: 'ql-9',
    name: 'VS Code Settings',
    link: 'vscode://settings',
    type: 'deeplink',
    application: 'VS Code',
    tags: [
      {
        text: 'Dev',
        color: 'purple',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 6),
  },
  {
    id: 'ql-10',
    name: 'Desktop Folder',
    link: '~/Desktop',
    type: 'file',
    tags: [
      {
        text: 'Folder',
        color: 'orange',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 3),
  },
];
