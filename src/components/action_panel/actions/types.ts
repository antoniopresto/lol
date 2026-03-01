import type { ReactNode } from 'react';

export type ShowHUD = (options: {
  icon?: ReactNode;
  title: string;
}) => string;
