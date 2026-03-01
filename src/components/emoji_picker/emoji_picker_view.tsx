import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EmojiCategory, EmojiEntry } from '../../data/emoji_data';
import {
  EMOJI_CATEGORIES,
  EMOJI_CATEGORY_LABELS,
  EMOJI_CATEGORY_ORDER,
  MOCK_EMOJIS,
} from '../../data/emoji_data';
import { useHUD } from '../../hooks/use_hud';
import { useKeyboardShortcut } from '../../hooks/use_keyboard_shortcut';
import { useNavigation } from '../../hooks/use_navigation';
import { fuzzyMatch } from '../../utils/fuzzy_search';
import { isStringArray, storageGet, storageSet } from '../../utils/storage';
import { ActionPanel } from '../action_panel/action_panel';
import type { DropdownSection } from '../action_panel/actions_dropdown';
import { EmptyState } from '../empty_state/empty_state';
import { HUDContainer } from '../hud/hud_container';
import { Kbd } from '../kbd/kbd';
import { SearchBar } from '../search_bar/search_bar';
import type { SearchDropdownSection } from '../search_bar/search_dropdown';
import { SearchDropdown } from '../search_bar/search_dropdown';
import './emoji_picker_view.scss';

const COLUMNS = 6;
const STORAGE_KEY = 'emoji-recent';
const MAX_RECENT = 12;

function CopyHUDIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchEmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="21" cy="21" r="12" stroke="currentColor" strokeWidth="3" />
      <line
        x1="30"
        y1="30"
        x2="42"
        y2="42"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function loadRecentEmojis(): string[] {
  const stored = storageGet(STORAGE_KEY, isStringArray);
  if (stored) return stored;

  try {
    const legacy = localStorage.getItem('emoji-picker-recent');
    if (legacy) {
      const parsed: unknown = JSON.parse(legacy);
      if (isStringArray(parsed)) {
        storageSet(STORAGE_KEY, parsed);
        localStorage.removeItem('emoji-picker-recent');
        return parsed;
      }
    }
  } catch {
    // unavailable
  }
  return [];
}

interface EmojiSection {
  title: string;
  emojis: EmojiEntry[];
}

const FILTER_SECTIONS: SearchDropdownSection[] = [
  {
    options: [
      {
        label: 'All',
        value: 'all',
      },
    ],
  },
  {
    title: 'Category',
    options: EMOJI_CATEGORIES.map(c => ({
      label: c.label,
      value: c.value,
    })),
  },
];

