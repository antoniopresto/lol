import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { TAG_COLOR_HEX, type TagColor } from '../../constants/tag_colors';
import type { SnippetCategory, SnippetEntry } from '../../data/snippet_data';
import {
  isSnippetCategory,
  MOCK_SNIPPET_ENTRIES,
  SNIPPET_CATEGORIES,
  SNIPPET_TAGS,
} from '../../data/snippet_data';
import { useAlert } from '../../hooks/use_alert';
import { useDbSearch } from '../../hooks/use_db_search';
import { useHUD } from '../../hooks/use_hud';
import { useKeyboardShortcut } from '../../hooks/use_keyboard_shortcut';
import { useNavigation } from '../../hooks/use_navigation';
import { isTauri } from '../../platform';
import type { SnippetRow } from '../../utils/database';
import { snippetDb } from '../../utils/database';
import { formatRelativeDate } from '../../utils/format_date';
import { fuzzyMatch } from '../../utils/fuzzy_search';
import { ActionPanel } from '../action_panel/action_panel';
import { createCopyAction, performCopy } from '../action_panel/actions';
import type { DropdownSection } from '../action_panel/actions_dropdown';
import { Alert } from '../alert/alert';
import { EmptyState } from '../empty_state/empty_state';
import {
  Form,
  FormDropdown,
  FormTagPicker,
  FormTextArea,
  FormTextField,
} from '../form';
import { HUDContainer } from '../hud/hud_container';
import { Kbd } from '../kbd/kbd';
import { List, ListItem, ListSection } from '../list';
import { SearchBar } from '../search_bar/search_bar';
import type { SearchDropdownSection } from '../search_bar/search_dropdown';
import { SearchDropdown } from '../search_bar/search_dropdown';
import './snippet_manager_view.scss';

function SnippetHUDIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="3"
        y="2"
        width="10"
        height="12"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <polyline
        points="6,6 7.5,7.5 6,9"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="9"
        y1="9"
        x2="11"
        y2="9"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
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

function truncateContent(content: string, maxLength: number): string {
  const singleLine = content.replace(/\n/g, ' ');
  if (singleLine.length <= maxLength) return singleLine;
  return singleLine.slice(0, maxLength) + '\u2026';
}

const TAG_COLOR_NAMES = new Set<string>(Object.keys(TAG_COLOR_HEX));

function isTagColor(value: string): value is TagColor {
  return TAG_COLOR_NAMES.has(value);
}

function rowToEntry(row: SnippetRow): SnippetEntry {
  const parsed = new Date(row.created_at);
  const createdAt = isNaN(parsed.getTime()) ? new Date() : parsed;

  let tags: SnippetEntry['tags'] = [];
  try {
    const raw = JSON.parse(row.tags);
    if (Array.isArray(raw)) {
      tags = raw.map((t: {
        text?: string;
        color?: string;
      }) => ({
        text: typeof t.text === 'string' ? t.text : '',
        color:
          typeof t.color === 'string' && isTagColor(t.color)
            ? t.color
            : undefined,
      }));
    }
  } catch {
    // empty
  }

  return {
    id: row.id,
    name: row.name,
    keyword: row.keyword,
    content: row.content,
    category: isSnippetCategory(row.category) ? row.category : 'general',
    tags,
    createdAt,
  };
}

function entryToRow(entry: SnippetEntry): SnippetRow {
  return {
    id: entry.id,
    name: entry.name,
    keyword: entry.keyword,
    content: entry.content,
    category: entry.category,
    tags: JSON.stringify(entry.tags),
    created_at: entry.createdAt.toISOString(),
  };
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
    options: SNIPPET_CATEGORIES.map(c => ({
      label: c.label,
      value: c.value,
    })),
  },
];

interface SnippetFormState {
  name: string;
  keyword: string;
  snippet: string;
  category: SnippetCategory;
  tags: string[];
}

const INITIAL_SNIPPET_FORM: SnippetFormState = {
  name: '',
  keyword: '',
  snippet: '',
  category: 'general',
  tags: [],
};

const FORM_TAG_OPTIONS = SNIPPET_TAGS.map(t => ({
  label: t.label,
  value: t.value,
}));

const FORM_CATEGORY_OPTIONS = SNIPPET_CATEGORIES.map(c => ({
  label: c.label,
  value: c.value,
}));

