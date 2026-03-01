import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionPanel } from './components/action_panel/action_panel';
import { Alert } from './components/alert/alert';
import { ClipboardHistoryView } from './components/clipboard_history/clipboard_history_view';
import { CommandPalette } from './components/command_palette/command_palette';
import { Detail } from './components/detail/detail';
import { DetailMetadata } from './components/detail/detail_metadata';
import { EmptyState } from './components/empty_state/empty_state';
import { Grid, GridItem } from './components/grid';
import { HUDContainer } from './components/hud/hud_container';
import { Kbd } from './components/kbd/kbd';
import { List, ListItem, ListSection } from './components/list';
import { QuickLook } from './components/quick_look/quick_look';
import { SearchBar } from './components/search_bar/search_bar';
import type { SearchDropdownSection } from './components/search_bar/search_dropdown';
import { SearchDropdown } from './components/search_bar/search_dropdown';
import { SnippetManagerView } from './components/snippet_manager/snippet_manager_view';
import { ToastContainer } from './components/toast/toast_container';
import { MOCK_COLORS, MOCK_SECTIONS } from './data/mock_data';
import { useAlert } from './hooks/use_alert';
import { useHUD } from './hooks/use_hud';
import { useKeyboardShortcut } from './hooks/use_keyboard_shortcut';
import {
  NavigationContextProvider,
  useNavigationStack,
} from './hooks/use_navigation';
import { useToast } from './hooks/use_toast';
import type {
  ColorItemData,
  ListItemData,
  ListItemMetadataEntry,
  SectionData,
} from './types';

type NavViewData =
  | { type: 'grid' }
  | { type: 'clipboard' }
  | { type: 'snippets' }
  | {
      type: 'detail';
      item: ListItemData;
    };

function filterSections(sections: SectionData[], query: string): SectionData[] {
  if (!query) return sections;
  const lower = query.toLowerCase();
  return sections
    .map(section => ({
      ...section,
      items: section.items.filter(
        item =>
          item.title.toLowerCase().includes(lower) ||
          item.subtitle?.toLowerCase().includes(lower),
      ),
    }))
    .filter(section => section.items.length > 0);
}

function filterColors(colors: ColorItemData[], query: string): ColorItemData[] {
  if (!query) return colors;
  const lower = query.toLowerCase();
  return colors.filter(
    c =>
      c.title.toLowerCase().includes(lower) ||
      c.subtitle?.toLowerCase().includes(lower),
  );
}

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

function ColorSwatch({ color }: { color: string }) {
  return (
    <div
      className="grid-item__color-swatch"
      style={{ backgroundColor: color }}
    />
  );
}

