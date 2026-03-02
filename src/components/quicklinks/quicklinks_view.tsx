import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { TAG_COLOR_HEX, type TagColor } from '../../constants/tag_colors';
import type { QuicklinkEntry, QuicklinkType } from '../../data/quicklinks_data';
import {
  MOCK_QUICKLINKS,
  QUICKLINK_TYPE_LABELS,
  getQuicklinkIcon,
} from '../../data/quicklinks_data';
import { useAlert } from '../../hooks/use_alert';
import { useDbSearch } from '../../hooks/use_db_search';
import { SEARCH_DEBOUNCE_MS, useDebounce } from '../../hooks/use_debounce';
import { useHUD } from '../../hooks/use_hud';
import { useKeyboardShortcut } from '../../hooks/use_keyboard_shortcut';
import { useNavigation } from '../../hooks/use_navigation';
import { isTauri } from '../../platform';
import type { QuicklinkRow } from '../../utils/database';
import { quicklinkDb } from '../../utils/database';
import { formatRelativeDate } from '../../utils/format_date';
import { fuzzyMatch } from '../../utils/fuzzy_search';
import { openDeepLink, openUrl } from '../../utils/open_url';
import { ActionPanel } from '../action_panel/action_panel';
import {
  OpenInBrowserHUDIcon,
  createCopyAction,
  performCopy,
} from '../action_panel/actions';
import type { DropdownSection } from '../action_panel/actions_dropdown';
import { Alert } from '../alert/alert';
import { EmptyState } from '../empty_state/empty_state';
import { Form, FormDropdown, FormTextField } from '../form';
import { HUDContainer } from '../hud/hud_container';
import { Kbd } from '../kbd/kbd';
import { List, ListItem, ListSection } from '../list';
import { LoadingBar } from '../loading_bar/loading_bar';
import { SearchBar } from '../search_bar/search_bar';
import type { SearchDropdownSection } from '../search_bar/search_dropdown';
import { SearchDropdown } from '../search_bar/search_dropdown';
import './quicklinks_view.scss';

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

function QuicklinkHUDIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M6.5 9.5l3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 7l1.5-1.5a1.75 1.75 0 012.5 2.5L11.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M7 9l-1.5 1.5a1.75 1.75 0 002.5 2.5L9.5 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const TAG_COLOR_NAMES = new Set<string>(Object.keys(TAG_COLOR_HEX));

function isTagColor(value: string): value is TagColor {
  return TAG_COLOR_NAMES.has(value);
}

function isQuicklinkType(value: string): value is QuicklinkType {
  return value === 'url' || value === 'file' || value === 'deeplink';
}

function rowToEntry(row: QuicklinkRow): QuicklinkEntry {
  const parsed = new Date(row.created_at);
  const createdAt = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const type = isQuicklinkType(row.type) ? row.type : 'url';

  let tags:
    | {
        text: string;
        color?: TagColor;
      }[]
    | undefined;
  if (row.tags) {
    try {
      const rawTags = JSON.parse(row.tags);
      if (Array.isArray(rawTags)) {
        const validated = rawTags
          .filter(
            (
              t,
            ): t is {
              text: string;
              color?: string;
            } =>
              typeof t === 'object' && t !== null && typeof t.text === 'string',
          )
          .map(t => ({
            text: t.text,
            color:
              typeof t.color === 'string' && isTagColor(t.color)
                ? t.color
                : undefined,
          }));
        if (validated.length > 0) {
          tags = validated;
        }
      }
    } catch {
      /* empty */
    }
  }

  return {
    id: row.id,
    name: row.name,
    link: row.link,
    type,
    application: row.application ?? undefined,
    icon: getQuicklinkIcon(type),
    tags,
    createdAt,
  };
}

function entryToRow(entry: QuicklinkEntry): QuicklinkRow {
  return {
    id: entry.id,
    name: entry.name,
    link: entry.link,
    type: entry.type,
    application: entry.application ?? null,
    tags: entry.tags ? JSON.stringify(entry.tags) : '[]',
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
    title: 'Type',
    options: [
      {
        label: 'URLs',
        value: 'url',
      },
      {
        label: 'File Paths',
        value: 'file',
      },
      {
        label: 'Deep Links',
        value: 'deeplink',
      },
    ],
  },
];

