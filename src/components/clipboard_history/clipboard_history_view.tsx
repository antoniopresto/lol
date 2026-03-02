import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ClipboardEntry } from '../../data/clipboard_data';
import { useAlert } from '../../hooks/use_alert';
import {
  rowToEntry as clipboardRowToEntry,
  useClipboardHistory,
} from '../../hooks/use_clipboard_history';
import { useDbSearch } from '../../hooks/use_db_search';
import { SEARCH_DEBOUNCE_MS, useDebounce } from '../../hooks/use_debounce';
import { useHUD } from '../../hooks/use_hud';
import { useKeyboardShortcut } from '../../hooks/use_keyboard_shortcut';
import { useNavigation } from '../../hooks/use_navigation';
import { clipboardDb } from '../../utils/database';
import { formatRelativeDate } from '../../utils/format_date';
import { fuzzyMatch } from '../../utils/fuzzy_search';
import { ActionPanel } from '../action_panel/action_panel';
import {
  ClipboardHUDIcon,
  createCopyAction,
  createOpenInBrowserAction,
  performCopy,
  performOpen,
} from '../action_panel/actions';
import type { DropdownSection } from '../action_panel/actions_dropdown';
import { Alert } from '../alert/alert';
import { EmptyState } from '../empty_state/empty_state';
import { HUDContainer } from '../hud/hud_container';
import { Kbd } from '../kbd/kbd';
import { List, ListItem, ListSection } from '../list';
import { LoadingBar } from '../loading_bar/loading_bar';
import { SearchBar } from '../search_bar/search_bar';
import type { SearchDropdownSection } from '../search_bar/search_dropdown';
import { SearchDropdown } from '../search_bar/search_dropdown';
import './clipboard_history_view.scss';

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M10 1L14 5L11 8V11.5L8.5 14L8 9.5L3.5 9L6 6.5L3 3.5L6 1L8.5 3.5L10 1Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
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

function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="2"
        y="3"
        width="16"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="7" cy="8" r="1.5" fill="currentColor" />
      <path
        d="M2 14L7 10L10 13L13 9L18 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="clipboard-history__color-dot"
      style={{ backgroundColor: color }}
    />
  );
}

function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength) + '\u2026';
}

function renderClipboardIcon(entry: ClipboardEntry): ReactNode {
  if (entry.contentType === 'color') {
    return <ColorDot color={entry.content} />;
  }
  if (entry.contentType === 'image') {
    return <ImageIcon />;
  }
  return entry.sourceIcon;
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
    title: 'Type',
    options: [
      {
        label: 'Text',
        value: 'text',
      },
      {
        label: 'Links',
        value: 'link',
      },
      {
        label: 'Images',
        value: 'image',
      },
      {
        label: 'Colors',
        value: 'color',
      },
    ],
  },
];

