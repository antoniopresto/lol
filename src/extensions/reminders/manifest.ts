import { RemindersIcon } from '../../components/icons';
import { RemindersView } from '../../components/reminders/reminders_view';
import type { ExtensionManifest } from '../../registry/types';

export const remindersExtension: ExtensionManifest = {
  id: 'reminders',
  name: 'Reminders',
  icon: RemindersIcon(),
  description:
    'Create and manage reminders with due dates, times, and repeat options.',
  author: 'Raycast',
  commands: [
    {
      name: 'reminders',
      title: 'Reminders',
      subtitle: 'Reminders',
      icon: RemindersIcon(),
      keywords: [
        'reminder',
        'reminders',
        'schedule',
        'due',
        'task',
        'todo',
        'alarm',
      ],
      mode: 'view',
      component: RemindersView,
      fullView: true,
      section: 'Suggestions',
      accessories: [{ text: 'Raycast' }],
      detail: {
        markdown: `# Reminders

Create and manage reminders with due dates, times, and repeat options.

## Features
- Overdue, Today, Upcoming, and Completed sections
- Daily, weekly, and monthly repeat options
- Toggle completion with Enter
- Full-text search across reminders`,
        metadata: [
          {
            type: 'label',
            title: 'Application',
            text: 'Raycast',
          },
          {
            type: 'label',
            title: 'Type',
            text: 'Command',
          },
        ],
      },
    },
  ],
};
