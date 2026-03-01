import { type IconProps, STROKE_DEFAULTS, svgBase } from './icon_shared';

export function CheckIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M3 8.5l3.5 3.5L13 4" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function CircleIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <circle cx="8" cy="8" r="5.5" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function DotIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <circle cx="8" cy="8" r="3" fill="currentColor" />
    </svg>
  );
}

export function EllipsisIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <circle cx="3.5" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="12.5" cy="8" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function PlusIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M8 3v10" {...STROKE_DEFAULTS} />
      <path d="M3 8h10" {...STROKE_DEFAULTS} />
    </svg>
  );
}

export function MinusIcon(props: IconProps = {}) {
  return (
    <svg {...svgBase(props)}>
      <path d="M3 8h10" {...STROKE_DEFAULTS} />
    </svg>
  );
}
