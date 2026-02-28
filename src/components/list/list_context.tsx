import { createContext, useContext } from 'react';

interface ListContextValue {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export const ListContext = createContext<ListContextValue | null>(null);

export function useListContext(): ListContextValue {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error('useListContext must be used within a List');
  }
  return context;
}
