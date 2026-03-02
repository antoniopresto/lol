import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NavViewData } from '../../app_types';
import { useAlert } from '../../hooks/use_alert';
import { useApplications } from '../../hooks/use_applications';
import { SEARCH_DEBOUNCE_MS, useDebounce } from '../../hooks/use_debounce';
import { useFavorites } from '../../hooks/use_favorites';
import { useHUD } from '../../hooks/use_hud';
import { useKeyboardShortcut } from '../../hooks/use_keyboard_shortcut';
import { useNavigation } from '../../hooks/use_navigation';
import { useRecentCommands } from '../../hooks/use_recent_commands';
import { useToast } from '../../hooks/use_toast';
import { getPlatform, isTauri } from '../../platform';
import { getCommand, getSections, searchCommands } from '../../registry';
import type { ListItemData, SectionData } from '../../types';
import { evaluate } from '../../utils/calculator';
import { fuzzyMatch, fuzzyScore } from '../../utils/fuzzy_search';
import { ActionPanel } from '../action_panel/action_panel';
import {
  ClipboardHUDIcon,
  createCopyAction,
  performCopy,
} from '../action_panel/actions';
import { Alert } from '../alert/alert';
import { Detail } from '../detail/detail';
import { DetailMetadata } from '../detail/detail_metadata';
import { renderMetadataEntry } from '../detail/render_metadata';
import { EmptyState } from '../empty_state/empty_state';
import { HUDContainer } from '../hud/hud_container';
import { CalculatorIcon, MagnifyingGlassIcon, StarFilledIcon } from '../icons';
import { Kbd } from '../kbd/kbd';
import { List, ListItem, ListSection } from '../list';
import { QuickLook } from '../quick_look/quick_look';
import { SearchBar } from '../search_bar/search_bar';
import type { SearchDropdownSection } from '../search_bar/search_dropdown';
import { SearchDropdown } from '../search_bar/search_dropdown';
import { ToastContainer } from '../toast/toast_container';
import './root_search_view.scss';

const CYCLING_PLACEHOLDERS = [
  'Type a command...',
  'Search applications...',
  'Calculate something...',
  'Find files...',
];

function flattenItems(sections: SectionData[]): ListItemData[] {
  return sections.flatMap(s => s.items);
}

function AppIcon({ src }: { src: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) return <AppPlaceholderIcon />;
  return (
    <img
      src={src}
      alt=""
      width={20}
      height={20}
      className="root-search__app-icon"
      onError={() => setErrored(true)}
    />
  );
}

function AppPlaceholderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="4" fill="currentColor" opacity="0.2" />
      <path
        d="M6 7L10 4L14 7V13L10 16L6 13V7Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  );
}

const searchFilterSections: SearchDropdownSection[] = [
  {
    options: [
      {
        label: 'All',
        value: 'all',
      },
    ],
  },
  {
    title: 'Types',
    options: [
      {
        label: 'Commands',
        value: 'commands',
      },
      {
        label: 'Applications',
        value: 'applications',
      },
    ],
  },
];

