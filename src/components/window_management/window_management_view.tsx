import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CATEGORY_LABELS,
  type LayoutCategory,
  WINDOW_LAYOUTS,
  getLayoutIcon,
} from '../../data/window_layouts_data';
import { SEARCH_DEBOUNCE_MS, useDebounce } from '../../hooks/use_debounce';
import { useHUD } from '../../hooks/use_hud';
import { useKeyboardShortcut } from '../../hooks/use_keyboard_shortcut';
import { useNavigation } from '../../hooks/use_navigation';
import { fuzzyMatch } from '../../utils/fuzzy_search';
import { ActionPanel } from '../action_panel/action_panel';
import { createCopyAction, performCopy } from '../action_panel/actions';
import type { DropdownSection } from '../action_panel/actions_dropdown';
import { EmptyState } from '../empty_state/empty_state';
import { HUDContainer } from '../hud/hud_container';
import { Kbd } from '../kbd/kbd';
import { List, ListItem, ListSection } from '../list';
import { LoadingBar } from '../loading_bar/loading_bar';
import { SearchBar } from '../search_bar/search_bar';
import type { SearchDropdownSection } from '../search_bar/search_dropdown';
import { SearchDropdown } from '../search_bar/search_dropdown';
import './window_management_view.scss';

function SearchEmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect
        x="8"
        y="10"
        width="32"
        height="24"
        rx="3"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <line
        x1="24"
        y1="10"
        x2="24"
        y2="34"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.4"
      />
    </svg>
  );
}

function ApplyHUDIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="4"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <rect
        x="4"
        y="5"
        width="8"
        height="12"
        rx="1"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  );
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
    options: [
      {
        label: 'Halves',
        value: 'halves',
      },
      {
        label: 'Thirds',
        value: 'thirds',
      },
      {
        label: 'Quarters',
        value: 'quarters',
      },
      {
        label: 'Other',
        value: 'other',
      },
    ],
  },
];

export function WindowManagementView() {
  const nav = useNavigation();
  const [query, setQuery] = useState('');
  const { debouncedValue: debouncedQuery, isPending: isSearchPending } =
    useDebounce(query, SEARCH_DEBOUNCE_MS);
  const [filterValue, setFilterValue] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const { items: hudItems, show: showHUD } = useHUD();

  const filtered = useMemo(() => {
    let items = WINDOW_LAYOUTS;
    if (filterValue !== 'all') {
      items = items.filter(l => l.category === filterValue);
    }
    if (debouncedQuery) {
      items = items.filter(l => fuzzyMatch(debouncedQuery, l.name));
    }
    return items;
  }, [
    debouncedQuery,
    filterValue,
  ]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<LayoutCategory, (typeof filtered)[number][]>();
    for (const item of filtered) {
      const group = map.get(item.category);
      if (group) {
        group.push(item);
      } else {
        map.set(item.category, [item]);
      }
    }
    return [...map.entries()].map(([category, items]) => ({
      category,
      items,
    }));
  }, [filtered]);

  const totalItemCount = filtered.length;

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

  const selectedLayout = filtered[selectedIndex];

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

  const handleApply = useCallback(() => {
    if (!selectedLayout) return;
    setActionsOpen(false);
    showHUD({
      icon: <ApplyHUDIcon />,
      title: `Applied ${selectedLayout.name}`,
    });
  }, [
    selectedLayout,
    showHUD,
  ]);

  const handleCopyName = useCallback(() => {
    if (!selectedLayout) return;
    setActionsOpen(false);
    performCopy(selectedLayout.name, showHUD);
  }, [
    selectedLayout,
    showHUD,
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
  useKeyboardShortcut(
    {
      key: 'c',
      meta: true,
    },
    handleCopyName,
  );
  useKeyboardShortcut(
    {
      key: 'l',
      meta: true,
    },
    handleCopyName,
  );

  const dropdownSections: DropdownSection[] = useMemo(
    () => [
      {
        title: 'Actions',
        actions: [
          {
            label: 'Apply Layout',
            shortcut: <Kbd keys={['↵']} />,
            onClick: handleApply,
          },
          createCopyAction(
            {
              content: selectedLayout?.name ?? '',
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
        ],
      },
    ],
    [
      selectedLayout?.name,
      handleApply,
      showHUD,
    ],
  );

  const activeDescendantId =
    totalItemCount > 0 ? `list-item-${selectedIndex}` : undefined;

  function renderLayoutItem(
    layout: (typeof WINDOW_LAYOUTS)[number],
    idx: number,
  ): ReactNode {
    return (
      <ListItem
        key={layout.id}
        index={idx}
        icon={getLayoutIcon(layout)}
        title={layout.name}
        accessories={[
          {
            tag: {
              text: CATEGORY_LABELS[layout.category],
              color:
                layout.category === 'halves'
                  ? 'blue'
                  : layout.category === 'thirds'
                    ? 'green'
                    : layout.category === 'quarters'
                      ? 'orange'
                      : 'purple',
            },
          },
          {
            icon: <Kbd keys={layout.shortcutKeys} />,
          },
        ]}
        query={debouncedQuery || undefined}
      />
    );
  }

  return (
    <>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        placeholder="Search Layouts..."
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
              title="No Layouts Found"
              description="Try a different search term or filter"
            />
          ) : (
            <List
              itemCount={totalItemCount}
              onActiveIndexChange={handleActiveIndexChange}
              onAction={handleApply}
            >
              {(() => {
                let globalIndex = 0;
                return groupedByCategory.map(group => (
                  <ListSection
                    key={group.category}
                    title={CATEGORY_LABELS[group.category]}
                  >
                    {group.items.map(layout =>
                      renderLayoutItem(layout, globalIndex++))}
                  </ListSection>
                ));
              })()}
            </List>
          )}
        </div>
      </div>
      <ActionPanel
        contextLabel="Window Management"
        actions={[
          {
            label: 'Apply Layout',
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
