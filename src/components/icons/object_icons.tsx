import { type IconProps, STROKE_DEFAULTS, svgBase } from './icon_shared';

export function DocumentIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path
        d="M4 2.5h5.5L13 6v7.5A1.5 1.5 0 0 1 11.5 15h-6A1.5 1.5 0 0 1 4 13.5v-11z"
        {...STROKE_DEFAULTS}
      />
      <path d="M9.5 2.5V6H13" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function FolderIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path
        d="M2.5 4A1.5 1.5 0 0 1 4 2.5h3l1.5 2h4A1.5 1.5 0 0 1 14 6v6.5A1.5 1.5 0 0 1 12.5 14h-9A1.5 1.5 0 0 1 2 12.5V4z"
        {...STROKE_DEFAULTS}
      />
    </svg>
  );
}

export function CalendarIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <rect x="2" y="3" width="12" height="11" rx="1.5" {...STROKE_DEFAULTS} />
      <path d="M2 6.5h12" {...STROKE_DEFAULTS} />
      <path d="M5.5 1.5v3" {...STROKE_DEFAULTS} />
      <path d="M10.5 1.5v3" {...STROKE_DEFAULTS} />
      <circle cx="5.5" cy="9.5" r="0.75" fill="currentColor" />
      <circle cx="8" cy="9.5" r="0.75" fill="currentColor" />
      <circle cx="10.5" cy="9.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function ClockIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <circle cx="8" cy="8" r="6" {...STROKE_DEFAULTS} />
      <path d="M8 4.5V8l2.5 1.5" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function GearIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <circle cx="8" cy="8" r="2.5" {...STROKE_DEFAULTS} />
      <path
        d="M7.2 1.5h1.6l.3 1.6a5 5 0 0 1 1.4.8l1.5-.6.8 1.4-1.2 1a5 5 0 0 1 0 1.6l1.2 1-.8 1.4-1.5-.6a5 5 0 0 1-1.4.8l-.3 1.6H7.2l-.3-1.6a5 5 0 0 1-1.4-.8l-1.5.6-.8-1.4 1.2-1a5 5 0 0 1 0-1.6l-1.2-1 .8-1.4 1.5.6a5 5 0 0 1 1.4-.8z"
        {...STROKE_DEFAULTS}
        strokeWidth={1.25}
      />
    </svg>
  );
}

export function GlobeIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <circle cx="8" cy="8" r="6" {...STROKE_DEFAULTS} />
      <ellipse cx="8" cy="8" rx="2.5" ry="6" {...STROKE_DEFAULTS} />
      <path d="M2 8h12" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function LinkIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M6.5 9.5l3-3" {...STROKE_DEFAULTS} />
      <path d="M9 7l2-2A2.12 2.12 0 0 1 14 8l-2 2" {...STROKE_DEFAULTS} />
      <path d="M7 9l-2 2A2.12 2.12 0 0 0 8 14l2-2" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function LockIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <rect x="3" y="7" width="10" height="7" rx="1.5" {...STROKE_DEFAULTS} />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" {...STROKE_DEFAULTS} />
      <circle cx="8" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function KeyIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <circle cx="5.5" cy="6.5" r="3" {...STROKE_DEFAULTS} />
      <path d="M8 8l5.5 5.5" {...STROKE_DEFAULTS} />
      <path d="M11 11l2-1" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function StarIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path
        d="M8 1.5l2 4 4.5.65-3.25 3.17.77 4.48L8 11.65l-4.02 2.15.77-4.48L1.5 6.15 6 5.5z"
        {...STROKE_DEFAULTS}
      />
    </svg>
  );
}

export function StarFilledIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path
        d="M8 1.5l2 4 4.5.65-3.25 3.17.77 4.48L8 11.65l-4.02 2.15.77-4.48L1.5 6.15 6 5.5z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MagnifyingGlassIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <circle cx="7" cy="7" r="4" {...STROKE_DEFAULTS} />
      <line x1="10" y1="10" x2="14" y2="14" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function HeartIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path
        d="M8 14C8 14 1.5 10 1.5 5.5A3.25 3.25 0 0 1 4.75 2.25c1.3 0 2.45.75 3.25 1.75A3.25 3.25 0 0 1 14.5 5.5C14.5 10 8 14 8 14z"
        {...STROKE_DEFAULTS}
      />
    </svg>
  );
}
