import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionPanel } from './components/action_panel/action_panel';
import { CommandPalette } from './components/command_palette/command_palette';
import { Detail } from './components/detail/detail';
import { DetailMetadata } from './components/detail/detail_metadata';
import { EmptyState } from './components/empty_state/empty_state';
import { Grid, GridItem } from './components/grid';
import { Kbd } from './components/kbd/kbd';
import { List, ListItem, ListSection } from './components/list';
import type { BreadcrumbItem } from './components/search_bar/search_bar';
import { SearchBar } from './components/search_bar/search_bar';
import { ToastContainer } from './components/toast/toast_container';
import { MOCK_COLORS, MOCK_SECTIONS } from './data/mock_data';
import { useToast } from './hooks/use_toast';
import type {
  ColorItemData,
  ListItemData,
  ListItemMetadataEntry,
  SectionData,
} from './types';

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

type ViewMode = 'list' | 'grid';

export function App() {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [drilledItem, setDrilledItem] = useState<ListItemData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { toasts, show: showToast, hide: hideToast } = useToast();

  const filtered = useMemo(() => filterSections(MOCK_SECTIONS, query), [query]);
  const allItems = useMemo(() => flattenItems(filtered), [filtered]);
  const filteredColors = useMemo(
    () => filterColors(MOCK_COLORS, query),
    [query],
  );
  const selectedItem =
    viewMode === 'list' ? (drilledItem ?? allItems[selectedIndex]) : undefined;

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
    setActionsOpen(false);
  }, []);

  const handleActiveIndexChange = useCallback((index: number) => {
    setSelectedIndex(index);
    setActionsOpen(false);
  }, []);

  const handleDrillIn = useCallback(() => {
    const item = allItems[selectedIndex];
    if (item) {
      if (item.id === 'color-picker') {
        setViewMode('grid');
        setQuery('');
        setSelectedIndex(0);
        setActionsOpen(false);
        showToast({
          style: 'success',
          title: 'Opened Color Picker',
        });
      } else {
        setDrilledItem(item);
        setQuery('');
        setActionsOpen(false);
        showToast({
          style: 'success',
          title: `Opened ${item.title}`,
        });
      }
    }
  }, [
    allItems,
    selectedIndex,
    showToast,
  ]);

  const handleDrillBack = useCallback(() => {
    setDrilledItem(null);
    setViewMode('list');
    setQuery('');
    setSelectedIndex(0);
    setActionsOpen(false);
  }, []);

  const handleGridAction = useCallback(
    (index: number) => {
      const color = filteredColors[index];
      if (color) {
        showToast({
          style: 'info',
          title: 'Copied color',
          message: color.color,
        });
      }
    },
    [
      filteredColors,
      showToast,
    ],
  );

  const breadcrumbs: BreadcrumbItem[] | undefined =
    viewMode === 'grid'
      ? [
          {
            label: 'Raycast',
            onBack: handleDrillBack,
          },
          { label: 'Color Picker' },
        ]
      : drilledItem
        ? [
            {
              label: 'Raycast',
              onBack: handleDrillBack,
            },
            { label: drilledItem.title },
          ]
        : undefined;

  const toggleActions = useCallback(() => {
    setActionsOpen(prev => !prev);
  }, []);

  const closeActions = useCallback(() => {
    setActionsOpen(false);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && e.metaKey) {
        e.preventDefault();
        setActionsOpen(prev => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const detail = selectedItem?.detail;

  const dropdownActions = useMemo(
    () => [
      {
        label: 'Open',
        shortcut: <Kbd keys={['↵']} />,
        onClick: () => {
          if (selectedItem) {
            showToast({
              style: 'success',
              title: `Opened ${selectedItem.title}`,
            });
          }
        },
      },
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
            showToast({
              style: 'info',
              title: 'Copied to clipboard',
              message: selectedItem.title,
            });
          }
        },
      },
      {
        label: 'Show Detail',
        shortcut: (
          <Kbd
            keys={[
              '⌘',
              'D',
            ]}
          />
        ),
        onClick: () => {
          showToast({
            style: 'info',
            title: 'Detail panel toggled',
          });
        },
      },
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
          showToast({
            style: 'error',
            title: 'Cannot delete',
            message: 'This item is read-only',
          });
        },
      },
    ],
    [
      selectedItem,
      showToast,
    ],
  );

  const activeDescendantId =
    viewMode === 'grid'
      ? filteredColors.length > 0
        ? `grid-item-${selectedIndex}`
        : undefined
      : allItems.length > 0
        ? `list-item-${selectedIndex}`
        : undefined;

  return (
    <CommandPalette isLoading>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        activeDescendantId={activeDescendantId}
        breadcrumbs={breadcrumbs}
      />
      <div
        className={`command-palette__body${detail ? ' command-palette__body--has-detail' : ''}`}
      >
        <div className="command-palette__list-container">
          {viewMode === 'grid' ? (
            filteredColors.length === 0 ? (
              <EmptyState
                icon={<SearchIcon />}
                title="No Colors"
                description="Try a different search term"
              />
            ) : (
              <Grid
                itemCount={filteredColors.length}
                columns={4}
                onActiveIndexChange={handleActiveIndexChange}
                onAction={handleGridAction}
              >
                {filteredColors.map((color, index) => (
                  <GridItem
                    key={color.id}
                    index={index}
                    icon={<ColorSwatch color={color.color} />}
                    title={color.title}
                    subtitle={color.subtitle}
                  />
                ))}
              </Grid>
            )
          ) : allItems.length === 0 ? (
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
      <ActionPanel
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
        dropdownActions={dropdownActions}
        onDropdownClose={closeActions}
      />
      <ToastContainer toasts={toasts} onDismiss={hideToast} />
    </CommandPalette>
  );
}
