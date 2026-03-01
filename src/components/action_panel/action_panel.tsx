import { type ReactNode, useRef } from 'react';
import './action_panel.scss';
import { ActionsDropdown, type DropdownSection } from './actions_dropdown';

export interface Action {
  label: string;
  shortcut: ReactNode;
  onClick?: () => void;
}

export interface ActionPanelProps {
  actions: Action[];
  dropdownOpen: boolean;
  dropdownSections: DropdownSection[];
  onDropdownClose: () => void;
  contextLabel?: string;
}

function RaycastLogo() {
  return (
    <svg
      className="action-panel__logo"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 12V10.667L5.333 9.333L6.667 10.667L5.333 12H4Z"
        fill="#FF6363"
      />
      <path d="M4 10.667L4 9.333L2.667 9.333L2.667 10.667H4Z" fill="#FF6363" />
      <path
        d="M5.333 12L5.333 13.333H6.667L6.667 12L5.333 12Z"
        fill="#FF6363"
      />
      <path
        d="M6.667 10.667L10.667 6.667L9.333 5.333L5.333 9.333L6.667 10.667Z"
        fill="#FF6363"
      />
      <path
        d="M10.667 6.667L12 5.333V4L10.667 5.333L9.333 4L10.667 2.667H12L13.333 4V5.333L12 6.667L10.667 5.333V6.667Z"
        fill="#FF6363"
      />
      <path d="M9.333 12L9.333 13.333H10.667V12H9.333Z" fill="#FF6363" />
      <path d="M12 9.333H13.333V10.667H12V9.333Z" fill="#FF6363" />
      <path
        d="M10.667 10.667L12 9.333H10.667L9.333 10.667V12L10.667 10.667Z"
        fill="#FF6363"
      />
    </svg>
  );
}

export function ActionPanel({
  actions,
  dropdownOpen,
  dropdownSections,
  onDropdownClose,
  contextLabel,
}: ActionPanelProps) {
  const actionsTriggerRef = useRef<HTMLButtonElement>(null);
  const primary = actions[0];
  if (!primary) return null;

  const actionsButton = actions.length > 1 ? actions[1] : undefined;

  return (
    <footer className="action-panel" role="toolbar" aria-label="Actions">
      <div className="action-panel__left">
        <RaycastLogo />
        {contextLabel && (
          <span className="action-panel__context">{contextLabel}</span>
        )}
      </div>
      <div className="action-panel__right">
        <button
          className="action-panel__primary-action"
          onClick={primary.onClick}
          type="button"
        >
          <span className="action-panel__primary-label">{primary.label}</span>
          <span className="action-panel__shortcut">{primary.shortcut}</span>
        </button>
        {actionsButton && (
          <>
            <span className="action-panel__separator" />
            <button
              ref={actionsTriggerRef}
              className="action-panel__actions-trigger"
              onClick={actionsButton.onClick}
              type="button"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
            >
              <span className="action-panel__actions-label">
                {actionsButton.label}
              </span>
              <span className="action-panel__shortcut">
                {actionsButton.shortcut}
              </span>
            </button>
          </>
        )}
      </div>
      <ActionsDropdown
        sections={dropdownSections}
        open={dropdownOpen}
        onClose={onDropdownClose}
        triggerRef={actionsTriggerRef}
      />
    </footer>
  );
}
