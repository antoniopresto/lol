interface IconProps {
  size?: number;
}

const defaults: Required<IconProps> = { size: 20 };

function svgProps(props: IconProps) {
  const s = props.size ?? defaults.size;
  return {
    width: s,
    height: s,
    viewBox: '0 0 20 20',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
  } as const;
}

const STROKE = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function ClipboardIcon(props: IconProps = {}) {
  return (
    <svg {...svgProps(props)}>
      <rect x="5" y="2" width="10" height="3" rx="1" {...STROKE} />
      <rect x="3" y="4" width="14" height="14" rx="2" {...STROKE} />
      <line x1="7" y1="10" x2="13" y2="10" {...STROKE} />
      <line x1="7" y1="13" x2="11" y2="13" {...STROKE} />
    </svg>
  );
}

export function SnippetsIcon(props: IconProps = {}) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3" y="3" width="14" height="14" rx="2" {...STROKE} />
      <polyline points="7,7 9,9 7,11" {...STROKE} />
      <line x1="11" y1="11" x2="13" y2="11" {...STROKE} />
    </svg>
  );
}

export function EmojiIcon(props: IconProps = {}) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="10" cy="10" r="7" {...STROKE} />
      <circle cx="7.5" cy="8.5" r="0.75" fill="currentColor" />
      <circle cx="12.5" cy="8.5" r="0.75" fill="currentColor" />
      <path d="M7 12a3.5 3.5 0 006 0" {...STROKE} />
    </svg>
  );
}

export function WindowIcon(props: IconProps = {}) {
  return (
    <svg {...svgProps(props)}>
      <rect x="2" y="3" width="16" height="14" rx="2" {...STROKE} />
      <line x1="2" y1="7" x2="18" y2="7" {...STROKE} />
      <circle cx="5" cy="5" r="0.75" fill="currentColor" />
      <circle cx="7.5" cy="5" r="0.75" fill="currentColor" />
      <circle cx="10" cy="5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function CalculatorIcon(props: IconProps = {}) {
  return (
    <svg {...svgProps(props)}>
      <rect x="4" y="2" width="12" height="16" rx="2" {...STROKE} />
      <rect x="6" y="4" width="8" height="4" rx="1" {...STROKE} />
      <circle cx="7.5" cy="11" r="0.75" fill="currentColor" />
      <circle cx="10" cy="11" r="0.75" fill="currentColor" />
      <circle cx="12.5" cy="11" r="0.75" fill="currentColor" />
      <circle cx="7.5" cy="14" r="0.75" fill="currentColor" />
      <circle cx="10" cy="14" r="0.75" fill="currentColor" />
      <circle cx="12.5" cy="14" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function CpuIcon(props: IconProps = {}) {
  return (
    <svg {...svgProps(props)}>
      <rect x="5" y="5" width="10" height="10" rx="1" {...STROKE} />
      <rect x="7" y="7" width="6" height="6" rx="0.5" {...STROKE} />
      <line x1="8" y1="3" x2="8" y2="5" {...STROKE} />
      <line x1="12" y1="3" x2="12" y2="5" {...STROKE} />
      <line x1="8" y1="15" x2="8" y2="17" {...STROKE} />
      <line x1="12" y1="15" x2="12" y2="17" {...STROKE} />
      <line x1="3" y1="8" x2="5" y2="8" {...STROKE} />
      <line x1="3" y1="12" x2="5" y2="12" {...STROKE} />
      <line x1="15" y1="8" x2="17" y2="8" {...STROKE} />
      <line x1="15" y1="12" x2="17" y2="12" {...STROKE} />
    </svg>
  );
}

export function SafariIcon(props: IconProps = {}) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="10" cy="10" r="7.5" {...STROKE} />
      <polygon points="8,5 15,8 12,15 5,12" {...STROKE} />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

export function CodeIcon(props: IconProps = {}) {
  return (
    <svg {...svgProps(props)}>
      <polyline points="6,6 2,10 6,14" {...STROKE} />
      <polyline points="14,6 18,10 14,14" {...STROKE} />
      <line x1="12" y1="4" x2="8" y2="16" {...STROKE} />
    </svg>
  );
}

export function TerminalIcon(props: IconProps = {}) {
  return (
    <svg {...svgProps(props)}>
      <rect x="2" y="3" width="16" height="14" rx="2" {...STROKE} />
      <polyline points="6,8 9,10.5 6,13" {...STROKE} />
      <line x1="11" y1="13" x2="14" y2="13" {...STROKE} />
    </svg>
  );
}

export function FigmaIcon(props: IconProps = {}) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="12" cy="10" r="2.5" {...STROKE} />
      <path d="M7.5 5a2.5 2.5 0 000 5h0a2.5 2.5 0 000-5z" {...STROKE} />
      <path d="M7.5 10a2.5 2.5 0 000 5h0a2.5 2.5 0 000-5z" {...STROKE} />
      <path
        d="M7.5 15a2.5 2.5 0 005 0v-2.5h-2.5a2.5 2.5 0 00-2.5 2.5z"
        {...STROKE}
      />
      <path d="M7.5 2.5h2.5a2.5 2.5 0 010 5H7.5a2.5 2.5 0 010-5z" {...STROKE} />
      <path d="M10 2.5h2.5a2.5 2.5 0 010 5H10V2.5z" {...STROKE} />
    </svg>
  );
}

export function ChatIcon(props: IconProps = {}) {
  return (
    <svg {...svgProps(props)}>
      <path
        d="M3 5a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H9l-3 3v-3H5a2 2 0 01-2-2V5z"
        {...STROKE}
      />
    </svg>
  );
}

export function PaletteIcon(props: IconProps = {}) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="10" cy="10" r="7.5" {...STROKE} />
      <circle cx="8" cy="7" r="1.25" fill="currentColor" />
      <circle cx="12" cy="7" r="1.25" fill="currentColor" />
      <circle cx="6.5" cy="10.5" r="1.25" fill="currentColor" />
      <circle cx="10" cy="12.5" r="1.25" fill="currentColor" />
    </svg>
  );
}
