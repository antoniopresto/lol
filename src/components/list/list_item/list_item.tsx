import { type ReactNode, useCallback } from 'react';
import { useListContext } from '../list_context';
import './list_item.scss';

export interface ListItemAccessory {
  text?: string;
  icon?: ReactNode;
}

export interface ListItemProps {
  index: number;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  accessories?: ListItemAccessory[];
  onClick?: () => void;
}

export function ListItem({
  index,
  icon,
  title,
  subtitle,
  accessories,
  onClick,
}: ListItemProps) {
  const { activeIndex, setActiveIndex } = useListContext();
  const isActive = activeIndex === index;

  const handleMouseEnter = useCallback(() => {
    setActiveIndex(index);
  }, [
    index,
    setActiveIndex,
  ]);

  return (
    <div
      className={`list-item${isActive ? ' list-item--active' : ''}`}
      data-list-index={index}
      role="option"
      aria-selected={isActive}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
    >
      <div className="list-item__left">
        {icon && <span className="list-item__icon">{icon}</span>}
        <span className="list-item__title">{title}</span>
        {subtitle && <span className="list-item__subtitle">{subtitle}</span>}
      </div>
      {accessories && accessories.length > 0 && (
        <div className="list-item__accessories">
          {accessories.map((accessory, i) => (
            <span key={i} className="list-item__accessory">
              {accessory.icon}
              {accessory.text && (
                <span className="list-item__accessory-text">
                  {accessory.text}
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
