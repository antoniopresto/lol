import { type ReactNode } from 'react';
import './action_panel.scss';

export interface Action {
  label: string;
  shortcut: ReactNode;
  onClick?: () => void;
}

export interface ActionPanelProps {
  actions: Action[];
}

export function ActionPanel({ actions }: ActionPanelProps) {
  const primary = actions[0];
  if (!primary) return null;

  const secondary = actions.slice(1);

  return (
    <footer className="action-panel" role="toolbar" aria-label="Actions">
      <div className="action-panel__primary">
        <button
          className="action-panel__action"
          onClick={primary.onClick}
          type="button"
        >
          <span className="action-panel__label">{primary.label}</span>
          <span className="action-panel__shortcut">{primary.shortcut}</span>
        </button>
      </div>
      {secondary.length > 0 && (
        <div className="action-panel__secondary">
          {secondary.map(action => (
            <button
              key={action.label}
              className="action-panel__action"
              onClick={action.onClick}
              type="button"
            >
              <span className="action-panel__label">{action.label}</span>
              <span className="action-panel__shortcut">{action.shortcut}</span>
            </button>
          ))}
        </div>
      )}
    </footer>
  );
}
