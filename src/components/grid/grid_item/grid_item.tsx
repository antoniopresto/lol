import { type ReactNode, useCallback } from 'react';
import { useGridContext } from '../grid_context';
import './grid_item.scss';

export interface GridItemProps {
  index: number;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}

export function GridItem({
  index,
  icon,
  title,
  subtitle,
  onClick,
}: GridItemProps) {
  const { activeIndex, setActiveIndex } = useGridContext();
  const isActive = activeIndex === index;

  const handleMouseEnter = useCallback(() => {
    setActiveIndex(index);
  }, [
    index,
    setActiveIndex,
  ]);

  return (
    <div
      id={`grid-item-${index}`}
      className={`grid-item${isActive ? ' grid-item--active' : ''}`}
      data-grid-index={index}
      role="option"
      aria-selected={isActive}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
    >
      {icon && <span className="grid-item__icon">{icon}</span>}
      <span className="grid-item__title">{title}</span>
      {subtitle && <span className="grid-item__subtitle">{subtitle}</span>}
    </div>
  );
}
