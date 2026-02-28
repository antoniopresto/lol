import { type ReactNode } from 'react';
import { LoadingBar } from '../loading_bar/loading_bar';
import './command_palette.scss';

interface CommandPaletteProps {
  children: ReactNode;
  isLoading?: boolean;
}

export function CommandPalette({ children, isLoading }: CommandPaletteProps) {
  return (
    <div className="command-palette-overlay">
      <div className="command-palette">
        <LoadingBar visible={isLoading} />
        {children}
      </div>
    </div>
  );
}
