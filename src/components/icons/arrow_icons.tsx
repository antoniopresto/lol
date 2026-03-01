import { type IconProps, STROKE_DEFAULTS, svgBase } from './icon_shared';

export function ArrowUpIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M8 13V3" {...STROKE_DEFAULTS} />
      <path d="M3.5 7.5L8 3l4.5 4.5" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function ArrowDownIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M8 3v10" {...STROKE_DEFAULTS} />
      <path d="M3.5 8.5L8 13l4.5-4.5" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M13 8H3" {...STROKE_DEFAULTS} />
      <path d="M7.5 3.5L3 8l4.5 4.5" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M3 8h10" {...STROKE_DEFAULTS} />
      <path d="M8.5 3.5L13 8l-4.5 4.5" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function ChevronUpIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M3.5 10.5L8 6l4.5 4.5" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M3.5 5.5L8 10l4.5-4.5" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M10.5 3.5L6 8l4.5 4.5" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M5.5 3.5L10 8l-4.5 4.5" {...STROKE_DEFAULTS} />
    </svg>
  );
}
