import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionPanel } from './components/action_panel/action_panel';
import {
  ClipboardHUDIcon,
  createCopyAction,
  performCopy,
} from './components/action_panel/actions';
import { Alert } from './components/alert/alert';
import { CommandPalette } from './components/command_palette/command_palette';
import { Detail } from './components/detail/detail';
import { DetailMetadata } from './components/detail/detail_metadata';
import { EmptyState } from './components/empty_state/empty_state';
import { HUDContainer } from './components/hud/hud_container';
import { CalculatorIcon, StarFilledIcon } from './components/icons';
import { Kbd } from './components/kbd/kbd';
import { List, ListItem, ListSection } from './components/list';
import { QuickLook } from './components/quick_look/quick_look';
import { SearchBar } from './components/search_bar/search_bar';
import type { SearchDropdownSection } from './components/search_bar/search_dropdown';
import { SearchDropdown } from './components/search_bar/search_dropdown';
import { ToastContainer } from './components/toast/toast_container';
import { useAlert } from './hooks/use_alert';
import { useFavorites } from './hooks/use_favorites';
import { useHUD } from './hooks/use_hud';
import { useKeyboardShortcut } from './hooks/use_keyboard_shortcut';
import {
  NavigationContextProvider,
  useNavigationStack,
} from './hooks/use_navigation';
import { useRecentCommands } from './hooks/use_recent_commands';
import { useTheme } from './hooks/use_theme';
import { useToast } from './hooks/use_toast';
import { useWindow } from './hooks/use_window';
import { getCommand, getSections, searchCommands } from './registry';
import type { ListItemData, ListItemMetadataEntry, SectionData } from './types';
import { evaluate } from './utils/calculator';
import { fuzzyMatch } from './utils/fuzzy_search';

type NavViewData =
  | {
      type: 'command';
      commandId: string;
    }
  | {
      type: 'detail';
      item: ListItemData;
    };

const TRAY_COMMAND_MAP: Record<
  string,
  {
    id: string;
    name: string;
  }
> = {
  clipboard: {
    id: 'clipboard-history',
    name: 'Clipboard History',
  },
  snippets: {
    id: 'snippets',
    name: 'Snippets',
  },
  settings: {
    id: 'settings',
    name: 'Settings',
  },
  about: {
    id: 'settings',
    name: 'Settings',
  },
  'check-updates': {
    id: 'settings',
    name: 'Settings',
  },
};

function flattenItems(sections: SectionData[]): ListItemData[] {
  return sections.flatMap(s => s.items);
}

function renderMetadataEntry(entry: ListItemMetadataEntry, index: number) {
  switch (entry.type) {
    case 'label':
      return (
        <DetailMetadata.Label
          key={index}
          title={entry.title}
          text={entry.text}
        />
      );
    case 'link':
      return (
        <DetailMetadata.Link
          key={index}
          title={entry.title}
          text={entry.text}
          target={entry.target}
        />
      );
    case 'tag-list':
      return (
        <DetailMetadata.TagList key={index} title={entry.title}>
          {entry.tags.map(tag => (
            <DetailMetadata.Tag
              key={tag.text}
              text={tag.text}
              color={tag.color}
            />
          ))}
        </DetailMetadata.TagList>
      );
    case 'separator':
      return <DetailMetadata.Separator key={index} />;
  }
}

function SearchIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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

function DetailView({ item }: { item: ListItemData }) {
  const itemDetail = item.detail;
  if (!itemDetail) return null;
  return (
    <Detail
      markdown={itemDetail.markdown}
      metadata={
        itemDetail.metadata ? (
          <DetailMetadata>
            {itemDetail.metadata.map(renderMetadataEntry)}
          </DetailMetadata>
        ) : undefined
      }
    />
  );
}

