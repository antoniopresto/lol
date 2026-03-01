import type { ReactNode } from 'react';
import type { TagColor } from '../../constants/tag_colors';
import { TAG_COLOR_HEX } from '../../constants/tag_colors';
export type { TagColor } from '../../constants/tag_colors';

interface TagColorValue {
  background: string;
  text: string;
}

const TAG_COLORS: Record<TagColor, TagColorValue> = {
  blue: {
    background: TAG_COLOR_HEX.blue,
    text: '#ffffff',
  },
  green: {
    background: TAG_COLOR_HEX.green,
    text: '#ffffff',
  },
  orange: {
    background: TAG_COLOR_HEX.orange,
    text: '#1a1a1c',
  },
  red: {
    background: TAG_COLOR_HEX.red,
    text: '#ffffff',
  },
  purple: {
    background: TAG_COLOR_HEX.purple,
    text: '#ffffff',
  },
  yellow: {
    background: TAG_COLOR_HEX.yellow,
    text: '#1a1a1c',
  },
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
      style={
        color
          ? {
              backgroundColor: TAG_COLORS[color].background,
              color: TAG_COLORS[color].text,
            }
          : undefined
      }
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
