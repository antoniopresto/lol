import type { ReactNode } from 'react';

export type FileType =
  | 'folder'
  | 'document'
  | 'code'
  | 'image'
  | 'pdf'
  | 'archive'
  | 'spreadsheet'
  | 'presentation';

export interface FileEntry {
  id: string;
  name: string;
  path: string;
  fileType: FileType;
  size: number;
  modifiedAt: Date;
}

function FileCodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" fill="#5856D6" />
      <polyline
        points="7,8 5,10 7,12"
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <polyline
        points="13,8 15,10 13,12"
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="11"
        y1="7"
        x2="9"
        y2="13"
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FileImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" fill="#30D158" />
      <circle cx="8" cy="8" r="1.5" fill="#FFFFFF" />
      <path
        d="M3 14l4-4 2.5 2.5L13 9l4 5v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1z"
        fill="rgba(255,255,255,0.4)"
      />
    </svg>
  );
}

function FilePdfIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" fill="#FF3B30" />
      <text
        x="10"
        y="12.5"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="6"
        fontWeight="700"
        fontFamily="Inter, system-ui, sans-serif"
      >
        PDF
      </text>
    </svg>
  );
}

function FileArchiveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" fill="#8E8E93" />
      <rect
        x="9"
        y="4"
        width="2"
        height="2"
        rx="0.5"
        fill="rgba(255,255,255,0.6)"
      />
      <rect
        x="9"
        y="7"
        width="2"
        height="2"
        rx="0.5"
        fill="rgba(255,255,255,0.6)"
      />
      <rect
        x="9"
        y="10"
        width="2"
        height="2"
        rx="0.5"
        fill="rgba(255,255,255,0.6)"
      />
      <rect
        x="8"
        y="13"
        width="4"
        height="3"
        rx="1"
        stroke="#FFFFFF"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

function FileSpreadsheetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" fill="#34C759" />
      <line
        x1="3"
        y1="7"
        x2="17"
        y2="7"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
      <line
        x1="3"
        y1="11"
        x2="17"
        y2="11"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
      <line
        x1="3"
        y1="15"
        x2="17"
        y2="15"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
      <line
        x1="8"
        y1="2"
        x2="8"
        y2="18"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
    </svg>
  );
}

function FilePresentationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" fill="#FF9500" />
      <rect
        x="5.5"
        y="5"
        width="9"
        height="6"
        rx="1"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        fill="none"
      />
      <line
        x1="10"
        y1="11"
        x2="10"
        y2="14"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="7.5"
        y1="14"
        x2="12.5"
        y2="14"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FileFolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
        fill="#339AF0"
      />
      <path
        d="M2 8a0 0 0 000 0h16v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8z"
        fill="#1C7ED6"
      />
    </svg>
  );
}

function FileDocumentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" fill="#007AFF" />
      <line
        x1="6"
        y1="7"
        x2="14"
        y2="7"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="6"
        y1="10"
        x2="14"
        y2="10"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="6"
        y1="13"
        x2="11"
        y2="13"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function getFileIcon(fileType: FileType): ReactNode {
  switch (fileType) {
    case 'folder':
      return <FileFolderIcon />;
    case 'code':
      return <FileCodeIcon />;
    case 'image':
      return <FileImageIcon />;
    case 'pdf':
      return <FilePdfIcon />;
    case 'archive':
      return <FileArchiveIcon />;
    case 'spreadsheet':
      return <FileSpreadsheetIcon />;
    case 'presentation':
      return <FilePresentationIcon />;
    case 'document':
      return <FileDocumentIcon />;
  }
}

export function FileSearchCommandIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <defs>
        <linearGradient id="filesearch-bg" x1="0" y1="0" x2="0" y2="1">
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
        fill="url(#filesearch-bg)"
      />
      <path
        d="M6 4.5h3.5L12 7v6.5a1 1 0 01-1 1H6a1 1 0 01-1-1V5.5a1 1 0 011-1z"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9.5 4.5V7H12"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle
        cx="12.5"
        cy="12.5"
        r="3"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        fill="none"
      />
      <line
        x1="14.6"
        y1="14.6"
        x2="16"
        y2="16"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const now = Date.now();

