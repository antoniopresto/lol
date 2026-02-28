import { type ReactNode } from 'react';
import './command_palette.scss';

interface CommandPaletteProps {
  children: ReactNode;
}

export function CommandPalette({ children }: CommandPaletteProps) {
  return (
    <div className="command-palette-overlay">
      <div className="command-palette">{children}</div>
    </div>
  );
}
