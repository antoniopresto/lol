import type { ReactNode } from 'react';

export type LayoutCategory = 'halves' | 'thirds' | 'quarters' | 'other';

export interface WindowLayout {
  id: string;
  name: string;
  category: LayoutCategory;
  shortcutKeys: string[];
  region: LayoutRegion;
}

export interface LayoutRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

function LayoutDiagram({ region }: { region: LayoutRegion }) {
  const pad = 2;
  const w = 18;
  const h = 14;
  const rx = region.x * w + pad;
  const ry = region.y * h + pad;
  const rw = region.width * w;
  const rh = region.height * h;

  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
      <rect
        x={pad}
        y={pad}
        width={w}
        height={h}
        rx="2"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
      />
      <rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        rx="1.5"
        fill="var(--color-accent)"
        opacity="0.85"
      />
    </svg>
  );
}

export function getLayoutIcon(layout: WindowLayout): ReactNode {
  return <LayoutDiagram region={layout.region} />;
}

export function WindowManagementCommandIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <defs>
        <linearGradient id="winmgmt-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64D2FF" />
          <stop offset="100%" stopColor="#0A84FF" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="18" height="18" rx="4" fill="url(#winmgmt-bg)" />
      <rect
        x="4"
        y="5"
        width="5"
        height="10"
        rx="1"
        fill="#FFFFFF"
        opacity="0.9"
      />
      <rect
        x="11"
        y="5"
        width="5"
        height="10"
        rx="1"
        fill="#FFFFFF"
        opacity="0.5"
      />
    </svg>
  );
}

const CATEGORY_LABELS: Record<LayoutCategory, string> = {
  halves: 'Halves',
  thirds: 'Thirds',
  quarters: 'Quarters',
  other: 'Other',
};

export { CATEGORY_LABELS };

export const WINDOW_LAYOUTS: WindowLayout[] = [
  {
    id: 'left-half',
    name: 'Left Half',
    category: 'halves',
    shortcutKeys: [
      '⌃',
      '⌥',
      '←',
    ],
    region: {
      x: 0,
      y: 0,
      width: 0.5,
      height: 1,
    },
  },
  {
    id: 'right-half',
    name: 'Right Half',
    category: 'halves',
    shortcutKeys: [
      '⌃',
      '⌥',
      '→',
    ],
    region: {
      x: 0.5,
      y: 0,
      width: 0.5,
      height: 1,
    },
  },
  {
    id: 'top-half',
    name: 'Top Half',
    category: 'halves',
    shortcutKeys: [
      '⌃',
      '⌥',
      '↑',
    ],
    region: {
      x: 0,
      y: 0,
      width: 1,
      height: 0.5,
    },
  },
  {
    id: 'bottom-half',
    name: 'Bottom Half',
    category: 'halves',
    shortcutKeys: [
      '⌃',
      '⌥',
      '↓',
    ],
    region: {
      x: 0,
      y: 0.5,
      width: 1,
      height: 0.5,
    },
  },
  {
    id: 'first-third',
    name: 'First Third',
    category: 'thirds',
    shortcutKeys: [
      '⌃',
      '⌥',
      'D',
    ],
    region: {
      x: 0,
      y: 0,
      width: 1 / 3,
      height: 1,
    },
  },
  {
    id: 'middle-third',
    name: 'Middle Third',
    category: 'thirds',
    shortcutKeys: [
      '⌃',
      '⌥',
      'F',
    ],
    region: {
      x: 1 / 3,
      y: 0,
      width: 1 / 3,
      height: 1,
    },
  },
  {
    id: 'last-third',
    name: 'Last Third',
    category: 'thirds',
    shortcutKeys: [
      '⌃',
      '⌥',
      'G',
    ],
    region: {
      x: 2 / 3,
      y: 0,
      width: 1 / 3,
      height: 1,
    },
  },
  {
    id: 'first-two-thirds',
    name: 'First Two Thirds',
    category: 'thirds',
    shortcutKeys: [
      '⌃',
      '⌥',
      'E',
    ],
    region: {
      x: 0,
      y: 0,
      width: 2 / 3,
      height: 1,
    },
  },
  {
    id: 'last-two-thirds',
    name: 'Last Two Thirds',
    category: 'thirds',
    shortcutKeys: [
      '⌃',
      '⌥',
      'T',
    ],
    region: {
      x: 1 / 3,
      y: 0,
      width: 2 / 3,
      height: 1,
    },
  },
  {
    id: 'top-left-quarter',
    name: 'Top Left Quarter',
    category: 'quarters',
    shortcutKeys: [
      '⌃',
      '⌥',
      'U',
    ],
    region: {
      x: 0,
      y: 0,
      width: 0.5,
      height: 0.5,
    },
  },
  {
    id: 'top-right-quarter',
    name: 'Top Right Quarter',
    category: 'quarters',
    shortcutKeys: [
      '⌃',
      '⌥',
      'I',
    ],
    region: {
      x: 0.5,
      y: 0,
      width: 0.5,
      height: 0.5,
    },
  },
  {
    id: 'bottom-left-quarter',
    name: 'Bottom Left Quarter',
    category: 'quarters',
    shortcutKeys: [
      '⌃',
      '⌥',
      'J',
    ],
    region: {
      x: 0,
      y: 0.5,
      width: 0.5,
      height: 0.5,
    },
  },
  {
    id: 'bottom-right-quarter',
    name: 'Bottom Right Quarter',
    category: 'quarters',
    shortcutKeys: [
      '⌃',
      '⌥',
      'K',
    ],
    region: {
      x: 0.5,
      y: 0.5,
      width: 0.5,
      height: 0.5,
    },
  },
  {
    id: 'maximize',
    name: 'Maximize',
    category: 'other',
    shortcutKeys: [
      '⌃',
      '⌥',
      '↵',
    ],
    region: {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    },
  },
  {
    id: 'center',
    name: 'Center',
    category: 'other',
    shortcutKeys: [
      '⌃',
      '⌥',
      'C',
    ],
    region: {
      x: 0.15,
      y: 0.1,
      width: 0.7,
      height: 0.8,
    },
  },
  {
    id: 'reasonable-size',
    name: 'Reasonable Size',
    category: 'other',
    shortcutKeys: [
      '⌃',
      '⌥',
      'R',
    ],
    region: {
      x: 0.1,
      y: 0.05,
      width: 0.8,
      height: 0.9,
    },
  },
];