type IconChoice = 'auto' | 'url' | 'file' | 'deeplink';

interface QuicklinkFormState {
  name: string;
  link: string;
  type: QuicklinkType;
  iconChoice: IconChoice;
  application: string;
}

const INITIAL_FORM: QuicklinkFormState = {
  name: '',
  link: '',
  type: 'url',
  iconChoice: 'auto',
  application: '',
};

const ICON_OPTIONS = [
  {
    label: 'Auto (from type)',
    value: 'auto',
  },
  {
    label: 'Web Globe',
    value: 'url',
  },
  {
    label: 'Folder',
    value: 'file',
  },
  {
    label: 'Link Chain',
    value: 'deeplink',
  },
];

const VALID_ICON_CHOICES = new Set<string>([
  'auto',
  'url',
  'file',
  'deeplink',
]);

function isIconChoice(value: string): value is IconChoice {
  return VALID_ICON_CHOICES.has(value);
}

function resolveIcon(iconChoice: IconChoice, type: QuicklinkType): ReactNode {
  if (iconChoice === 'auto') return getQuicklinkIcon(type);
  if (isQuicklinkType(iconChoice)) return getQuicklinkIcon(iconChoice);
  return getQuicklinkIcon(type);
}

const TYPE_OPTIONS = [
  {
    label: 'URL',
    value: 'url',
  },
  {
    label: 'File Path',
    value: 'file',
  },
  {
    label: 'Deep Link',
    value: 'deeplink',
  },
];

interface EditQuicklinkViewProps {
  quicklink?: QuicklinkEntry;
  onSubmit: (form: QuicklinkFormState) => void;
}

