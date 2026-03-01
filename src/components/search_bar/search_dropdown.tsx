import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import './search_dropdown.scss';

export interface SearchDropdownOption {
  label: string;
  value: string;
  icon?: ReactNode;
}

export interface SearchDropdownSection {
  title?: string;
  options: SearchDropdownOption[];
}

interface SearchDropdownProps {
  sections: SearchDropdownSection[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchDropdown({
  sections,
  value,
  onChange,
  placeholder = 'All',
}: SearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const idPrefix = useId();

  const nonEmptySections = useMemo(
    () => sections.filter(s => s.options.length > 0),
    [sections],
  );

  const flatOptions = useMemo(
    () => nonEmptySections.flatMap(s => s.options),
    [nonEmptySections],
  );

  const sectionOffsets = useMemo(() => {
    const offsets: number[] = [];
    let total = 0;
    for (const section of nonEmptySections) {
      offsets.push(total);
      total += section.options.length;
    }
    return offsets;
  }, [nonEmptySections]);

  const selectedOption = flatOptions.find(o => o.value === value);
  const selectedLabel = selectedOption?.label ?? placeholder;

  const toggle = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (!open) return;
    const currentIdx = flatOptions.findIndex(o => o.value === value);
    setActiveIndex(currentIdx >= 0 ? currentIdx : 0);
    dropdownRef.current?.focus();
  }, [
    open,
    flatOptions,
    value,
  ]);

  const selectOption = useCallback(
    (index: number) => {
      const option = flatOptions[index];
      if (!option) return;
      onChange(option.value);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [
      flatOptions,
      onChange,
    ],
  );

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex(i => (i < flatOptions.length - 1 ? i + 1 : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex(i => (i > 0 ? i - 1 : flatOptions.length - 1));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        selectOption(activeIndex);
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    open,
    activeIndex,
    flatOptions,
    selectOption,
  ]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open || !dropdownRef.current) return;
    const el = dropdownRef.current.querySelector<HTMLElement>(
      `[data-search-dropdown-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [
    open,
    activeIndex,
  ]);

  if (flatOptions.length === 0) return null;

  return (
    <div className="search-dropdown">
      <button
        ref={triggerRef}
        className="search-dropdown__trigger"
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filter by type"
      >
        <span className="search-dropdown__trigger-label">{selectedLabel}</span>
        <svg
          className={`search-dropdown__trigger-chevron${open ? ' search-dropdown__trigger-chevron--open' : ''}`}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
        >
          <path
            d="M2.5 3.75L5 6.25L7.5 3.75"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className="search-dropdown__menu"
          role="listbox"
          aria-activedescendant={`${idPrefix}-option-${activeIndex}`}
          aria-label="Filter options"
          tabIndex={-1}
        >
          <div className="search-dropdown__menu-content">
            {nonEmptySections.map((section, sectionIndex) => {
              const offset = sectionOffsets[sectionIndex] ?? 0;
              const titleId = section.title
                ? `${idPrefix}-section-${sectionIndex}`
                : undefined;

              return (
                <div key={sectionIndex}>
                  {sectionIndex > 0 && (
                    <div
                      className="search-dropdown__separator"
                      role="separator"
                    />
                  )}
                  <div role="group" aria-labelledby={titleId}>
                    {titleId && (
                      <div
                        id={titleId}
                        className="search-dropdown__section-title"
                        role="presentation"
                      >
                        {section.title}
                      </div>
                    )}
                    {section.options.map((option, optionIndex) => {
                      const idx = offset + optionIndex;
                      const isActive = idx === activeIndex;
                      const isSelected = option.value === value;
                      return (
                        <div
                          key={option.value}
                          id={`${idPrefix}-option-${idx}`}
                          className={`search-dropdown__option${isActive ? ' search-dropdown__option--active' : ''}`}
                          data-search-dropdown-index={idx}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => selectOption(idx)}
                          onMouseEnter={() => setActiveIndex(idx)}
                        >
                          {option.icon && (
                            <span className="search-dropdown__option-icon">
                              {option.icon}
                            </span>
                          )}
                          <span className="search-dropdown__option-label">
                            {option.label}
                          </span>
                          {isSelected && (
                            <svg
                              className="search-dropdown__check"
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M2.5 6L5 8.5L9.5 3.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
