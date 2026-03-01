export interface NoteEntry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export const MOCK_NOTE_ENTRIES: NoteEntry[] = [
  {
    id: 'note-1',
    title: 'Meeting Notes - Sprint Planning',
    content:
      '## Sprint Goals\n\n- Finish authentication flow\n- Implement dashboard charts\n- Fix mobile responsiveness issues\n\n## Action Items\n\n- [ ] Review PR #234\n- [ ] Update API docs\n- [x] Deploy staging environment',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'note-2',
    title: 'Quick Reminder',
    content: 'Call dentist to reschedule appointment for next Tuesday.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: 'note-3',
    title: 'API Design Notes',
    content:
      '### Endpoints\n\n```\nGET /api/users/:id\nPOST /api/users\nPUT /api/users/:id\nDELETE /api/users/:id\n```\n\n### Authentication\n\nUse JWT tokens with 24h expiry. Refresh tokens stored in httpOnly cookies.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: 'note-4',
    title: 'Book Recommendations',
    content:
      '- **Designing Data-Intensive Applications** by Martin Kleppmann\n- **Clean Architecture** by Robert C. Martin\n- **The Pragmatic Programmer** by Hunt & Thomas\n- **Refactoring** by Martin Fowler',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'note-5',
    title: 'Git Workflow',
    content:
      '```bash\ngit checkout -b feature/my-feature\ngit add -p\ngit commit -m "feat: description"\ngit push -u origin feature/my-feature\n```\n\nAlways rebase before merging to main.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: 'note-6',
    title: 'Grocery List',
    content:
      '- Milk\n- Eggs\n- Bread\n- Avocados\n- Chicken breast\n- Brown rice\n- Spinach\n- Bananas',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: 'note-7',
    title: 'Project Ideas',
    content:
      '1. CLI tool for project scaffolding\n2. Browser extension for tab management\n3. Markdown-based presentation tool\n4. Real-time collaborative whiteboard\n5. Personal finance tracker with charts',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
  },
  {
    id: 'note-8',
    title: 'Docker Cheat Sheet',
    content:
      '```bash\ndocker build -t myapp .\ndocker run -d -p 3000:3000 myapp\ndocker compose up -d\ndocker logs -f container_id\ndocker exec -it container_id /bin/sh\n```\n\nCleanup: `docker system prune -a`',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 168),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
  },
  {
    id: 'note-9',
    title: 'Keyboard Shortcuts',
    content:
      '| Action | Shortcut |\n|--------|----------|\n| Save | ⌘S |\n| Find | ⌘F |\n| Replace | ⌘⌥F |\n| Terminal | ⌃` |\n| Command Palette | ⌘⇧P |',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 168),
  },
  {
    id: 'note-10',
    title: 'CSS Grid Patterns',
    content:
      '```css\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 16px;\n}\n\n.sidebar-layout {\n  display: grid;\n  grid-template-columns: 240px 1fr;\n  min-height: 100vh;\n}\n```',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 336),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 240),
  },
];
