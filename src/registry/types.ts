import type { ComponentType, ReactNode } from 'react';
import type { ListItemAccessoryData, ListItemDetailData } from '../types';

export interface CommandRegistration {
  id: string;
  name: string;
  subtitle?: string;
  icon: ReactNode;
  keywords?: string[];
  aliases?: string[];
  section: string;
  accessories?: ListItemAccessoryData[];
  detail?: ListItemDetailData;
  component?: ComponentType;
  fullView?: boolean;
}