function EditQuicklinkView({ quicklink, onSubmit }: EditQuicklinkViewProps) {
  const [form, setForm] = useState<QuicklinkFormState>(() => {
    if (quicklink) {
      return {
        name: quicklink.name,
        link: quicklink.link,
        type: quicklink.type,
        iconChoice: 'auto',
        application: quicklink.application ?? '',
      };
    }
    return INITIAL_FORM;
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof QuicklinkFormState, string>>
  >({});

  const handleSubmit = useCallback(() => {
    const newErrors: Partial<Record<keyof QuicklinkFormState, string>> = {};
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!form.link.trim()) {
      newErrors.link = 'Link is required';
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
        placeholder="e.g. GitHub Dashboard"
        error={errors.name}
        autoFocus
      />
      <FormTextField
        label="Link"
        value={form.link}
        onChange={v =>
          setForm(prev => ({
            ...prev,
            link: v,
          }))
        }
        placeholder="e.g. https://github.com or ~/Documents"
        description="Use {query} as placeholder for dynamic input"
        error={errors.link}
      />
      <FormDropdown
        label="Type"
        value={form.type}
        onChange={v => {
          if (isQuicklinkType(v)) {
            setForm(prev => ({
              ...prev,
              type: v,
            }));
          }
        }}
        options={TYPE_OPTIONS}
      />
      <FormDropdown
        label="Icon"
        value={form.iconChoice}
        onChange={v => {
          if (isIconChoice(v)) {
            setForm(prev => ({
              ...prev,
              iconChoice: v,
            }));
          }
        }}
        options={ICON_OPTIONS}
      />
      <FormTextField
        label="Open With"
        value={form.application}
        onChange={v =>
          setForm(prev => ({
            ...prev,
            application: v,
          }))
        }
        placeholder="e.g. Safari (optional)"
        description="Application to open the link with"
      />
    </Form>
  );
}

interface QueryInputViewProps {
  quicklink: QuicklinkEntry;
  onSubmit: (resolvedUrl: string) => void;
  onCancel: () => void;
}

function QueryInputView({
  quicklink,
  onSubmit,
  onCancel,
}: QueryInputViewProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;
    const resolved = quicklink.link.replaceAll(
      '{query}',
      encodeURIComponent(inputValue.trim()),
    );
    onSubmit(resolved);
  }, [
    inputValue,
    quicklink.link,
    onSubmit,
  ]);

  useKeyboardShortcut(
    {
      key: 'Enter',
      meta: true,
    },
    handleSubmit,
  );
  useKeyboardShortcut({ key: 'Escape' }, onCancel);

  return (
    <Form onSubmit={handleSubmit}>
      <FormTextField
        label="Query"
        value={inputValue}
        onChange={setInputValue}
        placeholder={`Enter query for ${quicklink.name}...`}
        description={`Opens: ${quicklink.link.replace('{query}', '<your input>')}`}
        autoFocus
      />
    </Form>
  );
}

function openQuicklink(link: string, type: QuicklinkType) {
  switch (type) {
    case 'url':
      openUrl(link);
      break;
    case 'deeplink':
      openDeepLink(link);
      break;
    case 'file':
      openDeepLink(`file://${link}`);
      break;
  }
}

export function QuicklinksView() {
  const nav = useNavigation();
  const [entries, setEntries] = useState<QuicklinkEntry[]>([]);
  const [query, setQuery] = useState('');
  const { debouncedValue: debouncedQuery, isPending: isSearchPending } =
    useDebounce(query, SEARCH_DEBOUNCE_MS);
  const [filterValue, setFilterValue] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [subView, setSubView] = useState<
    'list' | 'edit' | 'create' | 'query-input'
  >('list');
  const [editingEntry, setEditingEntry] = useState<
    QuicklinkEntry | undefined
  >();
  const [queryInputEntry, setQueryInputEntry] = useState<
    QuicklinkEntry | undefined
  >();
  const { items: hudItems, show: showHUD } = useHUD();
  const { alertState, confirmAlert, dismiss: dismissAlert } = useAlert();
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    let aborted = false;

    quicklinkDb
      .getAll()
      .then(rows => {
        if (aborted) return;
        if (rows.length > 0) {
          setEntries(rows.map(rowToEntry));
        } else if (!isTauri) {
          const mock = MOCK_QUICKLINKS.map(e => ({ ...e }));
          setEntries(mock);
          Promise.all(mock.map(e => quicklinkDb.insert(entryToRow(e)))).catch(
            console.error,
          );
        }
      })
      .catch(err => {
        console.error('Failed to load quicklinks:', err);
        if (!isTauri && !aborted) {
          setEntries(MOCK_QUICKLINKS.map(e => ({ ...e })));
        }
      });

    return () => {
      aborted = true;
    };
  }, []);

  const dbSearchFn = useCallback((q: string) => quicklinkDb.search(q), []);
  const { results: ftsResults, invalidate: invalidateFts } = useDbSearch(
    debouncedQuery,
    dbSearchFn,
    rowToEntry,
  );

  const filtered = useMemo(() => {
    let items = ftsResults ?? entries;
    if (filterValue !== 'all') {
      items = items.filter(e => e.type === filterValue);
    }
    if (!ftsResults && debouncedQuery) {
      items = items.filter(
        e =>
          fuzzyMatch(debouncedQuery, e.name) ||
          fuzzyMatch(debouncedQuery, e.link),
      );
    }
    return items;
  }, [
    entries,
    debouncedQuery,
    filterValue,
    ftsResults,
  ]);

  const urlItems = useMemo(
    () => filtered.filter(e => e.type === 'url'),
    [filtered],
  );
  const fileItems = useMemo(
    () => filtered.filter(e => e.type === 'file'),
    [filtered],
  );
  const deeplinkItems = useMemo(
    () => filtered.filter(e => e.type === 'deeplink'),
    [filtered],
  );

  const flatItems = useMemo(
    () => [
      ...urlItems,
      ...fileItems,
      ...deeplinkItems,
    ],
    [
      urlItems,
      fileItems,
      deeplinkItems,
    ],
  );
  const totalItemCount = flatItems.length;

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

  const handleOpen = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    const link = selectedEntry.link;
    if (link.includes('{query}')) {
      setQueryInputEntry(selectedEntry);
      setSubView('query-input');
      return;
    }
    openQuicklink(link, selectedEntry.type);
    showHUD({
      icon: <OpenInBrowserHUDIcon />,
      title: `Opened ${selectedEntry.name}`,
    });
  }, [
    selectedEntry,
    showHUD,
  ]);

  const handleQueryInputSubmit = useCallback(
    (resolvedUrl: string) => {
      openQuicklink(resolvedUrl, queryInputEntry?.type ?? 'url');
      showHUD({
        icon: <OpenInBrowserHUDIcon />,
        title: `Opened ${queryInputEntry?.name ?? 'quicklink'}`,
      });
      setSubView('list');
      setQueryInputEntry(undefined);
    },
    [
      queryInputEntry,
      showHUD,
    ],
  );

  const handleQueryInputCancel = useCallback(() => {
    setSubView('list');
    setQueryInputEntry(undefined);
  }, []);

  const handleCopyLink = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    performCopy(selectedEntry.link, showHUD, { hudTitle: 'Link Copied' });
  }, [
    selectedEntry,
    showHUD,
  ]);

  const handleEdit = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    setEditingEntry(selectedEntry);
    setSubView('edit');
  }, [selectedEntry]);

  const handleCreate = useCallback(() => {
    setActionsOpen(false);
    setEditingEntry(undefined);
    setSubView('create');
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedEntry) return;
    const entryId = selectedEntry.id;
    const entryName = selectedEntry.name;
    setActionsOpen(false);
    confirmAlert({
      title: `Delete "${entryName}"?`,
      message: 'This quicklink will be permanently deleted.',
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
          quicklinkDb.delete(entryId).catch(console.error);
          invalidateFts();
          showHUD({
            icon: <QuicklinkHUDIcon />,
            title: `Deleted "${entryName}"`,
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
    (form: QuicklinkFormState) => {
      if (subView === 'edit' && editingEntry) {
        const updatedEntry = {
          ...editingEntry,
          name: form.name.trim(),
          link: form.link.trim(),
          type: form.type,
          icon: resolveIcon(form.iconChoice, form.type),
          application: form.application.trim() || undefined,
        };
        setEntries(prev =>
          prev.map(e => (e.id === editingEntry.id ? updatedEntry : e)));
        quicklinkDb
          .update(editingEntry.id, {
            name: form.name.trim(),
            link: form.link.trim(),
            type: form.type,
            application: form.application.trim() || null,
          })
          .catch(console.error);
        invalidateFts();
        showHUD({
          icon: <QuicklinkHUDIcon />,
          title: `Updated "${form.name.trim()}"`,
        });
      } else {
        const newEntry: QuicklinkEntry = {
          id: crypto.randomUUID(),
          name: form.name.trim(),
          link: form.link.trim(),
          type: form.type,
          icon: getQuicklinkIcon(form.type),
          application: form.application.trim() || undefined,
          createdAt: new Date(),
        };
        setEntries(prev => [
          newEntry,
          ...prev,
        ]);
        quicklinkDb.insert(entryToRow(newEntry)).catch(console.error);
        invalidateFts();
        showHUD({
          icon: <QuicklinkHUDIcon />,
          title: `Created "${form.name.trim()}"`,
        });
      }
      setSubView('list');
      setEditingEntry(undefined);
    },
    [
      subView,
      editingEntry,
      showHUD,
      invalidateFts,
    ],
  );

  const handleAction = useCallback(() => {
    handleOpen();
  }, [handleOpen]);

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
    { enabled: subView === 'list' },
  );
  useKeyboardShortcut(
    {
      key: 'c',
      meta: true,
    },
    handleCopyLink,
    { enabled: subView === 'list' },
  );
  useKeyboardShortcut(
    {
      key: 'l',
      meta: true,
    },
    handleCopyLink,
    { enabled: subView === 'list' },
  );
  useKeyboardShortcut(
    {
      key: 'e',
      meta: true,
    },
    handleEdit,
    { enabled: subView === 'list' },
  );
  useKeyboardShortcut(
    {
      key: 'n',
      meta: true,
    },
    handleCreate,
    { enabled: subView === 'list' },
  );
  useKeyboardShortcut(
    {
      key: 'Backspace',
      meta: true,
    },
    handleDelete,
    { enabled: subView === 'list' },
  );

  const dropdownSections: DropdownSection[] = useMemo(
    () => [
      {
        title: 'Actions',
        actions: [
          {
            label: 'Open',
            shortcut: <Kbd keys={['↵']} />,
            onClick: handleOpen,
          },
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
          createCopyAction(
            {
              content: selectedEntry?.link ?? '',
              title: 'Copy Link',
              shortcut: (
                <Kbd
                  keys={[
                    '⌘',
                    'C',
                  ]}
                />
              ),
              hudTitle: 'Link Copied',
            },
            showHUD,
          ),
          {
            label: 'Create Quicklink',
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
      selectedEntry?.link,
      handleOpen,
      handleEdit,
      handleCreate,
      handleDelete,
      showHUD,
    ],
  );

  const activeDescendantId =
    totalItemCount > 0 ? `list-item-${selectedIndex}` : undefined;

  const handleEscape = useCallback(() => {
    if (subView !== 'list') {
      setSubView('list');
      setEditingEntry(undefined);
      setQueryInputEntry(undefined);
    }
  }, [subView]);

  useKeyboardShortcut({ key: 'Escape' }, handleEscape, {
    enabled: subView !== 'list',
    preventDefault: false,
  });

  if (subView === 'query-input' && queryInputEntry) {
    return (
      <>
        <SearchBar
          value=""
          onChange={() => {}}
          placeholder={`Query for ${queryInputEntry.name}`}
          breadcrumbs={[
            ...nav.breadcrumbs,
            {
              label: queryInputEntry.name,
              onBack: handleQueryInputCancel,
            },
          ]}
        />
        <div className="command-palette__body">
          <div className="command-palette__list-container">
            <QueryInputView
              quicklink={queryInputEntry}
              onSubmit={handleQueryInputSubmit}
              onCancel={handleQueryInputCancel}
            />
          </div>
        </div>
        <ActionPanel
          contextLabel="Quicklinks"
          actions={[
            {
              label: 'Open',
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

  if (subView === 'edit' || subView === 'create') {
    const formTitle =
      subView === 'edit' ? 'Edit Quicklink' : 'Create Quicklink';
    return (
      <>
        <SearchBar
          value=""
          onChange={() => {}}
          placeholder={formTitle}
          breadcrumbs={[
            ...nav.breadcrumbs,
            {
              label: formTitle,
              onBack: () => {
                setSubView('list');
                setEditingEntry(undefined);
              },
            },
          ]}
        />
        <div className="command-palette__body">
          <div className="command-palette__list-container">
            <EditQuicklinkView
              quicklink={subView === 'edit' ? editingEntry : undefined}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
        <ActionPanel
          contextLabel="Quicklinks"
          actions={[
            {
              label: subView === 'edit' ? 'Save' : 'Create',
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

  function renderQuicklinkItem(entry: QuicklinkEntry, idx: number): ReactNode {
    const accessories = [
      ...(entry.tags?.map(t => ({ tag: t })) ?? []),
      { text: QUICKLINK_TYPE_LABELS[entry.type] },
      {
        text: formatRelativeDate(entry.createdAt, now),
        tooltip: entry.createdAt.toLocaleString(),
      },
    ];
    if (entry.application) {
      accessories.unshift({ text: entry.application });
    }

    return (
      <ListItem
        key={entry.id}
        index={idx}
        icon={entry.icon ?? getQuicklinkIcon(entry.type)}
        title={entry.name}
        subtitle={entry.link}
        accessories={accessories}
        query={query || undefined}
      />
    );
  }

  return (
    <>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        placeholder="Search Quicklinks..."
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
              title="No Quicklinks"
              description="Try a different search or create a new quicklink"
            />
          ) : (
            <List
              itemCount={totalItemCount}
              onActiveIndexChange={handleActiveIndexChange}
              onAction={handleAction}
            >
              {(() => {
                let globalIndex = 0;
                const sections: ReactNode[] = [];

                if (urlItems.length > 0) {
                  sections.push(
                    <ListSection key="urls" title="URLs">
                      {urlItems.map(entry =>
                        renderQuicklinkItem(entry, globalIndex++))}
                    </ListSection>,
                  );
                }

                if (fileItems.length > 0) {
                  sections.push(
                    <ListSection key="files" title="File Paths">
                      {fileItems.map(entry =>
                        renderQuicklinkItem(entry, globalIndex++))}
                    </ListSection>,
                  );
                }

                if (deeplinkItems.length > 0) {
                  sections.push(
                    <ListSection key="deeplinks" title="Deep Links">
                      {deeplinkItems.map(entry =>
                        renderQuicklinkItem(entry, globalIndex++))}
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
        contextLabel="Quicklinks"
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
