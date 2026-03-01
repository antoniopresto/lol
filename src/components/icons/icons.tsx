interface IconProps {
  size?: number;
}

const defaults: Required<IconProps> = { size: 20 };

function svgBase(props: IconProps) {
  const s = props.size ?? defaults.size;
  return {
    width: s,
    height: s,
    viewBox: '0 0 20 20',
    xmlns: 'http://www.w3.org/2000/svg',
  };
}

const WHITE_STROKE = {
  stroke: '#FFFFFF',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
};

export function ClipboardIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <defs>
        <linearGradient id="clipboard-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD60A" />
          <stop offset="100%" stopColor="#FF9F0A" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="18"
        height="18"
        rx="4"
        fill="url(#clipboard-bg)"
      />
      <rect
        x="7"
        y="4"
        width="6"
        height="2"
        rx="0.75"
        {...WHITE_STROKE}
        strokeWidth={1.2}
      />
      <rect
        x="5.5"
        y="5.5"
        width="9"
        height="10"
        rx="1.5"
        {...WHITE_STROKE}
        strokeWidth={1.2}
      />
      <line
        x1="7.5"
        y1="9.5"
        x2="12.5"
        y2="9.5"
        {...WHITE_STROKE}
        strokeWidth={1.2}
      />
      <line
        x1="7.5"
        y1="12"
        x2="11"
        y2="12"
        {...WHITE_STROKE}
        strokeWidth={1.2}
      />
    </svg>
  );
}

export function SnippetsIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <defs>
        <linearGradient id="snippets-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BF5AF2" />
          <stop offset="100%" stopColor="#9B59B6" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="18"
        height="18"
        rx="4"
        fill="url(#snippets-bg)"
      />
      <rect
        x="4.5"
        y="4.5"
        width="11"
        height="11"
        rx="1.5"
        {...WHITE_STROKE}
        strokeWidth={1.2}
      />
      <polyline
        points="7.5,8 9.5,10 7.5,12"
        {...WHITE_STROKE}
        strokeWidth={1.2}
      />
      <line
        x1="11"
        y1="12"
        x2="13"
        y2="12"
        {...WHITE_STROKE}
        strokeWidth={1.2}
      />
    </svg>
  );
}

export function EmojiIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <defs>
        <linearGradient id="emoji-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD60A" />
          <stop offset="100%" stopColor="#FFCC00" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="18" height="18" rx="4" fill="url(#emoji-bg)" />
      <circle cx="10" cy="10" r="5.5" {...WHITE_STROKE} strokeWidth={1.2} />
      <circle cx="8" cy="9" r="0.8" fill="#FFFFFF" />
      <circle cx="12" cy="9" r="0.8" fill="#FFFFFF" />
      <path d="M7.5 11.5a3 3 0 005 0" {...WHITE_STROKE} strokeWidth={1.2} />
    </svg>
  );
}

export function WindowIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <defs>
        <linearGradient id="window-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64D2FF" />
          <stop offset="100%" stopColor="#0A84FF" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="18" height="18" rx="4" fill="url(#window-bg)" />
      <rect
        x="4"
        y="5"
        width="12"
        height="10"
        rx="1.5"
        {...WHITE_STROKE}
        strokeWidth={1.2}
      />
      <line x1="4" y1="8" x2="16" y2="8" {...WHITE_STROKE} strokeWidth={1.2} />
      <circle cx="6" cy="6.5" r="0.6" fill="#FFFFFF" />
      <circle cx="8" cy="6.5" r="0.6" fill="#FFFFFF" />
      <circle cx="10" cy="6.5" r="0.6" fill="#FFFFFF" />
    </svg>
  );
}

export function CalculatorIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <defs>
        <linearGradient id="calc-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#636366" />
          <stop offset="100%" stopColor="#48484A" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="18" height="18" rx="4" fill="url(#calc-bg)" />
      <rect
        x="5"
        y="4"
        width="10"
        height="12"
        rx="1.5"
        {...WHITE_STROKE}
        strokeWidth={1.2}
      />
      <rect
        x="6.5"
        y="5.5"
        width="7"
        height="3"
        rx="0.75"
        {...WHITE_STROKE}
        strokeWidth={1}
      />
      <circle cx="8" cy="11.5" r="0.7" fill="#FFFFFF" />
      <circle cx="10" cy="11.5" r="0.7" fill="#FFFFFF" />
      <circle cx="12" cy="11.5" r="0.7" fill="#FFFFFF" />
      <circle cx="8" cy="14" r="0.7" fill="#FFFFFF" />
      <circle cx="10" cy="14" r="0.7" fill="#FFFFFF" />
      <circle cx="12" cy="14" r="0.7" fill="#FFFFFF" />
    </svg>
  );
}

