export interface IconProps {
  size?: number;
  className?: string;
}

const DEFAULTS: Required<Pick<IconProps, 'size'>> = { size: 16 };

export function svgBase(props: IconProps) {
  const s = props.size ?? DEFAULTS.size;
  return {
    width: s,
    height: s,
    viewBox: '0 0 16 16',
    xmlns: 'http://www.w3.org/2000/svg',
    className: props.className,
  };
}

export const STROKE_DEFAULTS = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
};
