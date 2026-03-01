import type { ReactNode } from 'react';
import './hud.scss';

export interface HUDData {
  id: string;
  icon?: ReactNode;
  title: string;
  exiting: boolean;
}

interface HUDProps {
  icon?: ReactNode;
  title: string;
  exiting: boolean;
}

export function HUD({ icon, title, exiting }: HUDProps) {
  return (
    <div
      className={`hud${exiting ? ' hud--exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {icon && <span className="hud__icon">{icon}</span>}
      <span className="hud__title">{title}</span>
    </div>
  );
}
