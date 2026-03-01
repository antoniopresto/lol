import { type IconProps, STROKE_DEFAULTS, svgBase } from './icon_shared';

export function CopyIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <rect
        x="5.5"
        y="5.5"
        width="8"
        height="8"
        rx="1.5"
        {...STROKE_DEFAULTS}
      />
      <path
        d="M10.5 5.5V4a1.5 1.5 0 00-1.5-1.5H4A1.5 1.5 0 002.5 4v5A1.5 1.5 0 004 10.5h1.5"
        {...STROKE_DEFAULTS}
      />
    </svg>
  );
}

export function PasteIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <rect
        x="4"
        y="4.5"
        width="8"
        height="9.5"
        rx="1.5"
        {...STROKE_DEFAULTS}
      />
      <path d="M6 4.5V3.5a1 1 0 011-1h2a1 1 0 011 1v1" {...STROKE_DEFAULTS} />
      <path d="M6.5 8.5h3" {...STROKE_DEFAULTS} />
      <path d="M6.5 11h2" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function DownloadIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M8 2v8.5" {...STROKE_DEFAULTS} />
      <path d="M4.5 7L8 10.5 11.5 7" {...STROKE_DEFAULTS} />
      <path d="M2.5 12.5v1a1 1 0 001 1h9a1 1 0 001-1v-1" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function UploadIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M8 10.5V2" {...STROKE_DEFAULTS} />
      <path d="M4.5 5.5L8 2l3.5 3.5" {...STROKE_DEFAULTS} />
      <path d="M2.5 12.5v1a1 1 0 001 1h9a1 1 0 001-1v-1" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function TrashIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M2.5 4.5h11" {...STROKE_DEFAULTS} />
      <path
        d="M5.5 4.5V3a1.5 1.5 0 011.5-1.5h2A1.5 1.5 0 0110.5 3v1.5"
        {...STROKE_DEFAULTS}
      />
      <path
        d="M3.5 4.5l.75 9a1.5 1.5 0 001.5 1.5h4.5a1.5 1.5 0 001.5-1.5l.75-9"
        {...STROKE_DEFAULTS}
      />
      <path d="M6.5 7v4.5" {...STROKE_DEFAULTS} />
      <path d="M9.5 7v4.5" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function DuplicateIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <rect
        x="5.5"
        y="5.5"
        width="8"
        height="8"
        rx="1.5"
        {...STROKE_DEFAULTS}
      />
      <path
        d="M10.5 5.5V4a1.5 1.5 0 00-1.5-1.5H4A1.5 1.5 0 002.5 4v5A1.5 1.5 0 004 10.5h1.5"
        {...STROKE_DEFAULTS}
      />
      <path d="M9.5 7.5v4" {...STROKE_DEFAULTS} />
      <path d="M7.5 9.5h4" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function EditIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M11.5 2.5l2 2-8.5 8.5H3v-2l8.5-8.5z" {...STROKE_DEFAULTS} />
      <path d="M9.5 4.5l2 2" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function RefreshIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M13 8a5 5 0 01-9 3" {...STROKE_DEFAULTS} />
      <path d="M3 8a5 5 0 019-3" {...STROKE_DEFAULTS} />
      <path d="M13 3v4h-4" {...STROKE_DEFAULTS} />
      <path d="M3 13V9h4" {...STROKE_DEFAULTS} />
    </svg>
  );
}
