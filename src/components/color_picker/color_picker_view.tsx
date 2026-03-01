import { useCallback, useMemo, useState } from 'react';
import { MOCK_COLORS } from '../../data/color_data';
import { useHUD } from '../../hooks/use_hud';
import { useKeyboardShortcut } from '../../hooks/use_keyboard_shortcut';
import type { ColorItemData } from '../../types';
import { ActionPanel } from '../action_panel/action_panel';
import {
  ClipboardHUDIcon,
  createCopyAction,
  performCopy,
} from '../action_panel/actions';
import type { DropdownSection } from '../action_panel/actions_dropdown';
import { EmptyState } from '../empty_state/empty_state';
import { Grid, GridItem } from '../grid';
import { HUDContainer } from '../hud/hud_container';
import { Kbd } from '../kbd/kbd';
import { SearchBar } from '../search_bar/search_bar';
import type { SearchDropdownSection } from '../search_bar/search_dropdown';
import { SearchDropdown } from '../search_bar/search_dropdown';
import './color_picker_view.scss';

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

function ColorSwatch({ color }: { color: string }) {
  return (
    <div
      className="grid-item__color-swatch"
      style={{ backgroundColor: color }}
    />
  );
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

const colorFilterSections: SearchDropdownSection[] = [
  {
    options: [
      {
        label: 'All Colors',
        value: 'all',
      },
    ],
  },
  {
    title: 'Category',
    options: [
      {
        label: 'Warm',
        value: 'warm',
      },
      {
        label: 'Cool',
        value: 'cool',
      },
      {
        label: 'Neutral',
        value: 'neutral',
      },
    ],
  },
];

export function ColorPickerView() {
  const [query, setQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const { items: hudItems, show: showHUD } = useHUD();

  const filteredColors = useMemo(() => {
    let colors: ColorItemData[] = MOCK_COLORS;
    if (filterValue !== 'all') {
      colors = colors.filter(c => c.category === filterValue);
    }
    return filterColors(colors, query);
  }, [
    query,
    filterValue,
  ]);

  const selectedColor = filteredColors[selectedIndex];

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
      performCopy(color.color, showHUD, {
        hudIcon: <ClipboardHUDIcon />,
        hudTitle: `Copied ${color.color}`,
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

  const dropdownSections: DropdownSection[] = useMemo(
    () => [
      {
        title: 'Actions',
        actions: [
          {
            label: 'Copy Color',
            shortcut: <Kbd keys={['↵']} />,
            onClick: () => {
              if (selectedColor) {
                setActionsOpen(false);
                handleCopyColor(selectedColor);
              }
            },
          },
          createCopyAction(
            {
              content: selectedColor?.color ?? '',
              title: 'Copy Hex',
              shortcut: (
                <Kbd
                  keys={[
                    '⌘',
                    'C',
                  ]}
                />
              ),
              hudIcon: <ClipboardHUDIcon />,
              hudTitle: selectedColor
                ? `Copied ${selectedColor.color}`
                : 'Copied',
            },
            showHUD,
          ),
        ],
      },
    ],
    [
      selectedColor,
      handleCopyColor,
      showHUD,
    ],
  );

  const activeDescendantId =
    filteredColors.length > 0 ? `grid-item-${selectedIndex}` : undefined;

  return (
    <>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        activeDescendantId={activeDescendantId}
        dropdown={
          <SearchDropdown
            sections={colorFilterSections}
            value={filterValue}
            onChange={handleFilterChange}
          />
        }
      />
      <div className="color-picker__body">
        {filteredColors.length === 0 ? (
          <EmptyState
            icon={<SearchIcon />}
            title="No Colors"
            description="Try a different search term"
          />
        ) : (
          <Grid
            key={filterValue}
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
        )}
      </div>
      <ActionPanel
        contextLabel="Color Picker"
        actions={[
          {
            label: 'Copy Color',
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