export const MOCK_FILE_ENTRIES: FileEntry[] = [
  {
    id: 'file-1',
    name: 'Documents',
    path: '~/Documents',
    fileType: 'folder',
    size: 0,
    modifiedAt: new Date(now - 1000 * 60 * 30),
  },
  {
    id: 'file-2',
    name: 'Downloads',
    path: '~/Downloads',
    fileType: 'folder',
    size: 0,
    modifiedAt: new Date(now - 1000 * 60 * 15),
  },
  {
    id: 'file-3',
    name: 'Desktop',
    path: '~/Desktop',
    fileType: 'folder',
    size: 0,
    modifiedAt: new Date(now - 1000 * 60 * 60),
  },
  {
    id: 'file-4',
    name: 'Projects',
    path: '~/Projects',
    fileType: 'folder',
    size: 0,
    modifiedAt: new Date(now - 1000 * 60 * 60 * 2),
  },
  {
    id: 'file-5',
    name: 'README.md',
    path: '~/Projects/raycast-clone/README.md',
    fileType: 'document',
    size: 4_200,
    modifiedAt: new Date(now - 1000 * 60 * 10),
  },
  {
    id: 'file-6',
    name: 'App.tsx',
    path: '~/Projects/raycast-clone/src/App.tsx',
    fileType: 'code',
    size: 28_400,
    modifiedAt: new Date(now - 1000 * 60 * 5),
  },
  {
    id: 'file-7',
    name: 'package.json',
    path: '~/Projects/raycast-clone/package.json',
    fileType: 'code',
    size: 1_850,
    modifiedAt: new Date(now - 1000 * 60 * 60 * 4),
  },
  {
    id: 'file-8',
    name: 'design-system.fig',
    path: '~/Documents/design-system.fig',
    fileType: 'document',
    size: 15_600_000,
    modifiedAt: new Date(now - 1000 * 60 * 60 * 24),
  },
  {
    id: 'file-9',
    name: 'screenshot-2026-03-01.png',
    path: '~/Desktop/screenshot-2026-03-01.png',
    fileType: 'image',
    size: 2_340_000,
    modifiedAt: new Date(now - 1000 * 60 * 45),
  },
  {
    id: 'file-10',
    name: 'invoice-march-2026.pdf',
    path: '~/Documents/Invoices/invoice-march-2026.pdf',
    fileType: 'pdf',
    size: 485_000,
    modifiedAt: new Date(now - 1000 * 60 * 60 * 8),
  },
  {
    id: 'file-11',
    name: 'project-backup.zip',
    path: '~/Downloads/project-backup.zip',
    fileType: 'archive',
    size: 52_400_000,
    modifiedAt: new Date(now - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: 'file-12',
    name: 'budget-2026.xlsx',
    path: '~/Documents/Finance/budget-2026.xlsx',
    fileType: 'spreadsheet',
    size: 345_000,
    modifiedAt: new Date(now - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: 'file-13',
    name: 'quarterly-review.pptx',
    path: '~/Documents/Presentations/quarterly-review.pptx',
    fileType: 'presentation',
    size: 8_900_000,
    modifiedAt: new Date(now - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: 'file-14',
    name: 'tsconfig.json',
    path: '~/Projects/raycast-clone/tsconfig.json',
    fileType: 'code',
    size: 620,
    modifiedAt: new Date(now - 1000 * 60 * 60 * 24 * 7),
  },
  {
    id: 'file-15',
    name: 'hero-banner.jpg',
    path: '~/Documents/Marketing/hero-banner.jpg',
    fileType: 'image',
    size: 4_700_000,
    modifiedAt: new Date(now - 1000 * 60 * 60 * 24 * 4),
  },
  {
    id: 'file-16',
    name: 'notes.md',
    path: '~/Documents/notes.md',
    fileType: 'document',
    size: 8_200,
    modifiedAt: new Date(now - 1000 * 60 * 120),
  },
];
