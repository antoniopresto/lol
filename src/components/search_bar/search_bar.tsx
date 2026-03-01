import {
  type KeyboardEvent,
  type ReactNode,
  Fragment,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { BreadcrumbItem } from '../../hooks/use_navigation';
import './search_bar.scss';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  cyclingPlaceholders?: string[];
  activeDescendantId?: string;
  breadcrumbs?: BreadcrumbItem[];
  dropdown?: ReactNode;
}

const CYCLE_INTERVAL = 4000;
const FADE_DURATION = 250;

function useCyclingPlaceholder(
  placeholders: string[] | undefined,
  isActive: boolean,
): {
  text: string | undefined;
  visible: boolean;
} {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const placeholdersRef = useRef(placeholders);

  const contentsChanged =
    !placeholders ||
    !placeholdersRef.current ||
    placeholders.length !== placeholdersRef.current.length ||
    placeholders.some((p, i) => p !== placeholdersRef.current![i]);

  if (contentsChanged) {
    placeholdersRef.current = placeholders;
  }

  useEffect(() => {
    setIndex(0);
    setVisible(true);

    const items = placeholdersRef.current;
    if (!items || items.length <= 1 || !isActive) return;

    let timeout: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setVisible(false);
      timeout = setTimeout(() => {
        setIndex(prev => (prev + 1) % items.length);
        setVisible(true);
      }, FADE_DURATION);
    }, CYCLE_INTERVAL);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [
    contentsChanged,
    isActive,
  ]);

  if (!placeholders || placeholders.length === 0) {
    return {
      text: undefined,
      visible: true,
    };
  }

  return {
    text: placeholders[index % placeholders.length],
    visible,
  };
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  cyclingPlaceholders,
  activeDescendantId,
  breadcrumbs,
  dropdown,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEmpty = !value;
  const cycling = useCyclingPlaceholder(cyclingPlaceholders, isEmpty);
  const hasCycling =
    cyclingPlaceholders && cyclingPlaceholders.length > 1 && isEmpty;

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
      <div className="search-bar__input-wrapper">
        <input
          ref={inputRef}
          className="search-bar__input"
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={hasCycling ? undefined : placeholder}
          role="combobox"
          aria-expanded={true}
          aria-controls="command-list"
          aria-activedescendant={activeDescendantId}
          aria-label="Search commands"
          spellCheck={false}
          autoComplete="off"
        />
        {hasCycling && (
          <span
            className={`search-bar__cycling-placeholder${cycling.visible ? '' : ' search-bar__cycling-placeholder--hidden'}`}
            aria-hidden="true"
          >
            {cycling.text}
          </span>
        )}
      </div>
      {dropdown}
    </div>
  );
}
