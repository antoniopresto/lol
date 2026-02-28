import { type ReactNode, useRef } from 'react';
import './action_panel.scss';
import { ActionsDropdown, type DropdownAction } from './actions_dropdown';

export interface Action {
  label: string;
  shortcut: ReactNode;
  onClick?: () => void;
}

export interface ActionPanelProps {
  actions: Action[];
  dropdownOpen: boolean;
  dropdownActions: DropdownAction[];
  onDropdownClose: () => void;
}

export function ActionPanel({
  actions,
  dropdownOpen,
  dropdownActions,
  onDropdownClose,
}: ActionPanelProps) {
  const actionsTriggerRef = useRef<HTMLButtonElement>(null);
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
          {secondary.map((action, index) => (
            <button
              key={action.label}
              ref={
                index === secondary.length - 1 ? actionsTriggerRef : undefined
              }
              className="action-panel__action"
              onClick={action.onClick}
              type="button"
              aria-haspopup={
                index === secondary.length - 1 ? 'menu' : undefined
              }
              aria-expanded={
                index === secondary.length - 1 ? dropdownOpen : undefined
              }
            >
              <span className="action-panel__label">{action.label}</span>
              <span className="action-panel__shortcut">{action.shortcut}</span>
            </button>
          ))}
        </div>
      )}
      <ActionsDropdown
        actions={dropdownActions}
        open={dropdownOpen}
        onClose={onDropdownClose}
        triggerRef={actionsTriggerRef}
      />
    </footer>
  );
}
