import { useCallback, useMemo, useState } from 'react';
import { ActionPanel } from './components/action_panel/action_panel';
import { CommandPalette } from './components/command_palette/command_palette';
import { Detail } from './components/detail/detail';
import { DetailMetadata } from './components/detail/detail_metadata';
import { EmptyState } from './components/empty_state/empty_state';
import { Kbd } from './components/kbd/kbd';
import { List, ListItem, ListSection } from './components/list';
import { SearchBar } from './components/search_bar/search_bar';
import { MOCK_SECTIONS } from './data/mock_data';
import type { ListItemData, ListItemMetadataEntry, SectionData } from './types';

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

export function App() {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = useMemo(() => filterSections(MOCK_SECTIONS, query), [query]);
  const allItems = useMemo(() => flattenItems(filtered), [filtered]);
  const selectedItem = allItems[selectedIndex];

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  }, []);

  const handleActiveIndexChange = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const detail = selectedItem?.detail;

  return (
    <CommandPalette>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        activeDescendantId={
          allItems.length > 0 ? `list-item-${selectedIndex}` : undefined
        }
      />
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
          },
        ]}
      />
    </CommandPalette>
  );
}
