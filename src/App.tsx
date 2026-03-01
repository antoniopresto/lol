import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionPanel } from './components/action_panel/action_panel';
import { Alert } from './components/alert/alert';
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
import { SearchBar } from './components/search_bar/search_bar';
import { ToastContainer } from './components/toast/toast_container';
import { MOCK_COLORS, MOCK_SECTIONS } from './data/mock_data';
import { useAlert } from './hooks/use_alert';
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
  | { type: 'form' }
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

interface CreateSnippetViewProps {
  onSubmit: (form: SnippetFormState) => void;
}

function CreateSnippetView({ onSubmit }: CreateSnippetViewProps) {
  const [snippetForm, setSnippetForm] =
    useState<SnippetFormState>(INITIAL_SNIPPET_FORM);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof SnippetFormState, string>>
  >({});

  const handleSubmit = useCallback(() => {
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
    onSubmit(snippetForm);
  }, [
    snippetForm,
    onSubmit,
  ]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter' && e.metaKey) {
        e.preventDefault();
        handleSubmit();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <Form onSubmit={handleSubmit}>
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const { toasts, show: showToast, hide: hideToast } = useToast();
  const { alertState, confirmAlert, dismiss: dismissAlert } = useAlert();
  const nav = useNavigationStack<NavViewData>('Raycast');
  const { push, pop } = nav;

  const viewType = nav.currentEntry?.data.type ?? 'root';

  useEffect(() => {
    if (nav.stackDepth === 0) {
      setQuery('');
      setSelectedIndex(0);
      setActionsOpen(false);
    }
  }, [nav.stackDepth]);

  const filtered = useMemo(() => filterSections(MOCK_SECTIONS, query), [query]);
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

  const handleActiveIndexChange = useCallback((index: number) => {
    setSelectedIndex(index);
    setActionsOpen(false);
  }, []);

  const handleCopyColor = useCallback(
    (color: ColorItemData) => {
      showToast({
        style: 'info',
        title: 'Copied color',
        message: color.color,
      });
    },
    [showToast],
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

  const handleSnippetSubmit = useCallback(
    (form: SnippetFormState) => {
      showToast({
        style: 'success',
        title: 'Snippet Created',
        message: form.name,
      });
      pop();
    },
    [
      showToast,
      pop,
    ],
  );

  const handleDrillIn = useCallback(() => {
    const item = allItems[selectedIndex];
    if (!item) return;

    setActionsOpen(false);

    if (item.id === 'color-picker') {
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

  const handleOpenCreateSnippet = useCallback(() => {
    setActionsOpen(false);
    push('Create Snippet', { type: 'form' });
    setQuery('');
    setSelectedIndex(0);
  }, [push]);

  const toggleActions = useCallback(() => {
    setActionsOpen(prev => !prev);
  }, []);

  const closeActions = useCallback(() => {
    setActionsOpen(false);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && e.metaKey && viewType !== 'form') {
        e.preventDefault();
        setActionsOpen(prev => !prev);
        return;
      }
      if (e.key === 'n' && e.metaKey && viewType === 'root') {
        e.preventDefault();
        handleOpenCreateSnippet();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    viewType,
    handleOpenCreateSnippet,
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
                style: 'info' as const,
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
                showToast({
                  style: 'info' as const,
                  title: 'Copied to clipboard',
                  message: selectedItem.title,
                });
              }
            },
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
      handleOpenCreateSnippet,
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
      case 'grid':
        return (
          <ColorPickerView
            colors={filteredColors}
            onActiveIndexChange={handleActiveIndexChange}
            onAction={handleGridAction}
          />
        );
      case 'form':
        return <CreateSnippetView onSubmit={handleSnippetSubmit} />;
      case 'detail':
        return <DetailView item={entry.data.item} />;
    }
  }

  return (
    <NavigationContextProvider value={nav}>
      <CommandPalette isLoading>
        <SearchBar
          value={query}
          onChange={handleQueryChange}
          activeDescendantId={activeDescendantId}
          breadcrumbs={nav.breadcrumbs.length > 0 ? nav.breadcrumbs : undefined}
        />
        {nav.currentEntry ? (
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
        <ActionPanel
          contextLabel={contextLabel}
          actions={
            viewType === 'form'
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
        <ToastContainer toasts={toasts} onDismiss={hideToast} />
      </CommandPalette>
    </NavigationContextProvider>
  );
}