export function App() {
  useTheme();
  const [query, setQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [quickLookOpen, setQuickLookOpen] = useState(false);
  const { toasts, show: showToast, hide: hideToast } = useToast();
  const { items: hudItems, show: showHUD } = useHUD();
  const { alertState, confirmAlert, dismiss: dismissAlert } = useAlert();
  const nav = useNavigationStack<NavViewData>('Raycast');
  const { push, popToRoot } = nav;
  const { favoriteIds, isFavorite, toggleFavorite, moveFavorite } =
    useFavorites();
  const { recentIds, addRecent } = useRecentCommands();

  const handleTrayNavigate = useCallback(
    (target: string) => {
      const mapping = TRAY_COMMAND_MAP[target];
      if (!mapping) return;

      const cmd = getCommand(mapping.id);
      if (!cmd?.component) return;

      popToRoot();
      setQuery('');
      setSelectedIndex(0);
      setActionsOpen(false);
      setQuickLookOpen(false);
      setFilterValue('all');

      addRecent(mapping.id);
      push(mapping.name, {
        type: 'command',
        commandId: mapping.id,
      });
    },
    [
      push,
      popToRoot,
      addRecent,
    ],
  );

  useWindow({
    onShow: () => {
      const input =
        document.querySelector<HTMLInputElement>('.search-bar__input');
      input?.focus();
    },
    onHide: () => {
      setQuery('');
      popToRoot();
      setActionsOpen(false);
      setQuickLookOpen(false);
      setSelectedIndex(0);
      setFilterValue('all');
    },
    onTrayNavigate: handleTrayNavigate,
  });

  const currentNavData = nav.currentEntry?.data;
  const isRoot = !currentNavData;
  const isFullView =
    currentNavData?.type === 'command' &&
    (getCommand(currentNavData.commandId)?.fullView ?? false);

  const searchFilterSections: SearchDropdownSection[] = useMemo(
    () => [
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
    ],
    [],
  );

  useEffect(() => {
    if (nav.stackDepth === 0) {
      setQuery('');
      setFilterValue('all');
      setSelectedIndex(0);
      setActionsOpen(false);
      setQuickLookOpen(false);
    }
  }, [nav.stackDepth]);

  const registrySections = useMemo(() => getSections(), []);

  const filtered = useMemo(() => {
    let sections = registrySections;
    if (filterValue === 'commands') {
      sections = sections.filter(
        s => s.title === 'Suggestions' || s.title === 'Commands',
      );
    } else if (filterValue === 'applications') {
      sections = sections.filter(s => s.title === 'Applications');
    }

    const result = query ? searchCommands(query) : sections;

    const filteredResult = query
      ? result
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
          .filter(s => s.items.length > 0)
      : result;

    const allFlatItems = registrySections.flatMap(s => s.items);
    const favoriteItems = favoriteIds
      .map(id => allFlatItems.find(item => item.id === id))
      .filter((item): item is ListItemData => !!item);

    if (query) {
      const filteredFavs = favoriteItems.filter(
        item =>
          fuzzyMatch(query, item.title) ||
          fuzzyMatch(query, item.subtitle ?? ''),
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
    query,
    filterValue,
    favoriteIds,
    recentIds,
    registrySections,
  ]);

  const calculatorResult = useMemo(() => {
    if (!isRoot || !query.trim()) return null;
    return evaluate(query);
  }, [
    query,
    isRoot,
  ]);

  const allItems = useMemo(() => {
    const items = flattenItems(filtered);
    if (calculatorResult) {
      const calcItem: ListItemData = {
        id: '__calculator__',
        title: `= ${calculatorResult}`,
        subtitle: query.trim(),
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
    query,
  ]);

  const selectedItem = isRoot ? allItems[selectedIndex] : undefined;

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
    { enabled: !isFullView },
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
    { enabled: isRoot && !!selectedItem },
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
      enabled: isRoot && !!selectedItem && isFavorite(selectedItem.id),
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
      enabled: isRoot && !!selectedItem && isFavorite(selectedItem.id),
    },
  );

  const openSettings = useCallback(() => {
    const settingsCmd = getCommand('settings');
    if (settingsCmd) {
      const isAlreadySettings =
        currentNavData?.type === 'command' &&
        currentNavData.commandId === 'settings';
      if (!isAlreadySettings) {
        push('Settings', {
          type: 'command',
          commandId: 'settings',
        });
        setQuery('');
        setSelectedIndex(0);
        setActionsOpen(false);
      }
    }
  }, [
    currentNavData,
    push,
  ]);

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
    { enabled: isRoot && !!selectedItem?.detail },
  );

  useEffect(() => {
    if (!isRoot || !selectedItem?.detail) return;

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
    isRoot,
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
    isRoot && allItems.length > 0 ? `list-item-${selectedIndex}` : undefined;

  const navDirectionClass =
    nav.direction === 'push'
      ? ' command-palette__nav-view--push'
      : nav.direction === 'pop'
        ? ' command-palette__nav-view--pop'
        : '';

  const contextLabel =
    nav.breadcrumbs.length > 0
      ? nav.breadcrumbs[nav.breadcrumbs.length - 1]!.label
      : 'Raycast';

  function renderCurrentView() {
    const entry = nav.currentEntry;
    if (!entry) return null;

    if (entry.data.type === 'command') {
      const cmd = getCommand(entry.data.commandId);
      if (cmd?.component) {
        const Component = cmd.component;
        return <Component />;
      }
      return null;
    }

    if (entry.data.type === 'detail') {
      return <DetailView item={entry.data.item} />;
    }

    return null;
  }

  const isCompact = isRoot && !query.trim();

  return (
    <NavigationContextProvider value={nav}>
      <CommandPalette isLoading compact={isCompact}>
        {!isFullView && (
          <SearchBar
            value={query}
            onChange={handleQueryChange}
            activeDescendantId={activeDescendantId}
            breadcrumbs={
              nav.breadcrumbs.length > 0 ? nav.breadcrumbs : undefined
            }
            dropdown={
              isRoot ? (
                <SearchDropdown
                  sections={searchFilterSections}
                  value={filterValue}
                  onChange={handleFilterChange}
                />
              ) : undefined
            }
          />
        )}
        <div
          className="command-palette__collapsible"
          aria-hidden={isCompact}
          inert={isCompact ? true : undefined}
        >
          <div className="command-palette__collapsible-inner">
            {isFullView && nav.currentEntry ? (
              <div
                key={nav.navKey}
                className={`command-palette__nav-view${navDirectionClass}`}
              >
                {renderCurrentView()}
              </div>
            ) : nav.currentEntry ? (
              <div
                key={nav.navKey}
                className={`command-palette__nav-view${navDirectionClass}`}
              >
                <div className="command-palette__body">
                  <div className="command-palette__list-container">
                    {renderCurrentView()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="command-palette__body">
                <div className="command-palette__list-container">
                  {allItems.length === 0 ? (
                    <EmptyState
                      icon={<SearchIcon />}
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
                                  subtitle={query.trim()}
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
                                      query={query || undefined}
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
            )}
            {!isFullView && (
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
            )}
          </div>
        </div>
        {!isFullView && quickLookOpen && selectedItem?.detail && (
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
        {!isFullView && alertState && (
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
        {!isFullView && <HUDContainer items={hudItems} />}
      </CommandPalette>
    </NavigationContextProvider>
  );
}
