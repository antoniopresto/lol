import { type KeyboardEvent, Fragment, useEffect, useRef } from 'react';
import type { BreadcrumbItem } from '../../hooks/use_navigation';
import './search_bar.scss';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  activeDescendantId?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  activeDescendantId,
  breadcrumbs,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Escape' || !breadcrumbs || breadcrumbs.length === 0) {
      return;
    }

    e.preventDefault();
    if (value) {
      onChange('');
      return;
    }

    for (let i = breadcrumbs.length - 1; i >= 0; i--) {
      const crumb = breadcrumbs[i];
      if (crumb?.onBack) {
        crumb.onBack();
        return;
      }
    }
  }

  return (
    <div className="search-bar" role="search">
      <svg
        className="search-bar__icon"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <line
          x1="13.25"
          y1="13.25"
          x2="17.5"
          y2="17.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="search-bar__breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <Fragment key={i}>
                {i > 0 && (
                  <svg
                    className="search-bar__breadcrumb-chevron"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 1.5L5.5 4L2.5 6.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {isLast ? (
                  <span
                    className="search-bar__breadcrumb search-bar__breadcrumb--current"
                    aria-current="location"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    className="search-bar__breadcrumb"
                    onClick={crumb.onBack}
                    type="button"
                    aria-label={`Back to ${crumb.label}`}
                  >
                    {crumb.label}
                  </button>
                )}
              </Fragment>
            );
          })}
        </nav>
      )}
      <input
        ref={inputRef}
        className="search-bar__input"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={true}
        aria-controls="command-list"
        aria-activedescendant={activeDescendantId}
        aria-label="Search commands"
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
}
