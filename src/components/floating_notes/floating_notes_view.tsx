import DOMPurify from 'dompurify';
import { marked } from 'marked';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { NoteEntry } from '../../data/notes_data';
import { MOCK_NOTE_ENTRIES } from '../../data/notes_data';
import { useAlert } from '../../hooks/use_alert';
import { useDbSearch } from '../../hooks/use_db_search';
import { useHUD } from '../../hooks/use_hud';
import { useKeyboardShortcut } from '../../hooks/use_keyboard_shortcut';
import { useNavigation } from '../../hooks/use_navigation';
import { isTauri } from '../../platform';
import type { NoteRow } from '../../utils/database';
import { noteDb } from '../../utils/database';
import { formatRelativeDate } from '../../utils/format_date';
import { fuzzyMatch } from '../../utils/fuzzy_search';
import { ActionPanel } from '../action_panel/action_panel';
import { createCopyAction, performCopy } from '../action_panel/actions';
import type { DropdownSection } from '../action_panel/actions_dropdown';
import { Alert } from '../alert/alert';
import { EmptyState } from '../empty_state/empty_state';
import { HUDContainer } from '../hud/hud_container';
import { DocumentIcon, TrashIcon } from '../icons';
import { Kbd } from '../kbd/kbd';
import { List, ListItem, ListSection } from '../list';
import { SearchBar } from '../search_bar/search_bar';
import './floating_notes_view.scss';

function NoteHUDIcon() {
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
      <line
        x1="5.5"
        y1="5.5"
        x2="10.5"
        y2="5.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <line
        x1="5.5"
        y1="8"
        x2="10.5"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <line
        x1="5.5"
        y1="10.5"
        x2="8.5"
        y2="10.5"
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
      <rect
        x="10"
        y="6"
        width="28"
        height="36"
        rx="4"
        stroke="currentColor"
        strokeWidth="3"
      />
      <line
        x1="16"
        y1="16"
        x2="32"
        y2="16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="23"
        x2="32"
        y2="23"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="30"
        x2="26"
        y2="30"
        stroke="currentColor"
        strokeWidth="2.5"
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

function rowToEntry(row: NoteRow): NoteEntry {
  const createdAt = new Date(row.created_at);
  const updatedAt = new Date(row.updated_at);
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
    updatedAt: isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
  };
}

function entryToRow(entry: NoteEntry): NoteRow {
  return {
    id: entry.id,
    title: entry.title,
    content: entry.content,
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString(),
  };
}

type NoteSubView = 'list' | 'create' | 'edit';

interface NoteEditorViewProps {
  note?: NoteEntry;
  onSave: (title: string, content: string) => void;
}