interface RootSearchViewProps {
  onCompactChange?: (compact: boolean) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function RootSearchView({
  onCompactChange,
  onLoadingChange,
}: RootSearchViewProps) {
  const nav = useNavigation<NavViewData>();
  const { push } = nav;

  const [query, setQuery] = useState('');
  const { debouncedValue: debouncedQuery, isPending: isSearchPending } =
    useDebounce(query, SEARCH_DEBOUNCE_MS);
  const [filterValue, setFilterValue] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [quickLookOpen, setQuickLookOpen] = useState(false);

  const { toasts, show: showToast, hide: hideToast } = useToast();
  const { items: hudItems, show: showHUD } = useHUD();
  const { alertState, confirmAlert, dismiss: dismissAlert } = useAlert();
  const { favoriteIds, isFavorite, toggleFavorite, moveFavorite } =
    useFavorites();
  const { recentIds, addRecent } = useRecentCommands();
  const { applications, refresh: refreshApps } = useApplications();

  useEffect(() => {
    if (nav.stackDepth === 0) {
      setQuery('');
      setFilterValue('all');
      setSelectedIndex(0);
      setActionsOpen(false);
      setQuickLookOpen(false);
    }
  }, [nav.stackDepth]);

  useEffect(() => {
    if (!isTauri) return;
    const platform = getPlatform();
    let unsub: (() => void) | undefined;
    let cancelled = false;

    platform.window
      .onFocusChanged(focused => {
        if (focused) refreshApps();
      })
      .then(fn => {
        if (cancelled) fn();
        else unsub = fn;
      });

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [refreshApps]);

  const appSection: SectionData | null = useMemo(() => {
    if (applications.length === 0) return null;

    const items: ListItemData[] = applications.map(app => ({
      id: app.id,
      title: app.name,
      subtitle: 'Application',
      icon: app.icon ? <AppIcon src={app.icon} /> : <AppPlaceholderIcon />,
    }));

    return {
      title: 'Applications',
      items,
    };
  }, [applications]);

  const registrySections = useMemo(() => getSections(), []);

  const allSections = useMemo(() => {
    const sections = [...registrySections];
    if (!appSection) return sections;

    const existingIdx = sections.findIndex(s => s.title === 'Applications');
    if (existingIdx >= 0) {
      const existing = sections[existingIdx]!;
      sections[existingIdx] = {
        title: existing.title,
        items: [
          ...appSection.items,
          ...existing.items,
        ],
      };
    } else {
      sections.push(appSection);
    }
    return sections;
  }, [
    registrySections,
    appSection,
  ]);

  const filtered = useMemo(() => {
    let sections = allSections;
    if (filterValue === 'commands') {
      sections = sections.filter(
        s => s.title === 'Suggestions' || s.title === 'Commands',
      );
    } else if (filterValue === 'applications') {
      sections = sections.filter(s => s.title === 'Applications');
    }

    let filteredResult: SectionData[];
    if (debouncedQuery) {
      const commandResults = searchCommands(debouncedQuery);
      const appItems = appSection?.items ?? [];
      const matchedApps = appItems
        .map(item => ({
          item,
          score: fuzzyScore(debouncedQuery, item.title)?.score ?? -Infinity,
        }))
        .filter(({ score }) => score > -Infinity)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item);

      const mergedSections = [...commandResults];
      if (matchedApps.length > 0) {
        const appSectionIdx = mergedSections.findIndex(
          s => s.title === 'Applications',
        );
        if (appSectionIdx >= 0) {
          const existing = mergedSections[appSectionIdx]!;
          const existingIds = new Set(existing.items.map(i => i.id));
          const newApps = matchedApps.filter(a => !existingIds.has(a.id));
          mergedSections[appSectionIdx] = {
            title: existing.title,
            items: [
              ...newApps,
              ...existing.items,
            ],
          };
        } else {
          mergedSections.push({
            title: 'Applications',
            items: matchedApps,
          });
        }
      }

      filteredResult = mergedSections
        .map(s => {
          if (filterValue === 'commands') {
            return s.title === 'Suggestions' || s.title === 'Commands'
              ? s
              : {
                  ...s,
                  items: [],
                };
          }
          if (filterValue === 'applications') {
            return s.title === 'Applications'
              ? s
              : {
                  ...s,
                  items: [],
                };
          }
          return s;
        })
        .filter(s => s.items.length > 0);
    } else {
      filteredResult = sections;
    }

    const allFlatItems = allSections.flatMap(s => s.items);
    const favoriteItems = favoriteIds
      .map(id => allFlatItems.find(item => item.id === id))
      .filter((item): item is ListItemData => !!item);

    if (debouncedQuery) {
      const filteredFavs = favoriteItems.filter(
        item =>
          fuzzyMatch(debouncedQuery, item.title) ||
          fuzzyMatch(debouncedQuery, item.subtitle ?? ''),
      );
      if (filteredFavs.length > 0) {
        const favIds = new Set(filteredFavs.map(f => f.id));
        const dedupedSections = filteredResult
          .map(s => ({
            ...s,
            items: s.items.filter(item => !favIds.has(item.id)),
          }))
          .filter(s => s.items.length > 0);
        return [
          {
            title: 'Favorites',
            items: filteredFavs,
          },
          ...dedupedSections,
        ];
      }
      return filteredResult;
    }

    const pinnedSections: SectionData[] = [];
    const dedupIds = new Set<string>();

    if (favoriteItems.length > 0) {
      pinnedSections.push({
        title: 'Favorites',
        items: favoriteItems,
      });
      for (const item of favoriteItems) {
        dedupIds.add(item.id);
      }
    }

    const favSet = new Set(favoriteIds);
    const recentItems = recentIds
      .filter(id => !favSet.has(id))
      .map(id => allFlatItems.find(item => item.id === id))
      .filter((item): item is ListItemData => !!item);

    if (recentItems.length > 0) {
      pinnedSections.push({
        title: 'Recent Commands',
        items: recentItems,
      });
      for (const item of recentItems) {
        dedupIds.add(item.id);
      }
    }

    if (pinnedSections.length > 0) {
      const dedupedSections = filteredResult
        .map(s => ({
          ...s,
          items: s.items.filter(item => !dedupIds.has(item.id)),
        }))
        .filter(s => s.items.length > 0);
      return [
        ...pinnedSections,
        ...dedupedSections,
      ];
    }

    return filteredResult;
  }, [
    debouncedQuery,
    filterValue,
    favoriteIds,
    recentIds,
    allSections,
    appSection,
  ]);

  const calculatorResult = useMemo(() => {
    if (!debouncedQuery.trim()) return null;
    return evaluate(debouncedQuery);
  }, [debouncedQuery]);

  const allItems = useMemo(() => {
    const items = flattenItems(filtered);
    if (calculatorResult) {
      const calcItem: ListItemData = {
        id: '__calculator__',
        title: `= ${calculatorResult}`,
        subtitle: debouncedQuery.trim(),
        icon: <CalculatorIcon />,
      };
      return [
        calcItem,
        ...items,
      ];
    }
    return items;
  }, [
    filtered,
    calculatorResult,
    debouncedQuery,
  ]);

  const appPathMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const app of applications) {
      map.set(app.id, app.path);
    }
    return map;
  }, [applications]);

  const selectedItem = allItems[selectedIndex];

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

  const handleDrillIn = useCallback(() => {
    const item = allItems[selectedIndex];
    if (!item) return;

    setActionsOpen(false);

    if (item.id === '__calculator__' && calculatorResult) {
      performCopy(calculatorResult, showHUD, {
        hudIcon: <ClipboardHUDIcon />,
        hudTitle: `Copied ${calculatorResult}`,
      });
      return;
    }

    const appPath = appPathMap.get(item.id);
    if (appPath) {
      getPlatform()
        .apps.launchApplication(appPath)
        .then(() => {
          if (isTauri) {
            getPlatform().window.hide();
          }
        })
        .catch(() => {
          showToast({
            style: 'error',
            title: `Failed to launch ${item.title}`,
          });
        });
      return;
    }

    const cmd = getCommand(item.id);

    if (cmd?.component) {
      addRecent(item.id);
      push(cmd.name, {
        type: 'command',
        commandId: cmd.id,
      });
      setQuery('');
      setSelectedIndex(0);
    } else if (item.detail) {
      push(item.title, {
        type: 'detail',
        item,
      });
      setQuery('');
      showToast({
        style: 'success',
        title: `Opened ${item.title}`,
      });
    } else {
      showToast({
        style: 'success',
        title: `Opened ${item.title}`,
      });
    }
  }, [
    allItems,
    selectedIndex,
    showToast,
    showHUD,
    calculatorResult,
    push,
    addRecent,
    appPathMap,
  ]);

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

  const handleToggleFavorite = useCallback(() => {
    if (!selectedItem || selectedItem.id === '__calculator__') {
      return;
    }
    const wasAlreadyFavorite = isFavorite(selectedItem.id);
    toggleFavorite(selectedItem.id);
    showHUD({
      icon: <StarFilledIcon />,
      title: wasAlreadyFavorite
        ? 'Removed from Favorites'
        : 'Added to Favorites',
    });
  }, [
    selectedItem,
    toggleFavorite,
    isFavorite,
    showHUD,
  ]);

  useKeyboardShortcut(
    {
      key: 'f',
      meta: true,
      shift: true,
    },
    handleToggleFavorite,
    { enabled: !!selectedItem },
  );

  const handleCopyValue = useCallback(() => {
    if (!selectedItem) return;
    setActionsOpen(false);
    if (selectedItem.id === '__calculator__' && calculatorResult) {
      performCopy(calculatorResult, showHUD, {
        hudIcon: <ClipboardHUDIcon />,
        hudTitle: `Copied ${calculatorResult}`,
      });
      return;
    }
    performCopy(selectedItem.title, showHUD);
  }, [
    selectedItem,
    calculatorResult,
    showHUD,
  ]);

  useKeyboardShortcut(
    {
      key: 'l',
      meta: true,
    },
    handleCopyValue,
    { enabled: !!selectedItem },
  );

  const handleMoveFavoriteUp = useCallback(() => {
    if (!selectedItem || !isFavorite(selectedItem.id)) return;
    moveFavorite(selectedItem.id, 'up');
    setSelectedIndex(prev => Math.max(0, prev - 1));
  }, [
    selectedItem,
    isFavorite,
    moveFavorite,
  ]);

  const handleMoveFavoriteDown = useCallback(() => {
    if (!selectedItem || !isFavorite(selectedItem.id)) return;
    moveFavorite(selectedItem.id, 'down');
    setSelectedIndex(prev => prev + 1);
  }, [
    selectedItem,
    isFavorite,
    moveFavorite,
  ]);

  useKeyboardShortcut(
    {
      key: 'ArrowUp',
      meta: true,
      alt: true,
    },
    handleMoveFavoriteUp,
    {
      enabled: !!selectedItem && isFavorite(selectedItem.id),
    },
  );

  useKeyboardShortcut(
    {
      key: 'ArrowDown',
      meta: true,
      alt: true,
    },
    handleMoveFavoriteDown,
    {
      enabled: !!selectedItem && isFavorite(selectedItem.id),
    },
  );

  const openSettings = useCallback(() => {
    const settingsCmd = getCommand('settings');
    if (settingsCmd) {
      push('Settings', {
        type: 'command',
        commandId: 'settings',
      });
      setQuery('');
      setSelectedIndex(0);
      setActionsOpen(false);
    }
  }, [push]);

  useKeyboardShortcut(
    {
      key: ',',
      meta: true,
    },
    openSettings,
  );

  const toggleQuickLook = useCallback(() => {
    setQuickLookOpen(prev => !prev);
  }, []);

  const closeQuickLook = useCallback(() => {
    setQuickLookOpen(false);
  }, []);

  useKeyboardShortcut(
    {
      key: 'y',
      meta: true,
    },
    toggleQuickLook,
    { enabled: !!selectedItem?.detail },
  );

  useEffect(() => {
    if (!selectedItem?.detail) return;

    function handleSpaceBar(e: KeyboardEvent) {
      if (e.key !== ' ' || e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }
      if (query !== '') return;

      e.preventDefault();
      e.stopPropagation();
      setQuickLookOpen(prev => !prev);
    }

    window.addEventListener('keydown', handleSpaceBar);
    return () => window.removeEventListener('keydown', handleSpaceBar);
  }, [
    selectedItem?.detail,
    query,
  ]);

  const isCalculatorSelected = selectedItem?.id === '__calculator__';
  const detail = isCalculatorSelected ? undefined : selectedItem?.detail;

  const dropdownSections = useMemo(
    () => [
      {
        title: 'Primary Actions',
        actions: [
          isCalculatorSelected && calculatorResult
            ? createCopyAction(
                {
                  content: calculatorResult,
                  title: 'Copy Result',
                  shortcut: <Kbd keys={['↵']} />,
                  hudIcon: <ClipboardHUDIcon />,
                  hudTitle: `Copied ${calculatorResult}`,
                },
                showHUD,
              )
            : {
                label: 'Open',
                shortcut: <Kbd keys={['↵']} />,
                onClick: () => {
                  if (selectedItem) {
                    showToast({
                      style: 'success' as const,
                      title: `Opened ${selectedItem.title}`,
                    });
                  }
                },
              },
          {
            label: 'Quick Look',
            shortcut: (
              <Kbd
                keys={[
                  '⌘',
                  'Y',
                ]}
              />
            ),
            onClick: () => {
              if (selectedItem?.detail) {
                setActionsOpen(false);
                setQuickLookOpen(prev => !prev);
              }
            },
          },
          ...(!isCalculatorSelected && selectedItem
            ? [
                {
                  label:
                    selectedItem && isFavorite(selectedItem.id)
                      ? 'Remove from Favorites'
                      : 'Add to Favorites',
                  shortcut: (
                    <Kbd
                      keys={[
                        '⌘',
                        '⇧',
                        'F',
                      ]}
                    />
                  ),
                  onClick: () => {
                    if (selectedItem) {
                      setActionsOpen(false);
                      handleToggleFavorite();
                    }
                  },
                },
              ]
            : []),
        ],
      },
      {
        title: 'Copy Actions',
        actions: [
          createCopyAction(
            {
              content: selectedItem?.title ?? '',
              title: 'Copy Name',
              shortcut: (
                <Kbd
                  keys={[
                    '⌘',
                    'C',
                  ]}
                />
              ),
            },
            showHUD,
          ),
          {
            label: 'Copy As...',
            submenu: [
              {
                actions: [
                  createCopyAction(
                    {
                      content: `**${selectedItem?.title ?? ''}**${selectedItem?.subtitle ? ` — ${selectedItem.subtitle}` : ''}`,
                      title: 'Copy as Markdown',
                      hudTitle: 'Copied as Markdown',
                    },
                    showHUD,
                  ),
                  createCopyAction(
                    {
                      content: JSON.stringify({
                        title: selectedItem?.title,
                        subtitle: selectedItem?.subtitle,
                      }),
                      title: 'Copy as JSON',
                      hudTitle: 'Copied as JSON',
                    },
                    showHUD,
                  ),
                  createCopyAction(
                    {
                      content: selectedItem?.title ?? '',
                      title: 'Copy as Plain Text',
                      hudTitle: 'Copied as Plain Text',
                    },
                    showHUD,
                  ),
                ],
              },
            ],
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
            onClick: () => {
              if (!selectedItem) return;
              const itemTitle = selectedItem.title;
              setActionsOpen(false);
              confirmAlert({
                title: `Delete "${itemTitle}"?`,
                message: 'This action cannot be undone.',
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="currentColor"
                      opacity="0.15"
                    />
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
                    showToast({
                      style: 'error',
                      title: 'Deleted',
                      message: itemTitle,
                    });
                  },
                },
                dismissAction: {
                  label: 'Cancel',
                  style: 'cancel',
                  onAction: () => {},
                },
              });
            },
          },
        ],
      },
    ],
    [
      selectedItem,
      isCalculatorSelected,
      calculatorResult,
      showToast,
      showHUD,
      confirmAlert,
      isFavorite,
      handleToggleFavorite,
    ],
  );

  const activeDescendantId =
    allItems.length > 0 ? `list-item-${selectedIndex}` : undefined;

  const contextLabel =
    nav.breadcrumbs.length > 0
      ? nav.breadcrumbs[nav.breadcrumbs.length - 1]!.label
      : 'Raycast';

  const isCompact = !query.trim();

  useEffect(() => {
    onCompactChange?.(isCompact);
  }, [
    isCompact,
    onCompactChange,
  ]);

  useEffect(() => {
    onLoadingChange?.(isSearchPending);
  }, [
    isSearchPending,
    onLoadingChange,
  ]);

  return (
    <>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        activeDescendantId={activeDescendantId}
        breadcrumbs={nav.breadcrumbs.length > 0 ? nav.breadcrumbs : undefined}
        cyclingPlaceholders={CYCLING_PLACEHOLDERS}
        dropdown={
          <SearchDropdown
            sections={searchFilterSections}
            value={filterValue}
            onChange={handleFilterChange}
          />
        }
      />
      <div
        className="command-palette__collapsible"
        aria-hidden={isCompact}
        inert={isCompact ? true : undefined}
      >
        <div className="command-palette__collapsible-inner">
          <div className="command-palette__body">
            <div className="command-palette__list-container">
              {allItems.length === 0 ? (
                <EmptyState
                  icon={<MagnifyingGlassIcon size={48} />}
                  title="No Results"
                  description="Try a different search term"
                />
              ) : (
                <List
                  itemCount={allItems.length}
                  onActiveIndexChange={handleActiveIndexChange}
                  onAction={handleDrillIn}
                  detail={
                    detail ? (
                      <Detail
                        markdown={detail.markdown}
                        metadata={
                          detail.metadata ? (
                            <DetailMetadata>
                              {detail.metadata.map(renderMetadataEntry)}
                            </DetailMetadata>
                          ) : undefined
                        }
                      />
                    ) : undefined
                  }
                >
                  {(() => {
                    let globalIndex = 0;
                    return (
                      <>
                        {calculatorResult && (
                          <ListSection title="Result">
                            <ListItem
                              index={globalIndex++}
                              title={`= ${calculatorResult}`}
                              subtitle={debouncedQuery.trim()}
                              icon={<CalculatorIcon />}
                              accessories={[{ text: 'Copy' }]}
                            />
                          </ListSection>
                        )}
                        {filtered.map(section => (
                          <ListSection
                            key={section.title}
                            title={section.title}
                          >
                            {section.items.map(item => {
                              const idx = globalIndex++;
                              const showStar =
                                isFavorite(item.id) &&
                                section.title !== 'Favorites';
                              const itemAccessories = showStar
                                ? [
                                    {
                                      icon: <StarFilledIcon size={12} />,
                                      tooltip: 'Favorite',
                                    },
                                    ...(item.accessories ?? []),
                                  ]
                                : item.accessories;
                              return (
                                <ListItem
                                  key={item.id}
                                  index={idx}
                                  title={item.title}
                                  subtitle={item.subtitle}
                                  icon={item.icon}
                                  accessories={itemAccessories}
                                  query={debouncedQuery || undefined}
                                />
                              );
                            })}
                          </ListSection>
                        ))}
                      </>
                    );
                  })()}
                </List>
              )}
            </div>
          </div>
          <ActionPanel
            contextLabel={contextLabel}
            actions={[
              {
                label: isCalculatorSelected ? 'Copy Result' : 'Open',
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
        </div>
      </div>
      {quickLookOpen && selectedItem?.detail && (
        <QuickLook title={selectedItem.title} onClose={closeQuickLook}>
          <Detail
            markdown={selectedItem.detail.markdown}
            metadata={
              selectedItem.detail.metadata ? (
                <DetailMetadata>
                  {selectedItem.detail.metadata.map(renderMetadataEntry)}
                </DetailMetadata>
              ) : undefined
            }
          />
        </QuickLook>
      )}
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
      <ToastContainer toasts={toasts} onDismiss={hideToast} />
      <HUDContainer items={hudItems} />
    </>
  );
}
