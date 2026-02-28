import type { ReactNode } from 'react';
import type { TagColor } from './components/detail/detail_metadata';

export interface ListItemData {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  accessories?: ListItemAccessoryData[];
  detail?: ListItemDetailData;
}

export interface ListItemAccessoryData {
  text?: string;
  icon?: ReactNode;
}

export interface ListItemDetailData {
  markdown: string;
  metadata?: ListItemMetadataEntry[];
}

export type ListItemMetadataEntry =
  | {
      type: 'label';
      title: string;
      text?: string;
    }
  | {
      type: 'link';
      title: string;
      text: string;
      target: string;
    }
  | {
      type: 'tag-list';
      title: string;
      tags: {
        text: string;
        color?: TagColor;
      }[];
    }
  | { type: 'separator' };

export interface SectionData {
  title: string;
  items: ListItemData[];
}

export interface GridItemData {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export interface ColorItemData extends GridItemData {
  color: string;
}