function NoteEditorView({ note, onSave }: NoteEditorViewProps) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [preview, setPreview] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const onSaveRef = useRef(onSave);

  titleRef.current = title;
  contentRef.current = content;
  onSaveRef.current = onSave;

  const debounceSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSaveRef.current(titleRef.current, contentRef.current);
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        onSaveRef.current(titleRef.current, contentRef.current);
      }
    };
  }, []);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      debounceSave();
    },
    [debounceSave],
  );

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      debounceSave();
    },
    [debounceSave],
  );

  const handleFlushSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSaveRef.current(titleRef.current, contentRef.current);
  }, []);

  const togglePreview = useCallback(() => {
    setPreview(prev => !prev);
  }, []);

  useKeyboardShortcut(
    {
      key: 's',
      meta: true,
    },
    handleFlushSave,
  );
  useKeyboardShortcut(
    {
      key: 'p',
      meta: true,
      shift: true,
    },
    togglePreview,
  );

  const renderedHtml = useMemo(
    () =>
      preview
        ? DOMPurify.sanitize(
            marked.parse(content || '*No content*', { async: false }),
          )
        : '',
    [
      content,
      preview,
    ],
  );

  return (
    <div className="notes-editor">
      <div className="notes-editor__header">
        <input
          className="notes-editor__title-input"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note Title"
          aria-label="Note title"
          autoFocus={!preview}
          readOnly={preview}
        />
        <button
          className={`notes-editor__preview-toggle${preview ? ' notes-editor__preview-toggle--active' : ''}`}
          onClick={togglePreview}
          aria-label={
            preview ? 'Switch to edit mode' : 'Switch to preview mode'
          }
          aria-pressed={preview}
          type="button"
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {preview ? (
        <div
          className="notes-editor__preview detail__markdown"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
          role="document"
          aria-label="Markdown preview"
        />
      ) : (
        <textarea
          className="notes-editor__content-area"
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing..."
          aria-label="Note content"
        />
      )}
      {note && (
        <div className="notes-editor__meta">
          <span>Modified {note.updatedAt.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

export function FloatingNotesView() {
  const nav = useNavigation();
  const [entries, setEntries] = useState<NoteEntry[]>([]);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [subView, setSubView] = useState<NoteSubView>('list');
  const [editingNote, setEditingNote] = useState<NoteEntry | undefined>();
  const { items: hudItems, show: showHUD } = useHUD();
  const { alertState, confirmAlert, dismiss: dismissAlert } = useAlert();

  useEffect(() => {
    let aborted = false;

    noteDb
      .getAll()
      .then(rows => {
        if (aborted) return;
        if (rows.length > 0) {
          setEntries(rows.map(rowToEntry));
        } else if (!isTauri) {
          const mock = MOCK_NOTE_ENTRIES.map(e => ({ ...e }));
          setEntries(mock);
          Promise.all(mock.map(e => noteDb.insert(entryToRow(e)))).catch(
            console.error,
          );
        }
      })
      .catch(err => {
        console.error('Failed to load notes:', err);
        if (!isTauri && !aborted) {
          setEntries(MOCK_NOTE_ENTRIES.map(e => ({ ...e })));
        }
      });

    return () => {
      aborted = true;
    };
  }, []);

  const dbSearchFn = useCallback((q: string) => noteDb.search(q), []);
  const { results: ftsResults, invalidate: invalidateFts } = useDbSearch(
    query,
    dbSearchFn,
    rowToEntry,
  );

  const filtered = useMemo(() => {
    const items = ftsResults ?? entries;
    if (!ftsResults && query) {
      return items.filter(
        e => fuzzyMatch(query, e.title) || fuzzyMatch(query, e.content),
      );
    }
    return items;
  }, [
    entries,
    query,
    ftsResults,
  ]);

  const totalItemCount = filtered.length;

  useEffect(() => {
    if (totalItemCount === 0) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(prev =>
        prev >= totalItemCount ? totalItemCount - 1 : prev);
    }
  }, [totalItemCount]);

  const selectedEntry = filtered[selectedIndex];

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
    setActionsOpen(false);
  }, []);

  const handleActiveIndexChange = useCallback((index: number) => {
    setSelectedIndex(index);
    setActionsOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    setEditingNote(selectedEntry);
    setSubView('edit');
  }, [selectedEntry]);

  const handleCopy = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    performCopy(selectedEntry.content, showHUD, {
      hudIcon: <NoteHUDIcon />,
    });
  }, [
    selectedEntry,
    showHUD,
  ]);

  const handleCreate = useCallback(() => {
    setActionsOpen(false);
    setEditingNote(undefined);
    setSubView('create');
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedEntry) return;
    const entryId = selectedEntry.id;
    const entryName = selectedEntry.title || 'Untitled';
    setActionsOpen(false);
    confirmAlert({
      title: `Delete "${entryName}"?`,
      message: 'This note will be permanently deleted.',
      icon: <TrashIcon size={32} />,
      primaryAction: {
        label: 'Delete',
        style: 'destructive',
        onAction: () => {
          setEntries(prev => prev.filter(e => e.id !== entryId));
          noteDb.delete(entryId).catch(console.error);
          invalidateFts();
          showHUD({
            icon: <NoteHUDIcon />,
            title: 'Note Deleted',
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

  const handleSave = useCallback(
    (title: string, content: string) => {
      const saveTime = new Date();

      if (subView === 'edit' && editingNote) {
        const updatedEntry: NoteEntry = {
          ...editingNote,
          title: title || 'Untitled',
          content,
          updatedAt: saveTime,
        };
        setEntries(prev =>
          prev.map(e => (e.id === editingNote.id ? updatedEntry : e)));
        setEditingNote(updatedEntry);
        noteDb
          .update(editingNote.id, {
            title: title || 'Untitled',
            content,
          })
          .catch(console.error);
        invalidateFts();
      } else {
        const newEntry: NoteEntry = {
          id: crypto.randomUUID(),
          title: title || 'Untitled',
          content,
          createdAt: saveTime,
          updatedAt: saveTime,
        };
        setEntries(prev => [
          newEntry,
          ...prev,
        ]);
        noteDb.insert(entryToRow(newEntry)).catch(console.error);
        invalidateFts();
        setEditingNote(newEntry);
        setSubView('edit');
      }
    },
    [
      subView,
      editingNote,
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
      setEditingNote(undefined);
    }
  }, [subView]);

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
    handleCopy,
    { enabled: subView === 'list' },
  );
  useKeyboardShortcut(
    {
      key: 'l',
      meta: true,
    },
    handleCopy,
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
            label: 'Open',
            shortcut: <Kbd keys={['↵']} />,
            onClick: handleOpen,
          },
          createCopyAction(
            {
              content: selectedEntry?.content ?? '',
              title: 'Copy Content',
              shortcut: (
                <Kbd
                  keys={[
                    '⌘',
                    'C',
                  ]}
                />
              ),
              hudIcon: <NoteHUDIcon />,
            },
            showHUD,
          ),
          {
            label: 'Create Note',
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
      handleOpen,
      handleCreate,
      handleDelete,
      showHUD,
    ],
  );

  const activeDescendantId =
    totalItemCount > 0 ? `list-item-${selectedIndex}` : undefined;

  if (subView !== 'list') {
    const formTitle = subView === 'edit' ? 'Edit Note' : 'Create Note';
    return (
      <>
        <SearchBar
          value=""
          onChange={() => {}}
          placeholder={formTitle}
          breadcrumbs={[
            ...nav.breadcrumbs,
            {
              label: 'Notes',
              onBack: handleEscape,
            },
          ]}
        />
        <div className="command-palette__body">
          <div className="command-palette__list-container">
            <NoteEditorView
              note={subView === 'edit' ? editingNote : undefined}
              onSave={handleSave}
            />
          </div>
        </div>
        <ActionPanel
          contextLabel={formTitle}
          actions={[
            {
              label: 'Save',
              shortcut: (
                <Kbd
                  keys={[
                    '⌘',
                    'S',
                  ]}
                />
              ),
            },
            {
              label: 'Preview',
              shortcut: (
                <Kbd
                  keys={[
                    '⌘',
                    '⇧',
                    'P',
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
        {alertState && <Alert {...alertState} onDismiss={dismissAlert} />}
      </>
    );
  }

  return (
    <>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        placeholder="Search Notes..."
        activeDescendantId={activeDescendantId}
        breadcrumbs={nav.breadcrumbs.length > 0 ? nav.breadcrumbs : undefined}
      />
      <div className="command-palette__body">
        <div className="command-palette__list-container">
          {totalItemCount === 0 ? (
            <EmptyState
              icon={<SearchEmptyIcon />}
              title="No Notes"
              description={
                query
                  ? 'Try a different search term'
                  : 'Create your first note with \u2318N'
              }
            />
          ) : (
            <List
              itemCount={totalItemCount}
              onActiveIndexChange={handleActiveIndexChange}
              onAction={handleOpen}
            >
              {(() => {
                const items: ReactNode[] = [];
                let globalIndex = 0;
                const renderNow = new Date();
                const oneDayAgo = renderNow.getTime() - 1000 * 60 * 60 * 24;

                const recentItems = filtered.filter(
                  e => e.updatedAt.getTime() > oneDayAgo,
                );
                const olderItems = filtered.filter(
                  e => e.updatedAt.getTime() <= oneDayAgo,
                );

                if (recentItems.length > 0) {
                  items.push(
                    <ListSection key="recent" title="Recent">
                      {recentItems.map(entry => {
                        const idx = globalIndex++;
                        return (
                          <ListItem
                            key={entry.id}
                            index={idx}
                            icon={<DocumentIcon />}
                            title={entry.title || 'Untitled'}
                            subtitle={truncateContent(entry.content, 60)}
                            accessories={[
                              {
                                text: formatRelativeDate(
                                  entry.updatedAt,
                                  renderNow,
                                ),
                                tooltip: entry.updatedAt.toLocaleString(),
                              },
                            ]}
                            query={query || undefined}
                          />
                        );
                      })}
                    </ListSection>,
                  );
                }

                if (olderItems.length > 0) {
                  items.push(
                    <ListSection key="older" title="Older">
                      {olderItems.map(entry => {
                        const idx = globalIndex++;
                        return (
                          <ListItem
                            key={entry.id}
                            index={idx}
                            icon={<DocumentIcon />}
                            title={entry.title || 'Untitled'}
                            subtitle={truncateContent(entry.content, 60)}
                            accessories={[
                              {
                                text: formatRelativeDate(
                                  entry.updatedAt,
                                  renderNow,
                                ),
                                tooltip: entry.updatedAt.toLocaleString(),
                              },
                            ]}
                            query={query || undefined}
                          />
                        );
                      })}
                    </ListSection>,
                  );
                }

                return items;
              })()}
            </List>
          )}
        </div>
      </div>
      <ActionPanel
        contextLabel="Notes"
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
        dropdownOpen={actionsOpen}
        dropdownSections={dropdownSections}
        onDropdownClose={closeActions}
      />
      <HUDContainer items={hudItems} />
      {alertState && <Alert {...alertState} onDismiss={dismissAlert} />}
    </>
  );
}
