import './loading_bar.scss';

interface LoadingBarProps {
  visible?: boolean;
}

export function LoadingBar({ visible }: LoadingBarProps) {
  return (
    <div className={`loading-bar${visible ? ' loading-bar--visible' : ''}`}>
      <div className="loading-bar__indicator" />
    </div>
  );
}