function CheckIcon() {
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

function ClipboardHUDIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="4"
        y="2"
        width="8"
        height="12"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6 2.5H10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
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

interface ColorPickerViewProps {
  colors: ColorItemData[];
  onActiveIndexChange: (index: number) => void;
  onAction: (index: number) => void;
}

function ColorPickerView({
  colors,
  onActiveIndexChange,
  onAction,
}: ColorPickerViewProps) {
  if (colors.length === 0) {
    return (
      <EmptyState
        icon={<SearchIcon />}
        title="No Colors"
        description="Try a different search term"
      />
    );
  }

  return (
    <Grid
      itemCount={colors.length}
      columns={4}
      onActiveIndexChange={onActiveIndexChange}
      onAction={onAction}
    >
      {colors.map((color, index) => (
        <GridItem
          key={color.id}
          index={index}
          icon={<ColorSwatch color={color.color} />}
          title={color.title}
          subtitle={color.subtitle}
        />
      ))}
    </Grid>
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
  const [query, setQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [quickLookOpen, setQuickLookOpen] = useState(false);
  const { toasts, show: showToast, hide: hideToast } = useToast();
  const { items: hudItems, show: showHUD } = useHUD();
  const { alertState, confirmAlert, dismiss: dismissAlert } = useAlert();
  const nav = useNavigationStack<NavViewData>('Raycast');
  const { push } = nav;

  const viewType = nav.currentEntry?.data.type ?? 'root';

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

  const filtered = useMemo(() => {
    let sections = MOCK_SECTIONS;
    if (filterValue === 'commands') {
      sections = sections.filter(
        s => s.title === 'Suggestions' || s.title === 'Commands',
      );
    } else if (filterValue === 'applications') {
      sections = sections.filter(s => s.title === 'Applications');
    }
    return filterSections(sections, query);
  }, [
    query,
    filterValue,
  ]);
  const allItems = useMemo(() => flattenItems(filtered), [filtered]);
  const filteredColors = useMemo(
    () => filterColors(MOCK_COLORS, query),
    [query],
  );

  const selectedItem =
    viewType === 'root' ? allItems[selectedIndex] : undefined;

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

  const handleCopyColor = useCallback(
    (color: ColorItemData) => {
      showHUD({
        icon: <ClipboardHUDIcon />,
        title: `Copied ${color.color}`,
      });
    },
    [showHUD],
  );

  const handleGridAction = useCallback(
    (index: number) => {
      const color = filteredColors[index];
      if (color) {
        handleCopyColor(color);
      }
    },
    [
      filteredColors,
      handleCopyColor,
    ],
  );

  const handleDrillIn = useCallback(() => {
    const item = allItems[selectedIndex];
    if (!item) return;

    setActionsOpen(false);

    if (item.id === 'clipboard-history') {
      push('Clipboard History', { type: 'clipboard' });
      setQuery('');
      setSelectedIndex(0);
    } else if (item.id === 'snippets') {
      push('Snippets', { type: 'snippets' });
      setQuery('');
      setSelectedIndex(0);
    } else if (item.id === 'color-picker') {
      push('Color Picker', { type: 'grid' });
      setQuery('');
      setSelectedIndex(0);
      showToast({
        style: 'success',
        title: 'Opened Color Picker',
      });
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
    push,
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
    {
      enabled: viewType !== 'clipboard' && viewType !== 'snippets',
    },
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
    { enabled: viewType === 'root' && !!selectedItem?.detail },
  );

  useEffect(() => {
    if (viewType !== 'root' || !selectedItem?.detail) return;

    function handleSpaceBar(e: KeyboardEvent) {
      if (
      e.key !== ' ' ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey
      ) {
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
    viewType,
    selectedItem?.detail,
    query,
  ]);

  const detail = selectedItem?.detail;

  const dropdownSections = useMemo(
    () => [
      {
        title: 'Primary Actions',
        actions: [
          {
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
        ],
      },
      {
        title: 'Copy Actions',
        actions: [
          {
            label: 'Copy Name',
            shortcut: (
              <Kbd
                keys={[
                  '⌘',
                  'C',
                ]}
              />
            ),
            onClick: () => {
              if (selectedItem) {
                showHUD({
                  icon: <CheckIcon />,
                  title: 'Copied to Clipboard',
                });
              }
            },
          },
          {
            label: 'Copy As...',
            submenu: [
              {
                actions: [
                  {
                    label: 'Copy as Markdown',
                    onClick: () => {
                      if (selectedItem) {
                        showHUD({
                          icon: <CheckIcon />,
                          title: 'Copied as Markdown',
                        });
                      }
                    },
                  },
                  {
                    label: 'Copy as JSON',
                    onClick: () => {
                      if (selectedItem) {
                        showHUD({
                          icon: <CheckIcon />,
                          title: 'Copied as JSON',
                        });
                      }
                    },
                  },
                  {
                    label: 'Copy as Plain Text',
                    onClick: () => {
                      if (selectedItem) {
                        showHUD({
                          icon: <CheckIcon />,
                          title: 'Copied as Plain Text',
                        });
                      }
                    },
                  },
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
      showToast,
      showHUD,
      confirmAlert,
    ],
  );

  const activeDescendantId =
    viewType === 'root' && allItems.length > 0
      ? `list-item-${selectedIndex}`
      : viewType === 'grid' && filteredColors.length > 0
        ? `grid-item-${selectedIndex}`
        : undefined;

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

    switch (entry.data.type) {
      case 'clipboard':
        return <ClipboardHistoryView />;
      case 'snippets':
        return <SnippetManagerView />;
      case 'grid':
        return (
          <ColorPickerView
            colors={filteredColors}
            onActiveIndexChange={handleActiveIndexChange}
            onAction={handleGridAction}
          />
        );
      case 'detail':
        return <DetailView item={entry.data.item} />;
    }
  }

  const isFullView = viewType === 'clipboard' || viewType === 'snippets';

  return (
    <NavigationContextProvider value={nav}>
      <CommandPalette isLoading>
        {!isFullView && (
          <SearchBar
            value={query}
            onChange={handleQueryChange}
            activeDescendantId={activeDescendantId}
            breadcrumbs={
              nav.breadcrumbs.length > 0 ? nav.breadcrumbs : undefined
            }
            dropdown={
              viewType === 'root' ? (
                <SearchDropdown
                  sections={searchFilterSections}
                  value={filterValue}
                  onChange={handleFilterChange}
                />
              ) : undefined
            }
          />
        )}
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
          <div
            className={`command-palette__body${detail ? ' command-palette__body--has-detail' : ''}`}
          >
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
                >
                  {(() => {
                    let globalIndex = 0;
                    return filtered.map(section => (
                      <ListSection key={section.title} title={section.title}>
                        {section.items.map(item => {
                          const idx = globalIndex++;
                          return (
                            <ListItem
                              key={item.id}
                              index={idx}
                              title={item.title}
                              subtitle={item.subtitle}
                              icon={item.icon}
                              accessories={item.accessories}
                            />
                          );
                        })}
                      </ListSection>
                    ));
                  })()}
                </List>
              )}
            </div>
            {detail && (
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
            )}
          </div>
        )}
        {!isFullView && (
          <ActionPanel
            contextLabel={contextLabel}
            actions={[
              {
                label: 'Open',
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
