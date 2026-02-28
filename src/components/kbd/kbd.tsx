import './kbd.scss';

export interface KbdProps {
  keys: string[];
}

export function Kbd({ keys }: KbdProps) {
  if (keys.length === 0) return null;

  return (
    <span className="kbd">
      {keys.map(key => (
        <kbd key={key} className="kbd__key">
          {key}
        </kbd>
      ))}
    </span>
  );
}
