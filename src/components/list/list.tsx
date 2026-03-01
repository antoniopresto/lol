import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './list.scss';
import { ListContext } from './list_context';

interface ListProps {
  children: ReactNode;
  itemCount: number;
  onActiveIndexChange?: (index: number) => void;
  onAction?: (index: number) => void;
}

export function List({
  children,
  itemCount,
  onActiveIndexChange,
  onAction,
}: ListProps) {
  const [activeIndex, setActiveIndexRaw] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const setActiveIndex = useCallback(
    (index: number) => {
      setActiveIndexRaw(index);
      onActiveIndexChange?.(index);
    },
    [onActiveIndexChange],
  );

  useEffect(() => {
    if (itemCount === 0) {
      setActiveIndex(0);
    } else if (activeIndex >= itemCount) {
      setActiveIndex(itemCount - 1);
    }
  }, [
    itemCount,
    activeIndex,
    setActiveIndex,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeElement = container.querySelector<HTMLElement>(
      `[data-list-index="${activeIndex}"]`,
    );
    activeElement?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (itemCount === 0) return;

      if (e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === 'n') {
          e.preventDefault();
          setActiveIndex(activeIndex < itemCount - 1 ? activeIndex + 1 : 0);
          return;
        }
        if (e.key === 'p') {
          e.preventDefault();
          setActiveIndex(activeIndex > 0 ? activeIndex - 1 : itemCount - 1);
          return;
        }
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(activeIndex < itemCount - 1 ? activeIndex + 1 : 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(activeIndex > 0 ? activeIndex - 1 : itemCount - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onAction?.(activeIndex);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeIndex,
    itemCount,
    setActiveIndex,
    onAction,
  ]);

  const contextValue = useMemo(
    () => ({
      activeIndex,
      setActiveIndex,
    }),
    [
      activeIndex,
      setActiveIndex,
    ],
  );

  return (
    <ListContext value={contextValue}>
      <div ref={containerRef} className="list" role="listbox" id="command-list">
        {children}
      </div>
    </ListContext>
  );
}
