import {
  Fragment,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './actions_dropdown.scss';

export interface DropdownAction {
  label: string;
  shortcut?: ReactNode;
  onClick?: () => void;
}

export interface DropdownSection {
  title?: string;
  actions: DropdownAction[];
}

interface ActionsDropdownProps {
  sections: DropdownSection[];
  open: boolean;
  onClose: () => void;
  triggerRef?: RefObject<HTMLButtonElement | null>;
}

export function ActionsDropdown({
  sections,
  open,
  onClose,
  triggerRef,
}: ActionsDropdownProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const nonEmptySections = useMemo(
    () => sections.filter(s => s.actions.length > 0),
    [sections],
  );

  const flatActions = useMemo(
    () => nonEmptySections.flatMap(s => s.actions),
    [nonEmptySections],
  );

  const sectionOffsets = useMemo(() => {
    const offsets: number[] = [];
    let total = 0;
    for (const section of nonEmptySections) {
      offsets.push(total);
      total += section.actions.length;
    }
    return offsets;
  }, [nonEmptySections]);

  useEffect(() => {
    if (open && dropdownRef.current) {
      setActiveIndex(0);
      dropdownRef.current.focus();
    }
  }, [open]);

  const executeAction = useCallback(
    (index: number) => {
      flatActions[index]?.onClick?.();
      onClose();
    },
    [
      flatActions,
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
        setActiveIndex(i => (i < flatActions.length - 1 ? i + 1 : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex(i => (i > 0 ? i - 1 : flatActions.length - 1));
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
    flatActions.length,
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

  if (!open || flatActions.length === 0) return null;

  return (
    <div
      className="actions-dropdown"
      ref={dropdownRef}
      role="menu"
      aria-label="Available actions"
      aria-activedescendant={`action-item-${activeIndex}`}
      tabIndex={-1}
    >
      {nonEmptySections.map((section, sectionIndex) => {
        const offset = sectionOffsets[sectionIndex]!;
        const titleId = section.title
          ? `section-title-${sectionIndex}`
          : undefined;

        return (
          <Fragment key={`section-${sectionIndex}`}>
            {sectionIndex > 0 && (
              <div className="actions-dropdown__separator" role="separator" />
            )}
            <div
              className="actions-dropdown__section"
              role="group"
              aria-labelledby={titleId}
            >
              {titleId && (
                <div
                  id={titleId}
                  className="actions-dropdown__section-title"
                  role="presentation"
                >
                  {section.title}
                </div>
              )}
              {section.actions.map((action, actionIndex) => {
                const idx = offset + actionIndex;
                return (
                  <button
                    key={`action-${idx}`}
                    id={`action-item-${idx}`}
                    className={`actions-dropdown__item${idx === activeIndex ? ' actions-dropdown__item--active' : ''}`}
                    data-dropdown-index={idx}
                    role="menuitem"
                    type="button"
                    onClick={() => executeAction(idx)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <span className="actions-dropdown__label">
                      {action.label}
                    </span>
                    {action.shortcut && (
                      <span className="actions-dropdown__shortcut">
                        {action.shortcut}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
