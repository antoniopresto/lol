import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FormField } from './form_field';
import './form_tag_picker.scss';

export interface FormTagPickerOption {
  label: string;
  value: string;
}

interface FormTagPickerProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: FormTagPickerOption[];
  placeholder?: string;
  description?: string;
  error?: string;
  autoFocus?: boolean;
}

export function FormTagPicker({
  label,
  value,
  onChange,
  options,
  placeholder,
  description,
  error,
  autoFocus,
}: FormTagPickerProps) {
  const id = useId();
  const listboxId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const optionLabelMap = useMemo(
    () =>
      new Map(
        options.map(o => [
          o.value,
          o.label,
        ]),
      ),
    [options],
  );

  const availableOptions = useMemo(
    () =>
      options.filter(
        opt =>
          !value.includes(opt.value) &&
          opt.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [
      options,
      value,
      query,
    ],
  );

  const resetDropdown = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const activeEl = menuRef.current?.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [
    activeIndex,
    open,
  ]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        resetDropdown();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    open,
    resetDropdown,
  ]);

  const selectOption = useCallback(
    (optionValue: string) => {
      onChange([
        ...value,
        optionValue,
      ]);
      setQuery('');
      setActiveIndex(0);
      inputRef.current?.focus();
    },
    [
      value,
      onChange,
    ],
  );

  const removeTag = useCallback(
    (optionValue: string) => {
      onChange(value.filter(v => v !== optionValue));
      inputRef.current?.focus();
    },
    [
      value,
      onChange,
    ],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !query && value.length > 0) {
        onChange(value.slice(0, -1));
        return;
      }

      if (!open || availableOptions.length === 0) {
        if (e.key === 'ArrowDown' && !open && availableOptions.length > 0) {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev =>
            prev < availableOptions.length - 1 ? prev + 1 : 0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev =>
            prev > 0 ? prev - 1 : availableOptions.length - 1);
          break;
        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          if (availableOptions[activeIndex]) {
            selectOption(availableOptions[activeIndex].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          resetDropdown();
          break;
        case 'Tab':
          resetDropdown();
          break;
      }
    },
    [
      open,
      query,
      value,
      onChange,
      availableOptions,
      activeIndex,
      selectOption,
      resetDropdown,
    ],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      if (!open) {
        setOpen(true);
      }
    },
    [open],
  );

  const handleInputFocus = useCallback(() => {
    if (availableOptions.length > 0) {
      setOpen(true);
    }
  }, [availableOptions.length]);

  const getLabel = useCallback(
    (optionValue: string) => optionLabelMap.get(optionValue) ?? optionValue,
    [optionLabelMap],
  );

  const activeOption = availableOptions[activeIndex];
  const activeOptionId =
    open && activeOption
      ? `${listboxId}-option-${activeOption.value}`
      : undefined;

  return (
    <FormField
      label={label}
      description={description}
      error={error}
      htmlFor={id}
    >
      <div className="form-tag-picker" ref={containerRef}>
        <div
          className="form-tag-picker__input-area"
          onClick={() => inputRef.current?.focus()}
        >
          {value.map(v => (
            <span key={v} className="form-tag-picker__tag">
              <span className="form-tag-picker__tag-label">{getLabel(v)}</span>
              <button
                type="button"
                className="form-tag-picker__tag-remove"
                onClick={e => {
                  e.stopPropagation();
                  removeTag(v);
                }}
                aria-label={`Remove ${getLabel(v)}`}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path
                    d="M1 1L7 7M7 1L1 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </span>
          ))}
          <input
            id={id}
            ref={inputRef}
            className="form-tag-picker__input"
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : undefined}
            autoFocus={autoFocus}
            spellCheck={false}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            aria-activedescendant={activeOptionId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        </div>
        {open && availableOptions.length > 0 && (
          <ul
            id={listboxId}
            ref={menuRef}
            className="form-tag-picker__menu"
            role="listbox"
            aria-label={label}
          >
            {availableOptions.map((opt, i) => (
              <li
                key={opt.value}
                id={`${listboxId}-option-${opt.value}`}
                className={`form-tag-picker__option${i === activeIndex ? ' form-tag-picker__option--active' : ''}`}
                role="option"
                aria-selected={i === activeIndex}
                data-active={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={e => {
                  e.preventDefault();
                  selectOption(opt.value);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </FormField>
  );
}
