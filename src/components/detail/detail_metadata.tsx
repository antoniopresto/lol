import type { ReactNode } from 'react';

export type TagColor =
  | 'blue'
  | 'green'
  | 'orange'
  | 'red'
  | 'purple'
  | 'yellow';

const TAG_COLORS: Record<TagColor, string> = {
  blue: '#007aff',
  green: '#30d158',
  orange: '#ff9f0a',
  red: '#ff453a',
  purple: '#bf5af2',
  yellow: '#ffd60a',
};

export interface MetadataLabelProps {
  title: string;
  text?: string;
  icon?: ReactNode;
}

export function MetadataLabel({ title, text, icon }: MetadataLabelProps) {
  const hasValue = text || icon;

  return (
    <div className="detail-metadata__item">
      <span className="detail-metadata__label">{title}</span>
      {hasValue && (
        <span className="detail-metadata__value">
          {icon && <span className="detail-metadata__value-icon">{icon}</span>}
          {text && <span className="detail-metadata__value-text">{text}</span>}
        </span>
      )}
    </div>
  );
}

export interface MetadataLinkProps {
  title: string;
  text: string;
  target: string;
}

export function MetadataLink({ title, text, target }: MetadataLinkProps) {
  return (
    <div className="detail-metadata__item">
      <span className="detail-metadata__label">{title}</span>
      <a
        className="detail-metadata__link"
        href={target}
        target="_blank"
        rel="noopener noreferrer"
      >
        {text}
      </a>
    </div>
  );
}

export interface MetadataTagProps {
  text: string;
  color?: TagColor;
}

export function MetadataTag({ text, color }: MetadataTagProps) {
  return (
    <span
      className="detail-metadata__tag"
      style={color ? { backgroundColor: TAG_COLORS[color] } : undefined}
    >
      {text}
    </span>
  );
}

export interface MetadataTagListProps {
  title: string;
  children: ReactNode;
}

export function MetadataTagList({ title, children }: MetadataTagListProps) {
  return (
    <div className="detail-metadata__item">
      <span className="detail-metadata__label">{title}</span>
      <div className="detail-metadata__tags">{children}</div>
    </div>
  );
}

export function MetadataSeparator() {
  return <hr className="detail-metadata__separator" />;
}

export interface DetailMetadataProps {
  children: ReactNode;
}

interface DetailMetadataComponent {
  (props: DetailMetadataProps): ReactNode;
  Label: typeof MetadataLabel;
  Link: typeof MetadataLink;
  TagList: typeof MetadataTagList;
  Tag: typeof MetadataTag;
  Separator: typeof MetadataSeparator;
}

export const DetailMetadata: DetailMetadataComponent = Object.assign(
  function DetailMetadata({ children }: DetailMetadataProps) {
    return <div className="detail-metadata">{children}</div>;
  },
  {
    Label: MetadataLabel,
    Link: MetadataLink,
    TagList: MetadataTagList,
    Tag: MetadataTag,
    Separator: MetadataSeparator,
  },
);
