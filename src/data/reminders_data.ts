export type RepeatOption = 'none' | 'daily' | 'weekly' | 'monthly';

export interface ReminderEntry {
  id: string;
  title: string;
  dueDate: Date;
  dueTime: string;
  repeat: RepeatOption;
  notes: string;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
}

export const REPEAT_OPTIONS: {
  label: string;
  value: RepeatOption;
}[] = [
  {
    label: 'None',
    value: 'none',
  },
  {
    label: 'Daily',
    value: 'daily',
  },
  {
    label: 'Weekly',
    value: 'weekly',
  },
  {
    label: 'Monthly',
    value: 'monthly',
  },
];

export function isRepeatOption(v: string): v is RepeatOption {
  return v === 'none' || v === 'daily' || v === 'weekly' || v === 'monthly';
}

const today = new Date();
today.setHours(0, 0, 0, 0);

function daysFromNow(days: number): Date {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d;
}

export const MOCK_REMINDER_ENTRIES: ReminderEntry[] = [
  {
    id: 'rem-1',
    title: 'Call dentist to reschedule',
    dueDate: daysFromNow(-3),
    dueTime: '09:00',
    repeat: 'none',
    notes: 'Ask about the new insurance coverage.',
    completed: false,
    completedAt: null,
    createdAt: daysFromNow(-7),
  },
  {
    id: 'rem-2',
    title: 'Submit expense report',
    dueDate: daysFromNow(-1),
    dueTime: '17:00',
    repeat: 'none',
    notes: 'Include receipts from last conference trip.',
    completed: false,
    completedAt: null,
    createdAt: daysFromNow(-5),
  },
  {
    id: 'rem-3',
    title: 'Team standup meeting',
    dueDate: daysFromNow(0),
    dueTime: '10:00',
    repeat: 'daily',
    notes: '',
    completed: false,
    completedAt: null,
    createdAt: daysFromNow(-30),
  },
  {
    id: 'rem-4',
    title: 'Pick up dry cleaning',
    dueDate: daysFromNow(0),
    dueTime: '18:00',
    repeat: 'none',
    notes: '2 shirts and 1 suit jacket.',
    completed: false,
    completedAt: null,
    createdAt: daysFromNow(-2),
  },
  {
    id: 'rem-5',
    title: 'Grocery shopping',
    dueDate: daysFromNow(1),
    dueTime: '11:00',
    repeat: 'weekly',
    notes: 'Milk, eggs, bread, avocados, chicken.',
    completed: false,
    completedAt: null,
    createdAt: daysFromNow(-14),
  },
  {
    id: 'rem-6',
    title: 'Review pull request #432',
    dueDate: daysFromNow(2),
    dueTime: '14:00',
    repeat: 'none',
    notes: 'Authentication refactor — check security implications.',
    completed: false,
    completedAt: null,
    createdAt: daysFromNow(-1),
  },
  {
    id: 'rem-7',
    title: 'Pay rent',
    dueDate: daysFromNow(5),
    dueTime: '08:00',
    repeat: 'monthly',
    notes: '',
    completed: false,
    completedAt: null,
    createdAt: daysFromNow(-60),
  },
  {
    id: 'rem-8',
    title: 'Book flight for conference',
    dueDate: daysFromNow(10),
    dueTime: '12:00',
    repeat: 'none',
    notes: 'Check Southwest and Delta for best prices. Prefer aisle seat.',
    completed: false,
    completedAt: null,
    createdAt: daysFromNow(-3),
  },
  {
    id: 'rem-9',
    title: 'Update project documentation',
    dueDate: daysFromNow(-5),
    dueTime: '16:00',
    repeat: 'none',
    notes: 'API docs need updating after the v2 migration.',
    completed: true,
    completedAt: daysFromNow(-4),
    createdAt: daysFromNow(-10),
  },
  {
    id: 'rem-10',
    title: 'Send birthday card to Mom',
    dueDate: daysFromNow(-2),
    dueTime: '09:00',
    repeat: 'none',
    notes: 'Already bought the card — just need to mail it.',
    completed: true,
    completedAt: daysFromNow(-2),
    createdAt: daysFromNow(-8),
  },
];
