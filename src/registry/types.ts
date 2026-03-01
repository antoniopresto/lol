import type { ComponentType, ReactNode } from 'react';
import type { ListItemAccessoryData, ListItemDetailData } from '../types';

export type CommandMode = 'view' | 'no-view' | 'menu-bar';

export interface ExtensionCommand {
  name: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  keywords?: string[];
  aliases?: string[];
  mode: CommandMode;
  component?: ComponentType;
  fullView?: boolean;
  section?: string;
  accessories?: ListItemAccessoryData[];
  detail?: ListItemDetailData;
}

export interface ExtensionManifest {
  id: string;
  name: string;
  icon: ReactNode;
  description: string;
  author: string;
  commands: ExtensionCommand[];
}

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
  extensionId?: string;
}