export function EmojiPickerView() {
  const nav = useNavigation();
  const [query, setQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [recentChars, setRecentChars] = useState<string[]>(loadRecentEmojis);
  const { items: hudItems, show: showHUD } = useHUD();
  const containerRef = useRef<HTMLDivElement>(null);

  const emojiLookup = useMemo(() => {
    const map = new Map<string, EmojiEntry>();
    for (const e of MOCK_EMOJIS) {
      map.set(e.char, e);
    }
    return map;
  }, []);

  const recentEmojis = useMemo(
    () =>
      recentChars
        .map(char => emojiLookup.get(char))
        .filter((e): e is EmojiEntry => e !== undefined),
    [
      recentChars,
      emojiLookup,
    ],
  );

  const filtered = useMemo(() => {
    let emojis = MOCK_EMOJIS;
    if (filterValue !== 'all') {
      emojis = emojis.filter(e => e.category === filterValue);
    }
    if (query) {
      emojis = emojis.filter(
        e =>
          fuzzyMatch(query, e.name) ||
          e.keywords.some(k => fuzzyMatch(query, k)) ||
          e.char === query,
      );
    }
    return emojis;
  }, [
    query,
    filterValue,
  ]);

  const sections = useMemo(() => {
    const result: EmojiSection[] = [];

    if (!query && filterValue === 'all' && recentEmojis.length > 0) {
      result.push({
        title: 'Recently Used',
        emojis: recentEmojis,
      });
    }

    const grouped = new Map<EmojiCategory, EmojiEntry[]>();
    for (const emoji of filtered) {
      const existing = grouped.get(emoji.category);
      if (existing) {
        existing.push(emoji);
      } else {
        grouped.set(emoji.category, [emoji]);
      }
    }

    for (const cat of EMOJI_CATEGORY_ORDER) {
      const items = grouped.get(cat);
      if (items && items.length > 0) {
        result.push({
          title: EMOJI_CATEGORY_LABELS[cat],
          emojis: items,
        });
      }
    }

    return result;
  }, [
    filtered,
    query,
    filterValue,
    recentEmojis,
  ]);

  const flatEmojis = useMemo(() => sections.flatMap(s => s.emojis), [sections]);
  const totalCount = flatEmojis.length;

  useEffect(() => {
    if (totalCount === 0) {
      setActiveIndex(0);
    } else if (activeIndex >= totalCount) {
      setActiveIndex(totalCount - 1);
    }
  }, [
    totalCount,
    activeIndex,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelector<HTMLElement>(
      `[data-emoji-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const selectedEmoji = flatEmojis[activeIndex];

  const addToRecent = useCallback((char: string) => {
    setRecentChars(prev => {
      const next = [
        char,
        ...prev.filter(c => c !== char),
      ].slice(0, MAX_RECENT);
      storageSet(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const handleCopyEmoji = useCallback(
    (emoji?: EmojiEntry) => {
      const target = emoji ?? selectedEmoji;
      if (!target) return;
      navigator.clipboard.writeText(target.char).catch(() => {});
      setActionsOpen(false);
      addToRecent(target.char);
      showHUD({
        icon: <CopyHUDIcon />,
        title: `Copied ${target.char}`,
      });
    },
    [
      selectedEmoji,
      showHUD,
      addToRecent,
    ],
  );

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setActiveIndex(0);
    setActionsOpen(false);
  }, []);

  const handleFilterChange = useCallback((value: string) => {
    setFilterValue(value);
    setActiveIndex(0);
  }, []);

  const toggleActions = useCallback(() => {
    setActionsOpen(prev => !prev);
  }, []);

  const closeActions = useCallback(() => {
    setActionsOpen(false);
  }, []);

  useKeyboardShortcut(
    {
      key: 'k',
      meta: true,
    },
    toggleActions,
  );
  useKeyboardShortcut(
    {
      key: 'c',
      meta: true,
    },
    () => handleCopyEmoji(),
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (totalCount === 0) return;
      if (actionsOpen) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const isTextInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;

      switch (e.key) {
        case 'ArrowRight': {
          if (isTextInput) return;
          e.preventDefault();
          setActiveIndex(prev => (prev + 1 < totalCount ? prev + 1 : 0));
          break;
        }
        case 'ArrowLeft': {
          if (isTextInput) return;
          e.preventDefault();
          setActiveIndex(prev => (prev - 1 >= 0 ? prev - 1 : totalCount - 1));
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          setActiveIndex(prev => {
            const sectionInfo = getSectionInfo(prev);
            if (!sectionInfo) return prev;
            const { sectionStart, sectionLength } = sectionInfo;
            const posInSection = prev - sectionStart;
            const row = Math.floor(posInSection / COLUMNS);
            const col = posInSection % COLUMNS;
            const sectionRows = Math.ceil(sectionLength / COLUMNS);

            if (row + 1 < sectionRows) {
              const nextIdx = sectionStart + (row + 1) * COLUMNS + col;
              return nextIdx < sectionStart + sectionLength
                ? nextIdx
                : sectionStart + sectionLength - 1;
            }

            const nextSectionStart = sectionStart + sectionLength;
            if (nextSectionStart < totalCount) {
              const nextInfo = getSectionInfo(nextSectionStart);
              if (!nextInfo) return prev;
              const targetIdx = nextSectionStart + col;
              return targetIdx < nextSectionStart + nextInfo.sectionLength
                ? targetIdx
                : nextSectionStart + nextInfo.sectionLength - 1;
            }

            return prev;
          });
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setActiveIndex(prev => {
            const sectionInfo = getSectionInfo(prev);
            if (!sectionInfo) return prev;
            const { sectionStart } = sectionInfo;
            const posInSection = prev - sectionStart;
            const row = Math.floor(posInSection / COLUMNS);
            const col = posInSection % COLUMNS;

            if (row > 0) {
              return sectionStart + (row - 1) * COLUMNS + col;
            }

            if (sectionStart > 0) {
              const prevSectionEnd = sectionStart - 1;
              const prevInfo = getSectionInfo(prevSectionEnd);
              if (!prevInfo) return prev;
              const prevSectionRows = Math.ceil(
                prevInfo.sectionLength / COLUMNS,
              );
              const lastRowStart =
                prevInfo.sectionStart + (prevSectionRows - 1) * COLUMNS;
              const targetIdx = lastRowStart + col;
              return targetIdx < prevInfo.sectionStart + prevInfo.sectionLength
                ? targetIdx
                : prevInfo.sectionStart + prevInfo.sectionLength - 1;
            }

            return prev;
          });
          break;
        }
        case 'Enter': {
          e.preventDefault();
          handleCopyEmoji();
          break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    totalCount,
    actionsOpen,
    handleCopyEmoji,
    sections,
  ]);

  const sectionBoundaries = useMemo(() => {
    const boundaries: {
      start: number;
      length: number;
    }[] = [];
    let offset = 0;
    for (const section of sections) {
      boundaries.push({
        start: offset,
        length: section.emojis.length,
      });
      offset += section.emojis.length;
    }
    return boundaries;
  }, [sections]);

  function getSectionInfo(index: number) {
    for (const b of sectionBoundaries) {
      if (index >= b.start && index < b.start + b.length) {
        return {
          sectionStart: b.start,
          sectionLength: b.length,
        };
      }
    }
    return null;
  }

  const dropdownSections: DropdownSection[] = useMemo(
    () => [
      {
        title: 'Actions',
        actions: [
          {
            label: 'Copy Emoji',
            shortcut: <Kbd keys={['↵']} />,
            onClick: () => handleCopyEmoji(),
          },
          {
            label: 'Copy to Clipboard',
            shortcut: (
              <Kbd
                keys={[
                  '⌘',
                  'C',
                ]}
              />
            ),
            onClick: () => handleCopyEmoji(),
          },
        ],
      },
    ],
    [handleCopyEmoji],
  );

  const handleGridMouseOver = useCallback((
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      '[data-emoji-index]',
    );
    if (!target) return;
    const idx = Number(target.dataset.emojiIndex);
    if (!Number.isNaN(idx)) {
      setActiveIndex(idx);
    }
  }, []);

  const activeDescendantId =
    totalCount > 0 ? `emoji-item-${activeIndex}` : undefined;

  return (
    <>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        placeholder="Search Emoji..."
        activeDescendantId={activeDescendantId}
        breadcrumbs={nav.breadcrumbs.length > 0 ? nav.breadcrumbs : undefined}
        dropdown={
          <SearchDropdown
            sections={FILTER_SECTIONS}
            value={filterValue}
            onChange={handleFilterChange}
          />
        }
      />
      <div className="command-palette__body">
        <div className="command-palette__list-container">
          {totalCount === 0 ? (
            <EmptyState
              icon={<SearchEmptyIcon />}
              title="No Emoji Found"
              description={
                query
                  ? 'Try a different search term'
                  : 'No emojis in this category'
              }
            />
          ) : (
            <div
              ref={containerRef}
              className="emoji-picker"
              role="listbox"
              id="emoji-grid"
              aria-label="Emoji list"
              aria-activedescendant={activeDescendantId}
              onMouseOver={handleGridMouseOver}
            >
              {(() => {
                let globalIndex = 0;
                return sections.map(section => (
                  <div key={section.title} className="emoji-picker__section">
                    <div className="emoji-picker__section-header">
                      {section.title}
                    </div>
                    <div className="emoji-picker__grid">
                      {section.emojis.map(emoji => {
                        const idx = globalIndex++;
                        const isActive = idx === activeIndex;
                        return (
                          <div
                            key={`${section.title}-${emoji.char}`}
                            id={`emoji-item-${idx}`}
                            className={`emoji-picker__cell${isActive ? ' emoji-picker__cell--active' : ''}`}
                            role="option"
                            aria-selected={isActive}
                            aria-label={emoji.name}
                            data-emoji-index={idx}
                            onClick={() => {
                              setActiveIndex(idx);
                              handleCopyEmoji(emoji);
                            }}
                          >
                            {emoji.char}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </div>
      <ActionPanel
        contextLabel="Emoji"
        actions={[
          {
            label: selectedEmoji ? `Copy ${selectedEmoji.char}` : 'Copy Emoji',
            shortcut: <Kbd keys={['↵']} />,
          },
          {
            label: 'Actions',
            shortcut: (
              <Kbd
                keys={[
                  '⌘',
                  'K',
                ]}
              />
            ),
            onClick: toggleActions,
          },
        ]}
        dropdownOpen={actionsOpen}
        dropdownSections={dropdownSections}
        onDropdownClose={closeActions}
      />
      <HUDContainer items={hudItems} />
    </>
  );
}
