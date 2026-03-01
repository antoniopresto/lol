import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReminderEntry, RepeatOption } from '../../data/reminders_data';
import {
  MOCK_REMINDER_ENTRIES,
  REPEAT_OPTIONS,
  isRepeatOption,
} from '../../data/reminders_data';
import { useAlert } from '../../hooks/use_alert';
import { useDbSearch } from '../../hooks/use_db_search';
import { useHUD } from '../../hooks/use_hud';
import { useKeyboardShortcut } from '../../hooks/use_keyboard_shortcut';
import { useNavigation } from '../../hooks/use_navigation';
import { isTauri } from '../../platform';
import type { ReminderRow } from '../../utils/database';
import { reminderDb } from '../../utils/database';
import { fuzzyMatch } from '../../utils/fuzzy_search';
import { ActionPanel } from '../action_panel/action_panel';
import { createCopyAction, performCopy } from '../action_panel/actions';
import type { DropdownSection } from '../action_panel/actions_dropdown';
import { Alert } from '../alert/alert';
import { EmptyState } from '../empty_state/empty_state';
import {
  Form,
  FormDatePicker,
  FormDropdown,
  FormTextArea,
  FormTextField,
} from '../form';
import { HUDContainer } from '../hud/hud_container';
import { CheckIcon, ClockIcon, TrashIcon } from '../icons';
import { Kbd } from '../kbd/kbd';
import { List, ListItem, ListSection } from '../list';
import { SearchBar } from '../search_bar/search_bar';
import type { SearchDropdownSection } from '../search_bar/search_dropdown';
import { SearchDropdown } from '../search_bar/search_dropdown';
import './reminders_view.scss';

function ReminderHUDIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="2"
        y="3"
        width="12"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M5.5 1.5v3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M10.5 1.5v3"
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
        y="8"
        width="28"
        height="32"
        rx="4"
        stroke="currentColor"
        strokeWidth="3"
      />
      <line
        x1="10"
        y1="18"
        x2="38"
        y2="18"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <line
        x1="17"
        y1="6"
        x2="17"
        y2="12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="31"
        y1="6"
        x2="31"
        y2="12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatTime(time: string): string {
  const parts = time.split(':').map(Number);
  const hours = parts[0];
  const minutes = parts[1];
  if (
    hours === undefined ||
    isNaN(hours) ||
    minutes === undefined ||
    isNaN(minutes)
  ) {
    return time || '--:--';
  }
  const period = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, '0')} ${period}`;
}

function formatDueLabel(dueDate: Date, renderNow: Date): string {
  const todayStart = new Date(renderNow);
  todayStart.setHours(0, 0, 0, 0);
  const dueStart = new Date(dueDate);
  dueStart.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (dueStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays <= 7) return `In ${diffDays} days`;
  return dueDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function repeatLabel(repeat: RepeatOption): string {
  const found = REPEAT_OPTIONS.find(r => r.value === repeat);
  return found?.label ?? 'None';
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function rowToEntry(row: ReminderRow): ReminderEntry {
  const dueDate = new Date(row.due_date);
  const completedAt = row.completed_at ? new Date(row.completed_at) : null;
  const createdAt = new Date(row.created_at);
  return {
    id: row.id,
    title: row.title,
    dueDate: isNaN(dueDate.getTime()) ? new Date() : dueDate,
    dueTime: row.due_time,
    repeat: isRepeatOption(row.repeat) ? row.repeat : 'none',
    notes: row.notes,
    completed: row.completed === 1,
    completedAt:
      completedAt && !isNaN(completedAt.getTime()) ? completedAt : null,
    createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
  };
}

function entryToRow(entry: ReminderEntry): ReminderRow {
  return {
    id: entry.id,
    title: entry.title,
    due_date: entry.dueDate.toISOString(),
    due_time: entry.dueTime,
    repeat: entry.repeat,
    notes: entry.notes,
    completed: entry.completed ? 1 : 0,
    completed_at: entry.completedAt?.toISOString() ?? null,
    created_at: entry.createdAt.toISOString(),
  };
}

type ReminderSubView = 'list' | 'create' | 'edit';

interface ReminderFormState {
  title: string;
  dueDate: string;
  dueTime: string;
  repeat: RepeatOption;
  notes: string;
}

function createInitialForm(): ReminderFormState {
  return {
    title: '',
    dueDate: new Date().toISOString().slice(0, 10),
    dueTime: '09:00',
    repeat: 'none',
    notes: '',
  };
}

interface EditReminderViewProps {
  reminder?: ReminderEntry;
  onSubmit: (form: ReminderFormState) => void;
}

function EditReminderView({ reminder, onSubmit }: EditReminderViewProps) {
  const [form, setForm] = useState<ReminderFormState>(() => {
    if (reminder) {
      return {
        title: reminder.title,
        dueDate: reminder.dueDate.toISOString().slice(0, 10),
        dueTime: reminder.dueTime,
        repeat: reminder.repeat,
        notes: reminder.notes,
      };
    }
    return createInitialForm();
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ReminderFormState, string>>
  >({});

  const handleSubmit = useCallback(() => {
    const newErrors: Partial<Record<keyof ReminderFormState, string>> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!form.dueDate) {
      newErrors.dueDate = 'Due date is required';
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
    <div className="reminder-form">
      <Form onSubmit={handleSubmit}>
        <FormTextField
          label="Title"
          value={form.title}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              title: v,
            }))
          }
          placeholder="e.g. Call dentist"
          error={errors.title}
          autoFocus
        />
        <FormDatePicker
          label="Due Date"
          value={form.dueDate}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              dueDate: v,
            }))
          }
          error={errors.dueDate}
        />
        <FormTextField
          label="Time"
          value={form.dueTime}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              dueTime: v,
            }))
          }
          placeholder="HH:MM"
        />
        <FormDropdown
          label="Repeat"
          value={form.repeat}
          onChange={v => {
            if (isRepeatOption(v)) {
              setForm(prev => ({
                ...prev,
                repeat: v,
              }));
            }
          }}
          options={REPEAT_OPTIONS}
        />
        <FormTextArea
          label="Notes"
          value={form.notes}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              notes: v,
            }))
          }
          placeholder="Additional details..."
          rows={4}
        />
      </Form>
    </div>
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
    title: 'Status',
    options: [
      {
        label: 'Active',
        value: 'active',
      },
      {
        label: 'Completed',
        value: 'completed',
      },
    ],
  },
];

export function RemindersView() {
  const nav = useNavigation();
  const [entries, setEntries] = useState<ReminderEntry[]>([]);
  const [query, setQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [subView, setSubView] = useState<ReminderSubView>('list');
  const [editingReminder, setEditingReminder] = useState<
    ReminderEntry | undefined
  >();
  const { items: hudItems, show: showHUD } = useHUD();
  const { alertState, confirmAlert, dismiss: dismissAlert } = useAlert();

  useEffect(() => {
    let aborted = false;

    reminderDb
      .getAll()
      .then(rows => {
        if (aborted) return;
        if (rows.length > 0) {
          setEntries(rows.map(rowToEntry));
        } else if (!isTauri) {
          const mock = MOCK_REMINDER_ENTRIES.map(e => ({ ...e }));
          setEntries(mock);
          Promise.all(mock.map(e => reminderDb.insert(entryToRow(e)))).catch(
            console.error,
          );
        }
      })
      .catch(err => {
        console.error('Failed to load reminders:', err);
        if (!isTauri && !aborted) {
          setEntries(MOCK_REMINDER_ENTRIES.map(e => ({ ...e })));
        }
      });

    return () => {
      aborted = true;
    };
  }, []);

  const dbSearchFn = useCallback((q: string) => reminderDb.search(q), []);
  const { results: ftsResults, invalidate: invalidateFts } = useDbSearch(
    query,
    dbSearchFn,
    rowToEntry,
  );

  const filtered = useMemo(() => {
    let items = ftsResults ?? entries;

    if (filterValue === 'active') {
      items = items.filter(e => !e.completed);
    } else if (filterValue === 'completed') {
      items = items.filter(e => e.completed);
    }

    if (!ftsResults && query) {
      items = items.filter(
        e => fuzzyMatch(query, e.title) || fuzzyMatch(query, e.notes),
      );
    }

    return items;
  }, [
    entries,
    query,
    filterValue,
    ftsResults,
  ]);

  const renderNow = useMemo(() => new Date(), []);

  const sections = useMemo(() => {
    const todayStart = new Date(renderNow);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const overdue: ReminderEntry[] = [];
    const today: ReminderEntry[] = [];
    const upcoming: ReminderEntry[] = [];
    const completed: ReminderEntry[] = [];

    for (const entry of filtered) {
      if (entry.completed) {
        completed.push(entry);
        continue;
      }
      const dueStart = new Date(entry.dueDate);
      dueStart.setHours(0, 0, 0, 0);

      if (dueStart.getTime() < todayStart.getTime()) {
        overdue.push(entry);
      } else if (isSameDay(dueStart, todayStart)) {
        today.push(entry);
      } else {
        upcoming.push(entry);
      }
    }

    return {
      overdue,
      today,
      upcoming,
      completed,
    };
  }, [
    filtered,
    renderNow,
  ]);

  const flatItems = useMemo(
    () => [
      ...sections.overdue,
      ...sections.today,
      ...sections.upcoming,
      ...sections.completed,
    ],
    [sections],
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
    setActionsOpen(false);
  }, []);

  const handleActiveIndexChange = useCallback((index: number) => {
    setSelectedIndex(index);
    setActionsOpen(false);
  }, []);

  const toggleComplete = useCallback(
    (entry: ReminderEntry) => {
      const wasCompleted = entry.completed;
      const now = new Date();

      setEntries(prev =>
        prev.map(e =>
          e.id === entry.id
            ? {
                ...e,
                completed: !wasCompleted,
                completedAt: wasCompleted ? null : now,
              }
            : e));

      reminderDb
        .update(entry.id, {
          completed: wasCompleted ? 0 : 1,
          completed_at: wasCompleted ? null : now.toISOString(),
        })
        .catch(console.error);

      invalidateFts();
      showHUD({
        icon: wasCompleted ? <ClockIcon /> : <CheckIcon />,
        title: wasCompleted ? 'Marked Incomplete' : 'Completed',
      });
    },
    [
      showHUD,
      invalidateFts,
    ],
  );

  const handleToggleComplete = useCallback(() => {
    if (!selectedEntry) return;
    toggleComplete(selectedEntry);
  }, [
    selectedEntry,
    toggleComplete,
  ]);

  const handleCopy = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    performCopy(selectedEntry.title, showHUD, {
      hudIcon: <ReminderHUDIcon />,
    });
  }, [
    selectedEntry,
    showHUD,
  ]);

  const handleCreate = useCallback(() => {
    setActionsOpen(false);
    setEditingReminder(undefined);
    setSubView('create');
  }, []);

  const handleEdit = useCallback(() => {
    if (!selectedEntry) return;
    setActionsOpen(false);
    setEditingReminder(selectedEntry);
    setSubView('edit');
  }, [selectedEntry]);

  const handleDelete = useCallback(() => {
    if (!selectedEntry) return;
    const entryId = selectedEntry.id;
    const entryName = selectedEntry.title;
    setActionsOpen(false);
    confirmAlert({
      title: `Delete "${entryName}"?`,
      message: 'This reminder will be permanently deleted.',
      icon: <TrashIcon size={32} />,
      primaryAction: {
        label: 'Delete',
        style: 'destructive',
        onAction: () => {
          setEntries(prev => prev.filter(e => e.id !== entryId));
          reminderDb.delete(entryId).catch(console.error);
          invalidateFts();
          showHUD({
            icon: <ReminderHUDIcon />,
            title: 'Reminder Deleted',
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
    (form: ReminderFormState) => {
      const dueDate = new Date(form.dueDate + 'T00:00:00');

      if (subView === 'edit' && editingReminder) {
        const updatedEntry: ReminderEntry = {
          ...editingReminder,
          title: form.title,
          dueDate,
          dueTime: form.dueTime,
          repeat: form.repeat,
          notes: form.notes,
        };
        setEntries(prev =>
          prev.map(e => (e.id === editingReminder.id ? updatedEntry : e)));
        reminderDb
          .update(editingReminder.id, {
            title: form.title,
            due_date: dueDate.toISOString(),
            due_time: form.dueTime,
            repeat: form.repeat,
            notes: form.notes,
          })
          .catch(console.error);
        invalidateFts();
        showHUD({
          icon: <ReminderHUDIcon />,
          title: 'Reminder Updated',
        });
      } else {
        const newEntry: ReminderEntry = {
          id: crypto.randomUUID(),
          title: form.title,
          dueDate,
          dueTime: form.dueTime,
          repeat: form.repeat,
          notes: form.notes,
          completed: false,
          completedAt: null,
          createdAt: new Date(),
        };
        setEntries(prev => [
          newEntry,
          ...prev,
        ]);
        reminderDb.insert(entryToRow(newEntry)).catch(console.error);
        invalidateFts();
        showHUD({
          icon: <ReminderHUDIcon />,
          title: 'Reminder Created',
        });
      }

      setSubView('list');
      setEditingReminder(undefined);
    },
    [
      subView,
      editingReminder,
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
      setEditingReminder(undefined);
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
      key: 'e',
      meta: true,
    },
    handleEdit,
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
  useKeyboardShortcut({ key: 'Enter' }, handleToggleComplete, {
    enabled: subView === 'list' && !actionsOpen,
  });
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
            label: selectedEntry?.completed
              ? 'Mark Incomplete'
              : 'Mark Complete',
            shortcut: <Kbd keys={['↵']} />,
            onClick: handleToggleComplete,
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
              content: selectedEntry?.title ?? '',
              title: 'Copy Title',
              shortcut: (
                <Kbd
                  keys={[
                    '⌘',
                    'C',
                  ]}
                />
              ),
              hudIcon: <ReminderHUDIcon />,
            },
            showHUD,
          ),
          {
            label: 'Create Reminder',
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
      selectedEntry?.completed,
      selectedEntry?.title,
      handleToggleComplete,
      handleEdit,
      handleCreate,
      handleDelete,
      showHUD,
    ],
  );

  const activeDescendantId =
    totalItemCount > 0 ? `list-item-${selectedIndex}` : undefined;

  if (subView !== 'list') {
    const formTitle = subView === 'edit' ? 'Edit Reminder' : 'Create Reminder';
    return (
      <>
        <SearchBar
          value=""
          onChange={() => {}}
          placeholder={formTitle}
          breadcrumbs={[
            ...nav.breadcrumbs,
            {
              label: 'Reminders',
              onBack: handleEscape,
            },
          ]}
        />
        <div className="command-palette__body">
          <div className="command-palette__list-container">
            <EditReminderView
              reminder={subView === 'edit' ? editingReminder : undefined}
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
        {alertState && <Alert {...alertState} onDismiss={dismissAlert} />}
      </>
    );
  }

  return (
    <>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        placeholder="Search Reminders..."
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
              title="No Reminders"
              description={
                query
                  ? 'Try a different search term'
                  : 'Create your first reminder with \u2318N'
              }
            />
          ) : (
            <List
              itemCount={totalItemCount}
              onActiveIndexChange={handleActiveIndexChange}
              onAction={handleToggleComplete}
            >
              {(() => {
                const items: ReactNode[] = [];
                let globalIndex = 0;

                const renderSection = (
                  key: string,
                  title: string,
                  sectionEntries: ReminderEntry[],
                ) => {
                  if (sectionEntries.length === 0) return;
                  items.push(
                    <ListSection key={key} title={title}>
                      {sectionEntries.map(entry => {
                        const idx = globalIndex++;
                        return (
                          <ListItem
                            key={entry.id}
                            index={idx}
                            icon={
                              <button
                                className={`reminder-check${entry.completed ? ' reminder-check--completed' : ''}`}
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleComplete(entry);
                                }}
                                type="button"
                                aria-label={
                                  entry.completed
                                    ? 'Mark incomplete'
                                    : 'Mark complete'
                                }
                              >
                                {entry.completed && <CheckIcon size={12} />}
                              </button>
                            }
                            title={entry.title}
                            subtitle={
                              entry.notes
                                ? entry.notes.length > 60
                                  ? entry.notes.slice(0, 60) + '\u2026'
                                  : entry.notes
                                : undefined
                            }
                            accessories={[
                              ...(entry.repeat !== 'none'
                                ? [
                                    {
                                      text: repeatLabel(entry.repeat),
                                      tooltip: `Repeats ${entry.repeat}`,
                                    },
                                  ]
                                : []),
                              {
                                text: `${formatDueLabel(entry.dueDate, renderNow)} ${formatTime(entry.dueTime)}`,
                                tooltip: `${entry.dueDate.toLocaleDateString()} ${formatTime(entry.dueTime)}`,
                              },
                            ]}
                            query={query || undefined}
                          />
                        );
                      })}
                    </ListSection>,
                  );
                };

                renderSection('overdue', 'Overdue', sections.overdue);
                renderSection('today', 'Today', sections.today);
                renderSection('upcoming', 'Upcoming', sections.upcoming);
                renderSection('completed', 'Completed', sections.completed);

                return items;
              })()}
            </List>
          )}
        </div>
      </div>
      <ActionPanel
        contextLabel="Reminders"
        actions={[
          {
            label: selectedEntry?.completed
              ? 'Mark Incomplete'
              : 'Mark Complete',
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
