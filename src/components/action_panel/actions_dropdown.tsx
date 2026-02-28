import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import './actions_dropdown.scss';

export interface DropdownAction {
  label: string;
  shortcut?: ReactNode;
  onClick?: () => void;
}

interface ActionsDropdownProps {
  actions: DropdownAction[];
  open: boolean;
  onClose: () => void;
  triggerRef?: RefObject<HTMLButtonElement | null>;
}

export function ActionsDropdown({
  actions,
  open,
  onClose,
  triggerRef,
}: ActionsDropdownProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && dropdownRef.current) {
      setActiveIndex(0);
      dropdownRef.current.focus();
    }
  }, [open]);

  const executeAction = useCallback(
    (index: number) => {
      actions[index]?.onClick?.();
      onClose();
    },
    [
      actions,
      onClose,
    ],
  );

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex(i => (i < actions.length - 1 ? i + 1 : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex(i => (i > 0 ? i - 1 : actions.length - 1));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        executeAction(activeIndex);
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    open,
    actions.length,
    activeIndex,
    onClose,
    executeAction,
  ]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        if (triggerRef?.current?.contains(target)) return;
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    open,
    onClose,
    triggerRef,
  ]);

  useEffect(() => {
    if (!open) return;
    const container = dropdownRef.current;
    if (!container) return;

    const activeElement = container.querySelector<HTMLElement>(
      `[data-dropdown-index="${activeIndex}"]`,
    );
    activeElement?.scrollIntoView({ block: 'nearest' });
  }, [
    open,
    activeIndex,
  ]);

  if (!open || actions.length === 0) return null;

  return (
    <div
      className="actions-dropdown"
      ref={dropdownRef}
      role="menu"
      aria-label="Available actions"
      tabIndex={-1}
    >
      {actions.map((action, index) => (
        <button
          key={action.label}
          id={`action-item-${index}`}
          className={`actions-dropdown__item${index === activeIndex ? ' actions-dropdown__item--active' : ''}`}
          data-dropdown-index={index}
          role="menuitem"
          type="button"
          onClick={() => executeAction(index)}
          onMouseEnter={() => setActiveIndex(index)}
        >
          <span className="actions-dropdown__label">{action.label}</span>
          {action.shortcut && (
            <span className="actions-dropdown__shortcut">
              {action.shortcut}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
