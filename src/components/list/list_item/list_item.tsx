import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { TAG_COLOR_HEX } from '../../../constants/tag_colors';
import type { ListItemAccessoryData } from '../../../types';
import { formatRelativeDate } from '../../../utils/format_date';
import { HighlightedText } from '../../highlighted_text/highlighted_text';
import { Tooltip } from '../../tooltip/tooltip';
import { useListContext } from '../list_context';
import './list_item.scss';

export interface ListItemProps {
  index: number;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  accessories?: ListItemAccessoryData[];
  onClick?: () => void;
  query?: string;
}

function AccessoryWrapper({
  tooltip,
  children,
}: {
  tooltip?: string;
  children: ReactNode;
}) {
  if (tooltip) {
    return <Tooltip content={tooltip}>{children}</Tooltip>;
  }
  return <>{children}</>;
}

export function ListItem({
  index,
  icon,
  title,
  subtitle,
  accessories,
  onClick,
  query,
}: ListItemProps) {
  const { activeIndex, setActiveIndex } = useListContext();
  const isActive = activeIndex === index;
  const now = useMemo(() => new Date(), []);

  const handleMouseEnter = useCallback(() => {
    setActiveIndex(index);
  }, [
    index,
    setActiveIndex,
  ]);

  return (
    <div
      id={`list-item-${index}`}
      className={`list-item${isActive ? ' list-item--active' : ''}`}
      data-list-index={index}
      role="option"
      aria-selected={isActive}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
    >
      <div className="list-item__left">
        {icon && <span className="list-item__icon">{icon}</span>}
        {query ? (
          <HighlightedText
            text={title}
            query={query}
            className="list-item__title"
          />
        ) : (
          <span className="list-item__title">{title}</span>
        )}
        {subtitle &&
          (query ? (
            <HighlightedText
              text={subtitle}
              query={query}
              className="list-item__subtitle"
            />
          ) : (
            <span className="list-item__subtitle">{subtitle}</span>
          ))}
      </div>
      {accessories && accessories.length > 0 && (
        <div className="list-item__accessories">
          {accessories.map((accessory, i) => {
            const tooltipText =
              accessory.tooltip ??
              (accessory.date ? accessory.date.toLocaleString() : undefined);

            if (accessory.tag) {
              const hex = accessory.tag.color
                ? TAG_COLOR_HEX[accessory.tag.color]
                : undefined;
              return (
                <AccessoryWrapper key={i} tooltip={tooltipText}>
                  <span
                    className="list-item__accessory-tag"
                    style={
                      hex
                        ? {
                            color: hex,
                            backgroundColor: `${hex}26`,
                          }
                        : undefined
                    }
                  >
                    {accessory.tag.text}
                  </span>
                </AccessoryWrapper>
              );
            }
            const displayText = accessory.date
              ? formatRelativeDate(accessory.date, now)
              : accessory.text;

            return (
              <AccessoryWrapper key={i} tooltip={tooltipText}>
                <span className="list-item__accessory">
                  {accessory.icon}
                  {displayText && (
                    <span className="list-item__accessory-text">
                      {displayText}
                    </span>
                  )}
                </span>
              </AccessoryWrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}