interface EditSnippetViewProps {
  snippet?: SnippetEntry;
  onSubmit: (form: SnippetFormState) => void;
}

function EditSnippetView({ snippet, onSubmit }: EditSnippetViewProps) {
  const [form, setForm] = useState<SnippetFormState>(() => {
    if (snippet) {
      return {
        name: snippet.name,
        keyword: snippet.keyword,
        snippet: snippet.content,
        category: snippet.category,
        tags: snippet.tags.map(t => t.text.toLowerCase()),
      };
    }
    return INITIAL_SNIPPET_FORM;
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SnippetFormState, string>>
  >({});

  const handleSubmit = useCallback(() => {
    const newErrors: Partial<Record<keyof SnippetFormState, string>> = {};
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!form.snippet.trim()) {
      newErrors.snippet = 'Snippet content is required';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit(form);
  }, [
    form,
    onSubmit,
  ]);

  useKeyboardShortcut(
    {
      key: 'Enter',
      meta: true,
    },
    handleSubmit,
  );

  return (
    <Form onSubmit={handleSubmit}>
      <FormTextField
        label="Name"
        value={form.name}
        onChange={v =>
          setForm(prev => ({
            ...prev,
            name: v,
          }))
        }
        placeholder="e.g. Email Signature"
        error={errors.name}
        autoFocus
      />
      <FormTextField
        label="Keyword"
        value={form.keyword}
        onChange={v =>
          setForm(prev => ({
            ...prev,
            keyword: v,
          }))
        }
        placeholder="e.g. !sig"
        description="Type this to expand the snippet"
      />
      <FormDropdown
        label="Category"
        value={form.category}
        onChange={v => {
          if (isSnippetCategory(v)) {
            setForm(prev => ({
              ...prev,
              category: v,
            }));
          }
        }}
        options={FORM_CATEGORY_OPTIONS}
        placeholder="Select a category"
      />
      <FormTagPicker
        label="Tags"
        value={form.tags}
        onChange={v =>
          setForm(prev => ({
            ...prev,
            tags: v,
          }))
        }
        options={FORM_TAG_OPTIONS}
        placeholder="Add tags..."
        description="Categorize your snippet with tags"
      />
      <FormTextArea
        label="Snippet"
        value={form.snippet}
        onChange={v =>
          setForm(prev => ({
            ...prev,
            snippet: v,
          }))
        }
        placeholder="Enter your snippet content..."
        error={errors.snippet}
        rows={5}
      />
    </Form>
  );
}

type SnippetSubView = 'list' | 'create' | 'edit';

export function SnippetManagerView() {
  const nav = useNavigation();
  const [entries, setEntries] = useState<SnippetEntry[]>([]);
  const [query, setQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [subView, setSubView] = useState<SnippetSubView>('list');
  const [editingSnippet, setEditingSnippet] = useState<
    SnippetEntry | undefined
  >();
  const { items: hudItems, show: showHUD } = useHUD();
  const { alertState, confirmAlert, dismiss: dismissAlert } = useAlert();
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    let aborted = false;

    snippetDb
      .getAll()
      .then(rows => {
        if (aborted) return;
        if (rows.length > 0) {
          setEntries(rows.map(rowToEntry));
        } else if (!isTauri) {
          const mock = MOCK_SNIPPET_ENTRIES.map(e => ({ ...e }));
          setEntries(mock);
          Promise.all(mock.map(e => snippetDb.insert(entryToRow(e)))).catch(
            console.error,
          );
        }
      })
      .catch(err => {
        console.error('Failed to load snippets:', err);
        if (!isTauri && !aborted) {
          setEntries(MOCK_SNIPPET_ENTRIES.map(e => ({ ...e })));
        }
      });

    return () => {
      aborted = true;
    };
  }, []);

  const dbSearchFn = useCallback((q: string) => snippetDb.search(q), []);
  const { results: ftsResults, invalidate: invalidateFts } = useDbSearch(
    query,
    dbSearchFn,
    rowToEntry,
  );

  const filtered = useMemo(() => {
    let items = ftsResults ?? entries;
    if (filterValue !== 'all') {
      items = items.filter(e => e.category === filterValue);
    }
    if (!ftsResults && query) {
      items = items.filter(
        e =>
          fuzzyMatch(query, e.name) ||
          fuzzyMatch(query, e.keyword) ||
          fuzzyMatch(query, e.content),
      );
    }
    return items;
  }, [
    entries,
    query,
    filterValue,
    ftsResults,
  ]);

  const groupedByCategory = useMemo(() => {
    const groups: {
      title: string;
      items: SnippetEntry[];
    }[] = [];
    const categoryOrder = [
      'code',
      'email',
      'template',
      'general',
    ] as const;
    const categoryLabels: Record<string, string> = {
      code: 'Code',
      email: 'Email',
      template: 'Template',
      general: 'General',
    };

    for (const cat of categoryOrder) {
      const items = filtered.filter(e => e.category === cat);
      if (items.length > 0) {
        groups.push({
          title: categoryLabels[cat]!,
          items,
        });
      }
    }
    return groups;
  }, [filtered]);

  const flatItems = useMemo(
    () => groupedByCategory.flatMap(g => g.items),
    [groupedByCategory],
  );
  const totalItemCount = flatItems.length;

  useEffect(() => {
    if (totalItemCount === 0) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(prev =>
        prev >= totalItemCount ? totalItemCount - 1 : prev);
    }
  }, [totalItemCount]);

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

  const handleInsert = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    showHUD({
      icon: <SnippetHUDIcon />,
      title: 'Inserted Snippet',
    });
  }, [
    selectedEntry,
    showHUD,
  ]);

  const handleCopy = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    performCopy(selectedEntry.content, showHUD, {
      hudIcon: <SnippetHUDIcon />,
    });
  }, [
    selectedEntry,
    showHUD,
  ]);

  const handleEdit = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    setEditingSnippet(selectedEntry);
    setSubView('edit');
  }, [selectedEntry]);

  const handleCreate = useCallback(() => {
    setActionsOpen(false);
    setEditingSnippet(undefined);
    setSubView('create');
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedEntry) return;
    const entryId = selectedEntry.id;
    const entryName = selectedEntry.name;
    setActionsOpen(false);
    confirmAlert({
      title: `Delete "${entryName}"?`,
      message: 'This snippet will be permanently deleted.',
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
          setEntries(prev => prev.filter(e => e.id !== entryId));
          snippetDb.delete(entryId).catch(console.error);
          invalidateFts();
          showHUD({
            icon: <SnippetHUDIcon />,
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
    invalidateFts,
  ]);

  const handleFormSubmit = useCallback(
    (form: SnippetFormState) => {
      const tags = form.tags.map(t => {
        const found = SNIPPET_TAGS.find(st => st.value === t);
        return {
          text: found?.label ?? t,
          color: found?.color,
        };
      });

      if (subView === 'edit' && editingSnippet) {
        const updatedEntry = {
          ...editingSnippet,
          name: form.name,
          keyword: form.keyword,
          content: form.snippet,
          category: form.category,
          tags,
        };
        setEntries(prev =>
          prev.map(e => (e.id === editingSnippet.id ? updatedEntry : e)));
        snippetDb
          .update(editingSnippet.id, {
            name: form.name,
            keyword: form.keyword,
            content: form.snippet,
            category: form.category,
            tags: JSON.stringify(tags),
          })
          .catch(console.error);
        invalidateFts();
        showHUD({
          icon: <SnippetHUDIcon />,
          title: 'Snippet Updated',
        });
      } else {
        const newEntry: SnippetEntry = {
          id: crypto.randomUUID(),
          name: form.name,
          keyword: form.keyword,
          content: form.snippet,
          category: form.category,
          tags,
          createdAt: new Date(),
        };
        setEntries(prev => [
          newEntry,
          ...prev,
        ]);
        snippetDb.insert(entryToRow(newEntry)).catch(console.error);
        invalidateFts();
        showHUD({
          icon: <SnippetHUDIcon />,
          title: 'Snippet Created',
        });
      }
      setSubView('list');
      setEditingSnippet(undefined);
    },
    [
      subView,
      editingSnippet,
      showHUD,
      invalidateFts,
    ],
  );

  const toggleActions = useCallback(() => {
    setActionsOpen(prev => !prev);
  }, []);

  const closeActions = useCallback(() => {
    setActionsOpen(false);
  }, []);

  const handleEscape = useCallback(() => {
    if (subView !== 'list') {
      setSubView('list');
      setEditingSnippet(undefined);
    }
  }, [subView]);

  useKeyboardShortcut(
    {
      key: 'k',
      meta: true,
    },
    toggleActions,
    {
      enabled: subView === 'list',
    },
  );
  useKeyboardShortcut(
    {
      key: 'c',
      meta: true,
    },
    handleCopy,
    {
      enabled: subView === 'list',
    },
  );
  useKeyboardShortcut(
    {
      key: 'l',
      meta: true,
    },
    handleCopy,
    {
      enabled: subView === 'list',
    },
  );
  useKeyboardShortcut(
    {
      key: 'n',
      meta: true,
    },
    handleCreate,
    {
      enabled: subView === 'list',
    },
  );
  useKeyboardShortcut(
    {
      key: 'e',
      meta: true,
    },
    handleEdit,
    {
      enabled: subView === 'list',
    },
  );
  useKeyboardShortcut(
    {
      key: 'Backspace',
      meta: true,
    },
    handleDelete,
    {
      enabled: subView === 'list',
    },
  );
  useKeyboardShortcut({ key: 'Escape' }, handleEscape, {
    enabled: subView !== 'list',
    preventDefault: false,
  });

  const dropdownSections: DropdownSection[] = useMemo(
    () => [
      {
        title: 'Actions',
        actions: [
          {
            label: 'Insert',
            shortcut: <Kbd keys={['↵']} />,
            onClick: handleInsert,
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
              hudIcon: <SnippetHUDIcon />,
            },
            showHUD,
          ),
          {
            label: 'Edit',
            shortcut: (
              <Kbd
                keys={[
                  '⌘',
                  'E',
                ]}
              />
            ),
            onClick: handleEdit,
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
            onClick: handleCreate,
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
    ],
    [
      selectedEntry?.content,
      handleInsert,
      handleEdit,
      handleCreate,
      handleDelete,
      showHUD,
    ],
  );

  const activeDescendantId =
    totalItemCount > 0 ? `list-item-${selectedIndex}` : undefined;

  if (subView !== 'list') {
    const formTitle = subView === 'edit' ? 'Edit Snippet' : 'Create Snippet';
    return (
      <>
        <SearchBar
          value=""
          onChange={() => {}}
          placeholder={formTitle}
          breadcrumbs={[
            ...nav.breadcrumbs,
            {
              label: 'Snippets',
              onBack: handleEscape,
            },
          ]}
        />
        <div className="command-palette__body">
          <div className="command-palette__list-container">
            <EditSnippetView
              snippet={subView === 'edit' ? editingSnippet : undefined}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
        <ActionPanel
          contextLabel={formTitle}
          actions={[
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
          ]}
          dropdownOpen={false}
          dropdownSections={[]}
          onDropdownClose={() => {}}
        />
        <HUDContainer items={hudItems} />
      </>
    );
  }

  return (
    <>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        placeholder="Search Snippets..."
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
      <div className="command-palette__body">
        <div className="command-palette__list-container">
          {totalItemCount === 0 ? (
            <EmptyState
              icon={<SearchEmptyIcon />}
              title="No Snippets"
              description={
                query
                  ? 'Try a different search term'
                  : 'Create your first snippet with ⌘N'
              }
            />
          ) : (
            <List
              itemCount={totalItemCount}
              onActiveIndexChange={handleActiveIndexChange}
              onAction={handleInsert}
            >
              {(() => {
                let globalIndex = 0;
                const sections: ReactNode[] = [];

                for (const group of groupedByCategory) {
                  sections.push(
                    <ListSection key={group.title} title={group.title}>
                      {group.items.map(entry => {
                        const idx = globalIndex++;
                        return (
                          <ListItem
                            key={entry.id}
                            index={idx}
                            icon={<SnippetHUDIcon />}
                            title={entry.name}
                            subtitle={truncateContent(entry.content, 50)}
                            accessories={[
                              ...(entry.keyword
                                ? [
                                    {
                                      tag: {
                                        text: entry.keyword,
                                        color: 'purple' as const,
                                      },
                                    },
                                  ]
                                : []),
                              ...entry.tags.map(t => ({
                                tag: {
                                  text: t.text,
                                  color: t.color,
                                },
                              })),
                              {
                                text: formatRelativeDate(entry.createdAt, now),
                                tooltip: entry.createdAt.toLocaleString(),
                              },
                            ]}
                            query={query || undefined}
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
        contextLabel="Snippets"
        actions={[
          {
            label: 'Insert',
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
