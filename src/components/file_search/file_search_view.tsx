import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { FileEntry, FileType } from '../../data/file_search_data';
import { MOCK_FILE_ENTRIES, getFileIcon } from '../../data/file_search_data';
import { useAlert } from '../../hooks/use_alert';
import { useHUD } from '../../hooks/use_hud';
import { useKeyboardShortcut } from '../../hooks/use_keyboard_shortcut';
import { useNavigation } from '../../hooks/use_navigation';
import { formatRelativeDate } from '../../utils/format_date';
import { formatFileSize } from '../../utils/format_file_size';
import { fuzzyMatch } from '../../utils/fuzzy_search';
import { ActionPanel } from '../action_panel/action_panel';
import {
  CopyHUDIcon,
  createCopyAction,
  performCopy,
} from '../action_panel/actions';
import type { DropdownSection } from '../action_panel/actions_dropdown';
import { Alert } from '../alert/alert';
import { EmptyState } from '../empty_state/empty_state';
import { HUDContainer } from '../hud/hud_container';
import { Kbd } from '../kbd/kbd';
import { List, ListItem, ListSection } from '../list';
import { SearchBar } from '../search_bar/search_bar';
import type { SearchDropdownSection } from '../search_bar/search_dropdown';
import { SearchDropdown } from '../search_bar/search_dropdown';

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

function OpenHUDIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 3H4.5A1.5 1.5 0 003 4.5v7A1.5 1.5 0 004.5 13h7a1.5 1.5 0 001.5-1.5V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 3h4v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 3L7.5 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const FILE_TYPE_LABELS: Record<FileType, string> = {
  folder: 'Folder',
  document: 'Document',
  code: 'Code',
  image: 'Image',
  pdf: 'PDF',
  archive: 'Archive',
  spreadsheet: 'Spreadsheet',
  presentation: 'Presentation',
};

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
        label: 'Folders',
        value: 'folder',
      },
      {
        label: 'Documents',
        value: 'document',
      },
      {
        label: 'Code',
        value: 'code',
      },
      {
        label: 'Images',
        value: 'image',
      },
      {
        label: 'PDFs',
        value: 'pdf',
      },
      {
        label: 'Archives',
        value: 'archive',
      },
      {
        label: 'Spreadsheets',
        value: 'spreadsheet',
      },
      {
        label: 'Presentations',
        value: 'presentation',
      },
    ],
  },
];

export function FileSearchView() {
  const nav = useNavigation();
  const [entries, setEntries] = useState<FileEntry[]>(MOCK_FILE_ENTRIES);
  const [query, setQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const { items: hudItems, show: showHUD } = useHUD();
  const { alertState, confirmAlert, dismiss: dismissAlert } = useAlert();
  const now = useMemo(() => new Date(), []);

  const filtered = useMemo(() => {
    let items = entries;
    if (filterValue !== 'all') {
      items = items.filter(e => e.fileType === filterValue);
    }
    if (query) {
      items = items.filter(
        e => fuzzyMatch(query, e.name) || fuzzyMatch(query, e.path),
      );
    }
    return items;
  }, [
    entries,
    query,
    filterValue,
  ]);

  const folders = useMemo(
    () => filtered.filter(e => e.fileType === 'folder'),
    [filtered],
  );
  const files = useMemo(
    () => filtered.filter(e => e.fileType !== 'folder'),
    [filtered],
  );
  const totalItemCount = filtered.length;

  const flatItems = useMemo(
    () => [
      ...folders,
      ...files,
    ],
    [
      folders,
      files,
    ],
  );

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
    showHUD({
      icon: <OpenHUDIcon />,
      title: `Opened ${selectedEntry.name}`,
    });
  }, [
    selectedEntry,
    showHUD,
  ]);

  const handleShowInFinder = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    showHUD({
      icon: <OpenHUDIcon />,
      title: 'Revealed in Finder',
    });
  }, [
    selectedEntry,
    showHUD,
  ]);

  const handleCopyPath = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    performCopy(selectedEntry.path, showHUD, {
      hudTitle: 'Path Copied',
    });
  }, [
    selectedEntry,
    showHUD,
  ]);

  const handleDelete = useCallback(() => {
    if (!selectedEntry) return;
    const entryId = selectedEntry.id;
    const entryName = selectedEntry.name;
    setActionsOpen(false);
    confirmAlert({
      title: `Move "${entryName}" to Trash?`,
      message: 'You can restore this item from the Trash.',
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
        label: 'Move to Trash',
        style: 'destructive',
        onAction: () => {
          setEntries(prev => prev.filter(e => e.id !== entryId));
          showHUD({
            icon: <CopyHUDIcon />,
            title: `Moved "${entryName}" to Trash`,
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
  ]);

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
  );
  useKeyboardShortcut(
    {
      key: 'c',
      meta: true,
    },
    handleCopyPath,
  );
  useKeyboardShortcut(
    {
      key: 'f',
      meta: true,
      shift: true,
    },
    handleShowInFinder,
  );
  useKeyboardShortcut(
    {
      key: 'Backspace',
      meta: true,
    },
    handleDelete,
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
            label: 'Show in Finder',
            shortcut: (
              <Kbd
                keys={[
                  '⌘',
                  '⇧',
                  'F',
                ]}
              />
            ),
            onClick: handleShowInFinder,
          },
          createCopyAction(
            {
              content: selectedEntry?.path ?? '',
              title: 'Copy Path',
              shortcut: (
                <Kbd
                  keys={[
                    '⌘',
                    'C',
                  ]}
                />
              ),
              hudTitle: 'Path Copied',
            },
            showHUD,
          ),
        ],
      },
      {
        title: 'Danger Zone',
        actions: [
          {
            label: 'Move to Trash',
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
      selectedEntry?.path,
      handleOpen,
      handleShowInFinder,
      handleDelete,
      showHUD,
    ],
  );

  const activeDescendantId =
    totalItemCount > 0 ? `list-item-${selectedIndex}` : undefined;

  function renderFileItem(entry: FileEntry, idx: number): ReactNode {
    const sizeText = formatFileSize(entry.size);
    return (
      <ListItem
        key={entry.id}
        index={idx}
        icon={getFileIcon(entry.fileType)}
        title={entry.name}
        subtitle={entry.path}
        accessories={[
          {
            tag: {
              text: FILE_TYPE_LABELS[entry.fileType],
              color:
                entry.fileType === 'folder'
                  ? 'blue'
                  : entry.fileType === 'code'
                    ? 'purple'
                    : entry.fileType === 'image'
                      ? 'green'
                      : undefined,
            },
          },
          { text: sizeText },
          {
            text: formatRelativeDate(entry.modifiedAt, now),
            tooltip: entry.modifiedAt.toLocaleString(),
          },
        ]}
        query={query || undefined}
      />
    );
  }

  return (
    <>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        placeholder="Search Files..."
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
              title="No Results"
              description="Try a different search term or filter"
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

                if (folders.length > 0) {
                  sections.push(
                    <ListSection key="folders" title="Folders">
                      {folders.map(entry =>
                        renderFileItem(entry, globalIndex++))}
                    </ListSection>,
                  );
                }

                if (files.length > 0) {
                  sections.push(
                    <ListSection key="files" title="Files">
                      {files.map(entry => renderFileItem(entry, globalIndex++))}
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
        contextLabel="File Search"
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
