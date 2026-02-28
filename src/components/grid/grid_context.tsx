import { createContext, useContext } from 'react';

interface GridContextValue {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  columns: number;
}

export const GridContext = createContext<GridContextValue | null>(null);

export function useGridContext(): GridContextValue {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error('useGridContext must be used within a Grid');
  }
  return context;
}
