import type { ReactNode } from 'react';

export interface ExtensionEntry {
  id: string;
  name: string;
  description: string;
  author: string;
  icon: () => ReactNode;
  enabled: boolean;
}

function ClipboardExtIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="4" fill="#6366f1" />
      <rect
        x="6"
        y="4"
        width="8"
        height="11"
        rx="1.5"
        stroke="white"
        strokeWidth="1.25"
      />
      <path
        d="M8 4.5H12"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SnippetExtIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="4" fill="#f59e0b" />
      <path
        d="M7 7L10 10L7 13"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 13H14"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WindowExtIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="4" fill="#8b5cf6" />
      <rect
        x="4"
        y="5"
        width="12"
        height="10"
        rx="1.5"
        stroke="white"
        strokeWidth="1.25"
      />
      <path d="M10 5V15" stroke="white" strokeWidth="1.25" />
    </svg>
  );
}

function CalcExtIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="4" fill="#10b981" />
      <path
        d="M6 10H14M10 6V14"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmojiExtIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="4" fill="#f97316" />
      <circle cx="10" cy="10" r="5.5" stroke="white" strokeWidth="1.25" />
      <circle cx="8" cy="9" r="0.75" fill="white" />
      <circle cx="12" cy="9" r="0.75" fill="white" />
      <path
        d="M7.5 12a2.5 2.5 0 0 0 5 0"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FileExtIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="4" fill="#3b82f6" />
      <path
        d="M6 4.5h5l3 3v8A1.5 1.5 0 0 1 12.5 17h-5A1.5 1.5 0 0 1 6 15.5v-11z"
        stroke="white"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function ColorExtIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="4" fill="#ec4899" />
      <circle cx="10" cy="10" r="5" stroke="white" strokeWidth="1.25" />
      <circle cx="10" cy="7" r="1.25" fill="white" />
      <circle cx="7.5" cy="11" r="1.25" fill="white" />
      <circle cx="12.5" cy="11" r="1.25" fill="white" />
    </svg>
  );
}

function DictionaryExtIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="4" fill="#14b8a6" />
      <rect
        x="5"
        y="4"
        width="10"
        height="12"
        rx="1.5"
        stroke="white"
        strokeWidth="1.25"
      />
      <path
        d="M8 8H12"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M8 11H11"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SystemExtIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="4" fill="#ef4444" />
      <rect
        x="4"
        y="5"
        width="12"
        height="9"
        rx="1.5"
        stroke="white"
        strokeWidth="1.25"
      />
      <path
        d="M7 17H13"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path d="M10 14V17" stroke="white" strokeWidth="1.25" />
    </svg>
  );
}

function GitHubExtIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="4" fill="#1f2937" />
      <path
        d="M10 4C6.686 4 4 6.686 4 10c0 2.65 1.72 4.9 4.1 5.69.3.06.41-.13.41-.29v-1.02c-1.67.36-2.02-.81-2.02-.81-.27-.69-.67-.87-.67-.87-.55-.37.04-.37.04-.37.6.04.92.62.92.62.54.92 1.41.65 1.76.5.05-.39.21-.65.38-.8-1.33-.15-2.73-.67-2.73-2.97 0-.66.23-1.19.62-1.61-.06-.15-.27-.76.06-1.59 0 0 .5-.16 1.65.62a5.7 5.7 0 0 1 3 0c1.15-.78 1.65-.62 1.65-.62.33.83.12 1.44.06 1.59.39.42.62.95.62 1.61 0 2.31-1.4 2.82-2.74 2.97.22.19.41.56.41 1.12v1.67c0 .16.11.35.41.29A6.003 6.003 0 0 0 16 10c0-3.314-2.686-6-6-6z"
        fill="white"
      />
    </svg>
  );
}

export const MOCK_EXTENSIONS: ExtensionEntry[] = [
  {
    id: 'ext-clipboard',
    name: 'Clipboard History',
    description: 'Search and manage clipboard entries',
    author: 'Raycast',
    icon: ClipboardExtIcon,
    enabled: true,
  },
  {
    id: 'ext-snippets',
    name: 'Snippets',
    description: 'Create and expand text snippets',
    author: 'Raycast',
    icon: SnippetExtIcon,
    enabled: true,
  },
  {
    id: 'ext-window',
    name: 'Window Management',
    description: 'Move and resize windows with shortcuts',
    author: 'Raycast',
    icon: WindowExtIcon,
    enabled: true,
  },
  {
    id: 'ext-calculator',
    name: 'Calculator',
    description: 'Quick math in the search bar',
    author: 'Raycast',
    icon: CalcExtIcon,
    enabled: true,
  },
  {
    id: 'ext-emoji',
    name: 'Emoji & Symbols',
    description: 'Search and copy emoji characters',
    author: 'Raycast',
    icon: EmojiExtIcon,
    enabled: true,
  },
  {
    id: 'ext-file-search',
    name: 'File Search',
    description: 'Search files across your system',
    author: 'Raycast',
    icon: FileExtIcon,
    enabled: true,
  },
  {
    id: 'ext-color-picker',
    name: 'Color Picker',
    description: 'Pick and organize colors',
    author: 'Raycast',
    icon: ColorExtIcon,
    enabled: false,
  },
  {
    id: 'ext-dictionary',
    name: 'Dictionary',
    description: 'Look up word definitions',
    author: 'Raycast',
    icon: DictionaryExtIcon,
    enabled: true,
  },
  {
    id: 'ext-system',
    name: 'System Monitor',
    description: 'Monitor CPU, memory, and disk usage',
    author: 'Raycast',
    icon: SystemExtIcon,
    enabled: false,
  },
  {
    id: 'ext-github',
    name: 'GitHub',
    description: 'Manage repositories, issues, and PRs',
    author: 'Community',
    icon: GitHubExtIcon,
    enabled: true,
  },
];
