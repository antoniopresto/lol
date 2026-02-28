import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './grid.scss';
import { GridContext } from './grid_context';

interface GridProps {
  children: ReactNode;
  itemCount: number;
  columns?: 3 | 4 | 5 | 6;
  onActiveIndexChange?: (index: number) => void;
  onAction?: (index: number) => void;
}

export function Grid({
  children,
  itemCount,
  columns = 4,
  onActiveIndexChange,
  onAction,
}: GridProps) {
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
      `[data-grid-index="${activeIndex}"]`,
    );
    activeElement?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (itemCount === 0) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const isTextInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;

      const row = Math.floor(activeIndex / columns);
      const col = activeIndex % columns;
      const totalRows = Math.ceil(itemCount / columns);

      switch (e.key) {
        case 'ArrowRight': {
          if (isTextInput) return;
          e.preventDefault();
          const next = activeIndex + 1;
          setActiveIndex(next < itemCount ? next : 0);
          break;
        }
        case 'ArrowLeft': {
          if (isTextInput) return;
          e.preventDefault();
          const prev = activeIndex - 1;
          setActiveIndex(prev >= 0 ? prev : itemCount - 1);
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const nextRow = row + 1;
          if (nextRow < totalRows) {
            const nextIndex = nextRow * columns + col;
            setActiveIndex(nextIndex < itemCount ? nextIndex : itemCount - 1);
          } else {
            setActiveIndex(col < itemCount ? col : 0);
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prevRow = row - 1;
          if (prevRow >= 0) {
            setActiveIndex(prevRow * columns + col);
          } else {
            const lastRowIndex = (totalRows - 1) * columns + col;
            setActiveIndex(
              lastRowIndex < itemCount ? lastRowIndex : itemCount - 1,
            );
          }
          break;
        }
        case 'Enter': {
          e.preventDefault();
          onAction?.(activeIndex);
          break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeIndex,
    itemCount,
    columns,
    setActiveIndex,
    onAction,
  ]);

  const contextValue = useMemo(
    () => ({
      activeIndex,
      setActiveIndex,
      columns,
    }),
    [
      activeIndex,
      setActiveIndex,
      columns,
    ],
  );

  return (
    <GridContext value={contextValue}>
      <div
        ref={containerRef}
        className="grid"
        role="listbox"
        id="command-grid"
        style={{ '--grid-columns': columns } as React.CSSProperties}
      >
        {children}
      </div>
    </GridContext>
  );
}
