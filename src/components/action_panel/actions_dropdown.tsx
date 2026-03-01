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
  submenu?: DropdownSection[];
}

export interface DropdownSection {
  title?: string;
  actions: DropdownAction[];
}

interface SubmenuState {
  sections: DropdownSection[];
  parentLabel: string;
  parentActiveIndex: number;
}

interface ActionsDropdownProps {
  sections: DropdownSection[];
  open: boolean;
  onClose: () => void;
  triggerRef?: RefObject<HTMLButtonElement | null>;
}

function ChevronRight() {
  return (
    <svg
      className="actions-dropdown__chevron"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M4.5 2.5L8 6L4.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function renderSections(
  nonEmptySections: DropdownSection[],
  sectionOffsets: number[],
  activeIndex: number,
  onExecute: (index: number) => void,
  onHover: (index: number) => void
) {
  return nonEmptySections.map((section, sectionIndex) => {
    const offset = sectionOffsets[sectionIndex]!;
    const titleId = section.title ? `section-title-${sectionIndex}` : undefined;

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
            const hasSubmenu = action.submenu && action.submenu.length > 0;
            return (
              <button
                key={`action-${idx}`}
                id={`action-item-${idx}`}
                className={`actions-dropdown__item${idx === activeIndex ? ' actions-dropdown__item--active' : ''}${hasSubmenu ? ' actions-dropdown__item--has-submenu' : ''}`}
                data-dropdown-index={idx}
                role="menuitem"
                type="button"
                aria-haspopup={hasSubmenu ? 'menu' : undefined}
                onClick={() => onExecute(idx)}
                onMouseEnter={() => onHover(idx)}
              >
                <span className="actions-dropdown__label">{action.label}</span>
                {hasSubmenu ? (
                  <ChevronRight />
                ) : action.shortcut ? (
                  <span className="actions-dropdown__shortcut">
                    {action.shortcut}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </Fragment>
    );
  });
}

export function ActionsDropdown({
  sections,
  open,
  onClose,
  triggerRef,
}: ActionsDropdownProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [submenu, setSubmenu] = useState<SubmenuState | null>(null);
  const [submenuDirection, setSubmenuDirection] = useState<
    'enter' | 'exit' | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const nonEmptySections = useMemo(
    () =>
      (submenu ? submenu.sections : sections).filter(s => s.actions.length > 0),
    [
      sections,
      submenu,
    ],
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
      setSubmenu(null);
      setSubmenuDirection(null);
      dropdownRef.current.focus();
    }
  }, [open]);

  const openSubmenu = useCallback(
    (index: number): boolean => {
      const action = flatActions[index];
      if (!action?.submenu || action.submenu.length === 0) {
        return false;
      }
      setSubmenuDirection('enter');
      setSubmenu({
        sections: action.submenu,
        parentLabel: action.label,
        parentActiveIndex: index,
      });
      setActiveIndex(0);
      return true;
    },
    [flatActions],
  );

  const closeSubmenu = useCallback((): boolean => {
    if (!submenu) return false;
    const restoreIndex = submenu.parentActiveIndex;
    setSubmenuDirection('exit');
    setSubmenu(null);
    setActiveIndex(restoreIndex);
    return true;
  }, [submenu]);

  const executeAction = useCallback(
    (index: number) => {
      const action = flatActions[index];
      if (!action) return;
      if (action.submenu && action.submenu.length > 0) {
        openSubmenu(index);
        return;
      }
      action.onClick?.();
      onClose();
    },
    [
      flatActions,
      onClose,
      openSubmenu,
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
        if (!closeSubmenu()) {
          onClose();
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        closeSubmenu();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        openSubmenu(activeIndex);
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
    activeIndex,
    onClose,
    executeAction,
    openSubmenu,
    closeSubmenu,
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

  useEffect(() => {
    if (!submenuDirection) return;
    const timer = setTimeout(() => setSubmenuDirection(null), 150);
    return () => clearTimeout(timer);
  }, [submenuDirection]);

  if (!open || flatActions.length === 0) return null;

  const slideClass =
    submenuDirection === 'enter'
      ? ' actions-dropdown__content--slide-left'
      : submenuDirection === 'exit'
        ? ' actions-dropdown__content--slide-right'
        : '';

  return (
    <div
      className="actions-dropdown"
      ref={dropdownRef}
      role="menu"
      aria-label={submenu ? submenu.parentLabel : 'Available actions'}
      aria-activedescendant={`action-item-${activeIndex}`}
      tabIndex={-1}
    >
      <div className={`actions-dropdown__content${slideClass}`}>
        {submenu && (
          <button
            className="actions-dropdown__back"
            type="button"
            role="menuitem"
            aria-label={`Back to parent menu from ${submenu.parentLabel}`}
            onClick={closeSubmenu}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M7.5 2.5L4 6L7.5 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{submenu.parentLabel}</span>
          </button>
        )}
        {renderSections(
          nonEmptySections,
          sectionOffsets,
          activeIndex,
          executeAction,
          setActiveIndex,
        )}
      </div>
    </div>
  );
}