export function CpuIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <defs>
        <linearGradient id="cpu-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#30D158" />
          <stop offset="100%" stopColor="#28A745" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="18" height="18" rx="4" fill="url(#cpu-bg)" />
      <rect
        x="6"
        y="6"
        width="8"
        height="8"
        rx="1"
        {...WHITE_STROKE}
        strokeWidth={1.2}
      />
      <rect
        x="7.5"
        y="7.5"
        width="5"
        height="5"
        rx="0.5"
        {...WHITE_STROKE}
        strokeWidth={1}
      />
      <line x1="8.5" y1="4" x2="8.5" y2="6" {...WHITE_STROKE} strokeWidth={1} />
      <line
        x1="11.5"
        y1="4"
        x2="11.5"
        y2="6"
        {...WHITE_STROKE}
        strokeWidth={1}
      />
      <line
        x1="8.5"
        y1="14"
        x2="8.5"
        y2="16"
        {...WHITE_STROKE}
        strokeWidth={1}
      />
      <line
        x1="11.5"
        y1="14"
        x2="11.5"
        y2="16"
        {...WHITE_STROKE}
        strokeWidth={1}
      />
      <line x1="4" y1="8.5" x2="6" y2="8.5" {...WHITE_STROKE} strokeWidth={1} />
      <line
        x1="4"
        y1="11.5"
        x2="6"
        y2="11.5"
        {...WHITE_STROKE}
        strokeWidth={1}
      />
      <line
        x1="14"
        y1="8.5"
        x2="16"
        y2="8.5"
        {...WHITE_STROKE}
        strokeWidth={1}
      />
      <line
        x1="14"
        y1="11.5"
        x2="16"
        y2="11.5"
        {...WHITE_STROKE}
        strokeWidth={1}
      />
    </svg>
  );
}

export function ChatIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <defs>
        <linearGradient id="chat-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5AC8FA" />
          <stop offset="100%" stopColor="#007AFF" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="18" height="18" rx="4" fill="url(#chat-bg)" />
      <path
        d="M5 7a1.5 1.5 0 011.5-1.5h7A1.5 1.5 0 0115 7v5a1.5 1.5 0 01-1.5 1.5H10l-2.5 2V13.5H6.5A1.5 1.5 0 015 12V7z"
        {...WHITE_STROKE}
        strokeWidth={1.2}
      />
    </svg>
  );
}

export function PaletteIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <defs>
        <linearGradient id="palette-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF375F" />
          <stop offset="33%" stopColor="#FF9F0A" />
          <stop offset="66%" stopColor="#30D158" />
          <stop offset="100%" stopColor="#5AC8FA" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="18" height="18" rx="4" fill="url(#palette-bg)" />
      <circle cx="10" cy="10" r="5.5" {...WHITE_STROKE} strokeWidth={1.2} />
      <circle cx="8.5" cy="7.5" r="1" fill="#FFFFFF" />
      <circle cx="12" cy="8" r="1" fill="#FFFFFF" />
      <circle cx="7" cy="10.5" r="1" fill="#FFFFFF" />
      <circle cx="10" cy="13" r="1" fill="#FFFFFF" />
    </svg>
  );
}

export function SafariIcon(props: IconProps = {}) {
  const s = props.size ?? defaults.size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="safari-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5AC8FA" />
          <stop offset="100%" stopColor="#007AFF" />
        </linearGradient>
      </defs>
      <circle cx="10" cy="10" r="9" fill="url(#safari-bg)" />
      <circle
        cx="10"
        cy="10"
        r="7.5"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.4"
      />
      <polygon points="10,3.5 12.5,10 10,16.5" fill="#FF3B30" />
      <polygon points="10,3.5 7.5,10 10,16.5" fill="#FFFFFF" />
    </svg>
  );
}

export function VscodeIcon(props: IconProps = {}) {
  const s = props.size ?? defaults.size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="vscode-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2BA1F2" />
          <stop offset="100%" stopColor="#0065A9" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="18" height="18" rx="4" fill="url(#vscode-bg)" />
      <path
        d="M13.5 4L7.5 9.5 13.5 15"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="14.5"
        y1="4"
        x2="14.5"
        y2="15"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TerminalIcon(props: IconProps = {}) {
  const s = props.size ?? defaults.size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="2" width="18" height="16" rx="3" fill="#1C1C1E" />
      <rect
        x="1"
        y="2"
        width="18"
        height="16"
        rx="3"
        fill="none"
        stroke="#3A3A3C"
        strokeWidth="0.5"
      />
      <polyline
        points="5.5,8 8.5,10.5 5.5,13"
        stroke="#30D158"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="10"
        y1="13"
        x2="14.5"
        y2="13"
        stroke="#30D158"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FigmaIcon(props: IconProps = {}) {
  const s = props.size ?? defaults.size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7.5 2.5h2.5v5H7.5a2.5 2.5 0 010-5z" fill="#F24E1E" />
      <path d="M10 2.5h2.5a2.5 2.5 0 010 5H10V2.5z" fill="#FF7262" />
      <path d="M7.5 7.5h2.5v5H7.5a2.5 2.5 0 010-5z" fill="#A259FF" />
      <circle cx="12.5" cy="10" r="2.5" fill="#1ABCFE" />
      <path
        d="M7.5 12.5h2.5v2.5a2.5 2.5 0 01-5 0v0a2.5 2.5 0 012.5-2.5z"
        fill="#0ACF83"
      />
    </svg>
  );
}

export function SlackIcon(props: IconProps = {}) {
  const s = props.size ?? defaults.size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="1" width="18" height="18" rx="4" fill="#4A154B" />
      <rect x="5" y="8.5" width="4" height="1.8" rx="0.9" fill="#E01E5A" />
      <rect x="5" y="11" width="4" height="1.8" rx="0.9" fill="#36C5F0" />
      <rect x="11" y="8.5" width="4" height="1.8" rx="0.9" fill="#2EB67D" />
      <rect x="11" y="11" width="4" height="1.8" rx="0.9" fill="#ECB22E" />
      <circle cx="8" cy="6.5" r="1.2" fill="#E01E5A" />
      <circle cx="12" cy="6.5" r="1.2" fill="#2EB67D" />
      <circle cx="8" cy="14.5" r="1.2" fill="#36C5F0" />
      <circle cx="12" cy="14.5" r="1.2" fill="#ECB22E" />
    </svg>
  );
}
