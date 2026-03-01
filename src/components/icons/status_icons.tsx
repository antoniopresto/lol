import { type IconProps, STROKE_DEFAULTS, svgBase } from './icon_shared';

export function BatteryIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <rect
        x="1.5"
        y="4.5"
        width="11"
        height="7"
        rx="1.5"
        {...STROKE_DEFAULTS}
      />
      <path d="M12.5 7v2a1 1 0 001-1v0a1 1 0 00-1-1z" fill="currentColor" />
      <rect x="3.5" y="6.5" width="5" height="3" rx="0.5" fill="currentColor" />
    </svg>
  );
}

export function WifiIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M1.5 5.5a9.5 9.5 0 0113 0" {...STROKE_DEFAULTS} />
      <path d="M4 8a6 6 0 018 0" {...STROKE_DEFAULTS} />
      <path d="M6 10.5a3.5 3.5 0 014 0" {...STROKE_DEFAULTS} />
      <circle cx="8" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

export function BoltIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M9 1.5L3.5 9H8l-1 5.5L12.5 7H8l1-5.5z" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function CloudIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path
        d="M4.5 12.5a3 3 0 01-.5-5.96 4.5 4.5 0 018.65-1A2.5 2.5 0 0112.5 12.5h-8z"
        {...STROKE_DEFAULTS}
      />
    </svg>
  );
}

export function WarningIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path
        d="M7.13 2.5a1 1 0 011.74 0l5.5 9.5A1 1 0 0113.5 13.5h-11a1 1 0 01-.87-1.5l5.5-9.5z"
        {...STROKE_DEFAULTS}
      />
      <path d="M8 6v3.5" {...STROKE_DEFAULTS} />
      <circle cx="8" cy="11.25" r="0.75" fill="currentColor" />
    </svg>
  );
}