export function ClipboardHistoryView() {
  const nav = useNavigation();
  const { entries, hasMore, loadMore, togglePin, deleteEntry } =
    useClipboardHistory();
  const [query, setQuery] = useState('');
  const { debouncedValue: debouncedQuery, isPending: isSearchPending } =
    useDebounce(query, SEARCH_DEBOUNCE_MS);
  const [filterValue, setFilterValue] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const { items: hudItems, show: showHUD } = useHUD();
  const { alertState, confirmAlert, dismiss: dismissAlert } = useAlert();
  const now = useMemo(() => new Date(), []);
  const dbSearchFn = useCallback((q: string) => clipboardDb.search(q), []);
  const { results: ftsResults, invalidate: invalidateFts } = useDbSearch(
    debouncedQuery,
    dbSearchFn,
    clipboardRowToEntry,
  );

  const filtered = useMemo(() => {
    let items = ftsResults ?? entries;
    if (filterValue !== 'all') {
      items = items.filter(e => e.contentType === filterValue);
    }
    if (!ftsResults && debouncedQuery) {
      items = items.filter(
        e =>
          fuzzyMatch(debouncedQuery, e.content) ||
          fuzzyMatch(debouncedQuery, e.sourceApp),
      );
    }
    return items;
  }, [
    entries,
    debouncedQuery,
    filterValue,
    ftsResults,
  ]);

  const pinnedItems = useMemo(() => filtered.filter(e => e.pinned), [filtered]);
  const recentItems = useMemo(
    () => filtered.filter(e => !e.pinned),
    [filtered],
  );
  const totalItemCount = filtered.length;

  const flatItems = useMemo(
    () => [
      ...pinnedItems,
      ...recentItems,
    ],
    [
      pinnedItems,
      recentItems,
    ],
  );

  useEffect(() => {
    if (selectedIndex >= totalItemCount && totalItemCount > 0) {
      setSelectedIndex(totalItemCount - 1);
    } else if (totalItemCount === 0) {
      setSelectedIndex(0);
    }
  }, [
    selectedIndex,
    totalItemCount,
  ]);

  const selectedEntry = flatItems[selectedIndex];

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
    setActionsOpen(false);
  }, []);

  const handleFilterChange = useCallback((value: string) => {
    setFilterValue(value);
    setSelectedIndex(0);
  }, []);

  const handleActiveIndexChange = useCallback((index: number) => {
    setSelectedIndex(index);
    setActionsOpen(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    performCopy(selectedEntry.content, showHUD, {
      hudIcon: <ClipboardHUDIcon />,
    });
  }, [
    selectedEntry,
    showHUD,
  ]);

  const handlePaste = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    showHUD({
      icon: <ClipboardHUDIcon />,
      title: 'Pasted',
    });
  }, [
    selectedEntry,
    showHUD,
  ]);

  const handleTogglePin = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    const wasPinned = selectedEntry.pinned;
    togglePin(selectedEntry.id);
    invalidateFts();
    showHUD({
      icon: <PinIcon />,
      title: wasPinned ? 'Unpinned' : 'Pinned',
    });
  }, [
    selectedEntry,
    showHUD,
    togglePin,
    invalidateFts,
  ]);

  const handleDelete = useCallback(() => {
    if (!selectedEntry) return;
    const entryId = selectedEntry.id;
    const contentPreview = truncateContent(selectedEntry.content, 30);
    setActionsOpen(false);
    confirmAlert({
      title: 'Delete Clipboard Entry?',
      message: contentPreview,
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.15" />
          <path
            d="M12 13V22M16 13V22M20 13V22M10 10H22M13 10V9C13 8.45 13.45 8 14 8H18C18.55 8 19 8.45 19 9V10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      primaryAction: {
        label: 'Delete',
        style: 'destructive',
        onAction: () => {
          deleteEntry(entryId);
          invalidateFts();
          showHUD({
            icon: <ClipboardHUDIcon />,
            title: 'Deleted',
          });
        },
      },
      dismissAction: {
        label: 'Cancel',
        style: 'cancel',
        onAction: () => {},
      },
    });
  }, [
    selectedEntry,
    confirmAlert,
    showHUD,
    deleteEntry,
    invalidateFts,
  ]);

  const handleAction = useCallback(() => {
    handlePaste();
  }, [handlePaste]);

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
    handleCopy,
  );

  useKeyboardShortcut(
    {
      key: 'l',
      meta: true,
    },
    handleCopy,
  );

  useKeyboardShortcut(
    {
      key: 'p',
      meta: true,
      shift: true,
    },
    handleTogglePin,
  );

  const handleOpenInBrowser = useCallback(() => {
    if (!selectedEntry || selectedEntry.contentType !== 'link') {
      return;
    }
    setActionsOpen(false);
    performOpen(selectedEntry.content, showHUD);
  }, [
    selectedEntry,
    showHUD,
  ]);

  useKeyboardShortcut(
    {
      key: 'Backspace',
      meta: true,
    },
    handleDelete,
  );

  useKeyboardShortcut(
    {
      key: 'o',
      meta: true,
    },
    handleOpenInBrowser,
  );

  const dropdownSections: DropdownSection[] = useMemo(() => {
    const primaryActions = [
      {
        label: 'Paste',
        shortcut: <Kbd keys={['↵']} />,
        onClick: handlePaste,
      },
      createCopyAction(
        {
          content: selectedEntry?.content ?? '',
          title: 'Copy',
          shortcut: (
            <Kbd
              keys={[
                '⌘',
                'C',
              ]}
            />
          ),
          hudIcon: <ClipboardHUDIcon />,
        },
        showHUD,
      ),
    ];

    if (selectedEntry?.contentType === 'link') {
      primaryActions.push(
        createOpenInBrowserAction(
          {
            url: selectedEntry.content,
            shortcut: (
              <Kbd
                keys={[
                  '⌘',
                  'O',
                ]}
              />
            ),
          },
          showHUD,
        ),
      );
    }

    return [
      {
        title: 'Actions',
        actions: primaryActions,
      },
      {
        title: 'Organize',
        actions: [
          {
            label: selectedEntry?.pinned ? 'Unpin' : 'Pin',
            shortcut: (
              <Kbd
                keys={[
                  '⌘',
                  '⇧',
                  'P',
                ]}
              />
            ),
            onClick: handleTogglePin,
          },
        ],
      },
      {
        title: 'Danger Zone',
        actions: [
          {
            label: 'Delete',
            shortcut: (
              <Kbd
                keys={[
                  '⌘',
                  '⌫',
                ]}
              />
            ),
            onClick: handleDelete,
          },
        ],
      },
    ];
  }, [
    selectedEntry?.pinned,
    selectedEntry?.content,
    selectedEntry?.contentType,
    handlePaste,
    handleTogglePin,
    handleDelete,
    showHUD,
  ]);

  const activeDescendantId =
    totalItemCount > 0 ? `list-item-${selectedIndex}` : undefined;

  return (
    <>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        placeholder="Search Clipboard History..."
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
      <LoadingBar visible={isSearchPending} />
      <div className="command-palette__body">
        <div className="command-palette__list-container">
          {totalItemCount === 0 ? (
            <EmptyState
              icon={<SearchEmptyIcon />}
              title="No Results"
              description="Try a different search term"
            />
          ) : (
            <List
              itemCount={totalItemCount}
              onActiveIndexChange={handleActiveIndexChange}
              onAction={handleAction}
              onLoadMore={!debouncedQuery ? loadMore : undefined}
              hasMore={!debouncedQuery && hasMore}
            >
              {(() => {
                let globalIndex = 0;

                const sections: ReactNode[] = [];

                if (pinnedItems.length > 0) {
                  sections.push(
                    <ListSection key="pinned" title="Pinned">
                      {pinnedItems.map(entry => {
                        const idx = globalIndex++;
                        return (
                          <ListItem
                            key={entry.id}
                            index={idx}
                            icon={renderClipboardIcon(entry)}
                            title={truncateContent(entry.content, 60)}
                            subtitle={entry.sourceApp}
                            accessories={[
                              {
                                text: formatRelativeDate(entry.copiedAt, now),
                                tooltip: entry.copiedAt.toLocaleString(),
                              },
                            ]}
                            query={debouncedQuery || undefined}
                          />
                        );
                      })}
                    </ListSection>,
                  );
                }

                if (recentItems.length > 0) {
                  sections.push(
                    <ListSection key="recent" title="Recent">
                      {recentItems.map(entry => {
                        const idx = globalIndex++;
                        return (
                          <ListItem
                            key={entry.id}
                            index={idx}
                            icon={renderClipboardIcon(entry)}
                            title={truncateContent(entry.content, 60)}
                            subtitle={entry.sourceApp}
                            accessories={[
                              {
                                text: formatRelativeDate(entry.copiedAt, now),
                                tooltip: entry.copiedAt.toLocaleString(),
                              },
                            ]}
                            query={debouncedQuery || undefined}
                          />
                        );
                      })}
                    </ListSection>,
                  );
                }

                return sections;
              })()}
            </List>
          )}
        </div>
      </div>
      <ActionPanel
        contextLabel="Clipboard History"
        actions={[
          {
            label: 'Paste',
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
      {alertState && (
        <Alert
          title={alertState.title}
          message={alertState.message}
          icon={alertState.icon}
          primaryAction={alertState.primaryAction}
          dismissAction={alertState.dismissAction}
          onDismiss={dismissAlert}
        />
      )}
      <HUDContainer items={hudItems} />
    </>
  );
}
