import { HUD, type HUDData } from './hud';
import './hud_container.scss';

interface HUDContainerProps {
  items: HUDData[];
}

export function HUDContainer({ items }: HUDContainerProps) {
  if (items.length === 0) return null;

  return (
    <div className="hud-container">
      {items.map(item => (
        <HUD
          key={item.id}
          icon={item.icon}
          title={item.title}
          exiting={item.exiting}
        />
      ))}
    </div>
  );
}
