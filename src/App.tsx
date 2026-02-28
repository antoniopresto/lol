import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionPanel } from './components/action_panel/action_panel';
import { CommandPalette } from './components/command_palette/command_palette';
import { Detail } from './components/detail/detail';
import { DetailMetadata } from './components/detail/detail_metadata';
import { EmptyState } from './components/empty_state/empty_state';
import {
  Form,
  FormCheckbox,
  FormDatePicker,
  FormDropdown,
  FormTextArea,
  FormTextField,
} from './components/form';
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

type ViewMode = 'list' | 'grid' | 'form';

interface SnippetFormState {
  name: string;
  keyword: string;
  snippet: string;
  category: string;
  isShared: boolean;
  expiresAt: string;
}

const INITIAL_SNIPPET_FORM: SnippetFormState = {
  name: '',
  keyword: '',
  snippet: '',
  category: 'general',
  isShared: false,
  expiresAt: '',
};

const SNIPPET_CATEGORIES = [
  {
    label: 'General',
    value: 'general',
  },
  {
    label: 'Code',
    value: 'code',
  },
  {
    label: 'Email',
    value: 'email',
  },
  {
    label: 'Template',
    value: 'template',
  },
];

export function App() {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [drilledItem, setDrilledItem] = useState<ListItemData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [snippetForm, setSnippetForm] =
    useState<SnippetFormState>(INITIAL_SNIPPET_FORM);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof SnippetFormState, string>>
  >({});
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
    setSnippetForm(INITIAL_SNIPPET_FORM);
    setFormErrors({});
  }, []);

  const handleOpenCreateSnippet = useCallback(() => {
    setViewMode('form');
    setQuery('');
    setSelectedIndex(0);
    setActionsOpen(false);
    setSnippetForm(INITIAL_SNIPPET_FORM);
    setFormErrors({});
  }, []);

  const handleSubmitSnippet = useCallback(() => {
    const errors: Partial<Record<keyof SnippetFormState, string>> = {};
    if (!snippetForm.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!snippetForm.snippet.trim()) {
      errors.snippet = 'Snippet content is required';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    showToast({
      style: 'success',
      title: 'Snippet Created',
      message: snippetForm.name,
    });
    handleDrillBack();
  }, [
    snippetForm,
    showToast,
    handleDrillBack,
  ]);

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
    viewMode === 'form'
      ? [
          {
            label: 'Raycast',
            onBack: handleDrillBack,
          },
          { label: 'Create Snippet' },
        ]
      : viewMode === 'grid'
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
      if (e.key === 'k' && e.metaKey && viewMode !== 'form') {
        e.preventDefault();
        setActionsOpen(prev => !prev);
        return;
      }
      if (e.key === 'Enter' && e.metaKey && viewMode === 'form') {
        e.preventDefault();
        handleSubmitSnippet();
        return;
      }
      if (e.key === 'n' && e.metaKey && viewMode !== 'form') {
        e.preventDefault();
        handleOpenCreateSnippet();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    viewMode,
    handleSubmitSnippet,
    handleOpenCreateSnippet,
  ]);

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
        label: 'Create Snippet',
        shortcut: (
          <Kbd
            keys={[
              '⌘',
              'N',
            ]}
          />
        ),
        onClick: handleOpenCreateSnippet,
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
      handleOpenCreateSnippet,
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
          {viewMode === 'form' ? (
            <Form onSubmit={handleSubmitSnippet}>
              <FormTextField
                label="Name"
                value={snippetForm.name}
                onChange={v =>
                  setSnippetForm(prev => ({
                    ...prev,
                    name: v,
                  }))
                }
                placeholder="e.g. Email Signature"
                error={formErrors.name}
                autoFocus
              />
              <FormTextField
                label="Keyword"
                value={snippetForm.keyword}
                onChange={v =>
                  setSnippetForm(prev => ({
                    ...prev,
                    keyword: v,
                  }))
                }
                placeholder="e.g. !sig"
                description="Type this to expand the snippet"
              />
              <FormDropdown
                label="Category"
                value={snippetForm.category}
                onChange={v =>
                  setSnippetForm(prev => ({
                    ...prev,
                    category: v,
                  }))
                }
                options={SNIPPET_CATEGORIES}
                placeholder="Select a category"
              />
              <FormTextArea
                label="Snippet"
                value={snippetForm.snippet}
                onChange={v =>
                  setSnippetForm(prev => ({
                    ...prev,
                    snippet: v,
                  }))
                }
                placeholder="Enter your snippet content..."
                error={formErrors.snippet}
                rows={5}
              />
              <FormCheckbox
                label="Share with team"
                checked={snippetForm.isShared}
                onChange={v =>
                  setSnippetForm(prev => ({
                    ...prev,
                    isShared: v,
                  }))
                }
                description="Make this snippet available to your team members"
              />
              <FormDatePicker
                label="Expires"
                value={snippetForm.expiresAt}
                onChange={v =>
                  setSnippetForm(prev => ({
                    ...prev,
                    expiresAt: v,
                  }))
                }
                description="Optional expiration date"
              />
            </Form>
          ) : viewMode === 'grid' ? (
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
        actions={
          viewMode === 'form'
            ? [
                {
                  label: 'Submit',
                  shortcut: (
                    <Kbd
                      keys={[
                        '⌘',
                        '↵',
                      ]}
                    />
                  ),
                  onClick: handleSubmitSnippet,
                },
              ]
            : [
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
              ]
        }
        dropdownOpen={actionsOpen}
        dropdownActions={dropdownActions}
        onDropdownClose={closeActions}
      />
      <ToastContainer toasts={toasts} onDismiss={hideToast} />
    </CommandPalette>
  );
}
