import { isTauri } from '../platform';
import {
  isStringArray,
  storageGet,
  storageRemove,
  storageSet,
} from './storage';

const DB_PATH = 'sqlite:raycast_clone.db';

export interface ClipboardEntryRow {
  id: string;
  content: string;
  content_type: string;
  source_app: string;
  copied_at: string;
  pinned: number;
}

export interface SnippetRow {
  id: string;
  name: string;
  keyword: string;
  content: string;
  category: string;
  tags: string;
  created_at: string;
}

export interface QuicklinkRow {
  id: string;
  name: string;
  link: string;
  type: string;
  application: string | null;
  tags: string;
  created_at: string;
}

export interface NoteRow {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ReminderRow {
  id: string;
  title: string;
  due_date: string;
  due_time: string;
  repeat: string;
  notes: string;
  completed: number;
  completed_at: string | null;
  created_at: string;
}

export interface RecentCommandRow {
  id: number;
  command_id: string;
  used_at: string;
}

export interface SettingRow {
  key: string;
  value: string;
}

type DatabaseInstance = {
  execute(
    query: string,
    bindValues?: unknown[],
  ): Promise<{ rowsAffected: number }>;
  select<T>(query: string, bindValues?: unknown[]): Promise<T>;
};

let dbInstance: DatabaseInstance | undefined;
let dbPromise: Promise<DatabaseInstance> | undefined;

async function loadDb(): Promise<DatabaseInstance> {
  const Database = (await import('@tauri-apps/plugin-sql')).default;
  return Database.load(DB_PATH);
}

function getDb(): Promise<DatabaseInstance> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbPromise) return dbPromise;

  dbPromise = loadDb()
    .then(db => {
      dbInstance = db;
      return db;
    })
    .catch(err => {
      dbPromise = undefined;
      throw err;
    });

  return dbPromise;
}

const CLIPBOARD_COLUMNS = new Set<string>([
  'content',
  'content_type',
  'source_app',
  'copied_at',
  'pinned',
]);

const SNIPPET_COLUMNS = new Set<string>([
  'name',
  'keyword',
  'content',
  'category',
  'tags',
  'created_at',
]);

const QUICKLINK_COLUMNS = new Set<string>([
  'name',
  'link',
  'type',
  'application',
  'tags',
  'created_at',
]);

const NOTE_COLUMNS = new Set<string>([
  'title',
  'content',
  'created_at',
]);

const REMINDER_COLUMNS = new Set<string>([
  'title',
  'due_date',
  'due_time',
  'repeat',
  'notes',
  'completed',
  'completed_at',
  'created_at',
]);

function buildUpdateQuery(
  table: string,
  updates: Record<string, unknown>,
  allowedColumns: Set<string>,
  id: string
): {
  sql: string;
  values: unknown[];
} | null {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (!allowedColumns.has(key)) continue;
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx++;
  }

  if (fields.length === 0) return null;
  values.push(id);
  return {
    sql: `UPDATE ${table} SET ${fields.join(', ')} WHERE id = $${idx}`,
    values,
  };
}

function escapeLikeQuery(query: string): string {
  return query.replace(/[\\%_]/g, ch => `\\${ch}`);
}

function escapeFts5Query(query: string): string {
  return query
    .split(/\s+/)
    .filter(Boolean)
    .map(token => `"${token.replace(/"/g, '""')}"`)
    .join(' ');
}

function isClipboardRowArray(v: unknown): v is ClipboardEntryRow[] {
  if (!Array.isArray(v)) return false;
  return v.every(
    r =>
      typeof r === 'object' &&
      r !== null &&
      'id' in r &&
      typeof r.id === 'string' &&
      'content' in r &&
      typeof r.content === 'string' &&
      'copied_at' in r &&
      typeof r.copied_at === 'string',
  );
}

function isSnippetRowArray(v: unknown): v is SnippetRow[] {
  if (!Array.isArray(v)) return false;
  return v.every(
    r =>
      typeof r === 'object' &&
      r !== null &&
      'id' in r &&
      typeof r.id === 'string' &&
      'name' in r &&
      typeof r.name === 'string',
  );
}

function isQuicklinkRowArray(v: unknown): v is QuicklinkRow[] {
  if (!Array.isArray(v)) return false;
  return v.every(
    r =>
      typeof r === 'object' &&
      r !== null &&
      'id' in r &&
      typeof r.id === 'string' &&
      'name' in r &&
      typeof r.name === 'string' &&
      'link' in r &&
      typeof r.link === 'string',
  );
}

function isNoteRowArray(v: unknown): v is NoteRow[] {
  if (!Array.isArray(v)) return false;
  return v.every(
    r =>
      typeof r === 'object' &&
      r !== null &&
      'id' in r &&
      typeof r.id === 'string' &&
      'title' in r &&
      typeof r.title === 'string',
  );
}

function isReminderRowArray(v: unknown): v is ReminderRow[] {
  if (!Array.isArray(v)) return false;
  return v.every(
    r =>
      typeof r === 'object' &&
      r !== null &&
      'id' in r &&
      typeof r.id === 'string' &&
      'title' in r &&
      typeof r.title === 'string',
  );
}

function isSettingRowArray(v: unknown): v is SettingRow[] {
  if (!Array.isArray(v)) return false;
  return v.every(
    r =>
      typeof r === 'object' &&
      r !== null &&
      'key' in r &&
      typeof r.key === 'string' &&
      'value' in r &&
      typeof r.value === 'string',
  );
}

export const clipboardDb = {
  async getAll(limit = 1000): Promise<ClipboardEntryRow[]> {
    if (isTauri) {
      const db = await getDb();
      return db.select<ClipboardEntryRow[]>(
        'SELECT id, content, content_type, source_app, copied_at, pinned FROM clipboard_entries ORDER BY pinned DESC, copied_at DESC LIMIT $1',
        [limit],
      );
    }
    return storageGet('clipboard-history', isClipboardRowArray) ?? [];
  },
  async getPage(limit: number, offset: number): Promise<ClipboardEntryRow[]> {
    if (isTauri) {
      const db = await getDb();
      return db.select<ClipboardEntryRow[]>(
        'SELECT id, content, content_type, source_app, copied_at, pinned FROM clipboard_entries ORDER BY pinned DESC, copied_at DESC LIMIT $1 OFFSET $2',
        [
          limit,
          offset,
        ],
      );
    }
    const all = await this.getAll();
    return all.slice(offset, offset + limit);
  },
  async insert(entry: ClipboardEntryRow): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute(
        'INSERT INTO clipboard_entries (id, content, content_type, source_app, copied_at, pinned) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          entry.id,
          entry.content,
          entry.content_type,
          entry.source_app,
          entry.copied_at,
          entry.pinned,
        ],
      );
      return;
    }
    const all = await this.getAll();
    all.unshift(entry);
    storageSet('clipboard-history', all);
  },
  async update(
    id: string,
    updates: Partial<Omit<ClipboardEntryRow, 'id'>>,
  ): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      const query = buildUpdateQuery(
        'clipboard_entries',
        updates,
        CLIPBOARD_COLUMNS,
        id,
      );
      if (!query) return;
      await db.execute(query.sql, query.values);
      return;
    }
    const all = await this.getAll();
    const updated = all.map(r =>
      r.id === id
        ? {
            ...r,
            ...updates,
          }
        : r);
    storageSet('clipboard-history', updated);
  },
  async delete(id: string): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute('DELETE FROM clipboard_entries WHERE id = $1', [id]);
      return;
    }
    const all = await this.getAll();
    storageSet(
      'clipboard-history',
      all.filter(r => r.id !== id),
    );
  },
  async clear(): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute('DELETE FROM clipboard_entries');
      return;
    }
    storageRemove('clipboard-history');
  },
  async search(query: string, limit = 50): Promise<ClipboardEntryRow[]> {
    if (isTauri) {
      const escaped = escapeFts5Query(query);
      if (!escaped) return [];
      const db = await getDb();
      return db.select<ClipboardEntryRow[]>(
        `SELECT ce.id, ce.content, ce.content_type, ce.source_app, ce.copied_at, ce.pinned
         FROM clipboard_entries ce
         JOIN clipboard_entries_fts fts ON ce.rowid = fts.rowid
         WHERE clipboard_entries_fts MATCH $1
         ORDER BY ce.pinned DESC, ce.copied_at DESC
         LIMIT $2`,
        [
          escaped,
          limit,
        ],
      );
    }
    const all = await this.getAll();
    const q = query.toLowerCase();
    return all.filter(r => r.content.toLowerCase().includes(q)).slice(0, limit);
  },
};

export const snippetDb = {
  async getAll(): Promise<SnippetRow[]> {
    if (isTauri) {
      const db = await getDb();
      return db.select<SnippetRow[]>(
        'SELECT id, name, keyword, content, category, tags, created_at FROM snippets ORDER BY created_at DESC',
      );
    }
    return storageGet('snippets', isSnippetRowArray) ?? [];
  },
  async insert(snippet: SnippetRow): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute(
        'INSERT INTO snippets (id, name, keyword, content, category, tags, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          snippet.id,
          snippet.name,
          snippet.keyword,
          snippet.content,
          snippet.category,
          snippet.tags,
          snippet.created_at,
        ],
      );
      return;
    }
    const all = await this.getAll();
    all.unshift(snippet);
    storageSet('snippets', all);
  },
  async update(
    id: string,
    updates: Partial<Omit<SnippetRow, 'id'>>,
  ): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      const query = buildUpdateQuery('snippets', updates, SNIPPET_COLUMNS, id);
      if (!query) return;
      await db.execute(query.sql, query.values);
      return;
    }
    const all = await this.getAll();
    const updated = all.map(r =>
      r.id === id
        ? {
            ...r,
            ...updates,
          }
        : r);
    storageSet('snippets', updated);
  },
  async delete(id: string): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute('DELETE FROM snippets WHERE id = $1', [id]);
      return;
    }
    const all = await this.getAll();
    storageSet(
      'snippets',
      all.filter(r => r.id !== id),
    );
  },
  async search(query: string, limit = 50): Promise<SnippetRow[]> {
    if (isTauri) {
      const escaped = escapeFts5Query(query);
      if (!escaped) return [];
      const db = await getDb();
      return db.select<SnippetRow[]>(
        `SELECT s.id, s.name, s.keyword, s.content, s.category, s.tags, s.created_at
         FROM snippets s
         JOIN snippets_fts fts ON s.rowid = fts.rowid
         WHERE snippets_fts MATCH $1
         ORDER BY s.created_at DESC
         LIMIT $2`,
        [
          escaped,
          limit,
        ],
      );
    }
    const all = await this.getAll();
    const q = query.toLowerCase();
    return all
      .filter(
        r =>
          r.name.toLowerCase().includes(q) ||
          r.keyword.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q),
      )
      .slice(0, limit);
  },
};

export const quicklinkDb = {
  async getAll(): Promise<QuicklinkRow[]> {
    if (isTauri) {
      const db = await getDb();
      return db.select<QuicklinkRow[]>(
        'SELECT id, name, link, type, application, tags, created_at FROM quicklinks ORDER BY created_at DESC',
      );
    }
    return storageGet('quicklinks', isQuicklinkRowArray) ?? [];
  },
  async insert(quicklink: QuicklinkRow): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute(
        'INSERT INTO quicklinks (id, name, link, type, application, tags, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          quicklink.id,
          quicklink.name,
          quicklink.link,
          quicklink.type,
          quicklink.application,
          quicklink.tags,
          quicklink.created_at,
        ],
      );
      return;
    }
    const all = await this.getAll();
    all.unshift(quicklink);
    storageSet('quicklinks', all);
  },
  async update(
    id: string,
    updates: Partial<Omit<QuicklinkRow, 'id'>>,
  ): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      const query = buildUpdateQuery(
        'quicklinks',
        updates,
        QUICKLINK_COLUMNS,
        id,
      );
      if (!query) return;
      await db.execute(query.sql, query.values);
      return;
    }
    const all = await this.getAll();
    const updated = all.map(r =>
      r.id === id
        ? {
            ...r,
            ...updates,
          }
        : r);
    storageSet('quicklinks', updated);
  },
  async delete(id: string): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute('DELETE FROM quicklinks WHERE id = $1', [id]);
      return;
    }
    const all = await this.getAll();
    storageSet(
      'quicklinks',
      all.filter(r => r.id !== id),
    );
  },
  async search(query: string, limit = 50): Promise<QuicklinkRow[]> {
    if (isTauri) {
      const escaped = escapeFts5Query(query);
      if (!escaped) return [];
      const db = await getDb();
      return db.select<QuicklinkRow[]>(
        `SELECT q.id, q.name, q.link, q.type, q.application, q.tags, q.created_at
         FROM quicklinks q
         JOIN quicklinks_fts fts ON q.rowid = fts.rowid
         WHERE quicklinks_fts MATCH $1
         ORDER BY q.created_at DESC
         LIMIT $2`,
        [
          escaped,
          limit,
        ],
      );
    }
    const all = await this.getAll();
    const q = query.toLowerCase();
    return all
      .filter(
        r =>
          r.name.toLowerCase().includes(q) || r.link.toLowerCase().includes(q),
      )
      .slice(0, limit);
  },
};

export const noteDb = {
  async getAll(): Promise<NoteRow[]> {
    if (isTauri) {
      const db = await getDb();
      return db.select<NoteRow[]>(
        'SELECT id, title, content, created_at, updated_at FROM notes ORDER BY updated_at DESC',
      );
    }
    return storageGet('notes', isNoteRowArray) ?? [];
  },
  async getById(id: string): Promise<NoteRow | null> {
    if (isTauri) {
      const db = await getDb();
      const rows = await db.select<NoteRow[]>(
        'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = $1',
        [id],
      );
      return rows[0] ?? null;
    }
    const all = await this.getAll();
    return all.find(r => r.id === id) ?? null;
  },
  async insert(note: NoteRow): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute(
        'INSERT INTO notes (id, title, content, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
        [
          note.id,
          note.title,
          note.content,
          note.created_at,
          note.updated_at,
        ],
      );
      return;
    }
    const all = await this.getAll();
    all.unshift(note);
    storageSet('notes', all);
  },
  async update(
    id: string,
    updates: Partial<Omit<NoteRow, 'id' | 'updated_at'>>,
  ): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      const query = buildUpdateQuery('notes', updates, NOTE_COLUMNS, id);
      if (!query) return;
      await db.execute(query.sql, query.values);
      return;
    }
    const all = await this.getAll();
    const now = new Date().toISOString();
    const updated = all.map(r =>
      r.id === id
        ? {
            ...r,
            ...updates,
            updated_at: now,
          }
        : r);
    storageSet('notes', updated);
  },
  async delete(id: string): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute('DELETE FROM notes WHERE id = $1', [id]);
      return;
    }
    const all = await this.getAll();
    storageSet(
      'notes',
      all.filter(r => r.id !== id),
    );
  },
  async search(query: string, limit = 50): Promise<NoteRow[]> {
    if (isTauri) {
      const db = await getDb();
      const escaped = escapeLikeQuery(query);
      return db.select<NoteRow[]>(
        `SELECT id, title, content, created_at, updated_at FROM notes
         WHERE title LIKE $1 ESCAPE '\\' OR content LIKE $1 ESCAPE '\\'
         ORDER BY updated_at DESC
         LIMIT $2`,
        [
          `%${escaped}%`,
          limit,
        ],
      );
    }
    const all = await this.getAll();
    const q = query.toLowerCase();
    return all
      .filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q),
      )
      .slice(0, limit);
  },
};

export const reminderDb = {
  async getAll(): Promise<ReminderRow[]> {
    if (isTauri) {
      const db = await getDb();
      return db.select<ReminderRow[]>(
        'SELECT id, title, due_date, due_time, repeat, notes, completed, completed_at, created_at FROM reminders ORDER BY due_date ASC, due_time ASC',
      );
    }
    return storageGet('reminders', isReminderRowArray) ?? [];
  },
  async insert(reminder: ReminderRow): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute(
        'INSERT INTO reminders (id, title, due_date, due_time, repeat, notes, completed, completed_at, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          reminder.id,
          reminder.title,
          reminder.due_date,
          reminder.due_time,
          reminder.repeat,
          reminder.notes,
          reminder.completed,
          reminder.completed_at,
          reminder.created_at,
        ],
      );
      return;
    }
    const all = await this.getAll();
    all.unshift(reminder);
    storageSet('reminders', all);
  },
  async update(
    id: string,
    updates: Partial<Omit<ReminderRow, 'id'>>,
  ): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      const query = buildUpdateQuery(
        'reminders',
        updates,
        REMINDER_COLUMNS,
        id,
      );
      if (!query) return;
      await db.execute(query.sql, query.values);
      return;
    }
    const all = await this.getAll();
    const updated = all.map(r =>
      r.id === id
        ? {
            ...r,
            ...updates,
          }
        : r);
    storageSet('reminders', updated);
  },
  async delete(id: string): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute('DELETE FROM reminders WHERE id = $1', [id]);
      return;
    }
    const all = await this.getAll();
    storageSet(
      'reminders',
      all.filter(r => r.id !== id),
    );
  },
  async search(query: string, limit = 50): Promise<ReminderRow[]> {
    if (isTauri) {
      const db = await getDb();
      const escaped = escapeLikeQuery(query);
      return db.select<ReminderRow[]>(
        `SELECT id, title, due_date, due_time, repeat, notes, completed, completed_at, created_at FROM reminders
         WHERE title LIKE $1 ESCAPE '\\' OR notes LIKE $1 ESCAPE '\\'
         ORDER BY due_date ASC, due_time ASC
         LIMIT $2`,
        [
          `%${escaped}%`,
          limit,
        ],
      );
    }
    const all = await this.getAll();
    const q = query.toLowerCase();
    return all
      .filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q),
      )
      .slice(0, limit);
  },
};

export const recentCommandDb = {
  async getAll(limit = 10): Promise<string[]> {
    if (isTauri) {
      const db = await getDb();
      const rows = await db.select<Pick<RecentCommandRow, 'command_id'>[]>(
        'SELECT command_id FROM recent_commands ORDER BY used_at DESC LIMIT $1',
        [limit],
      );
      return rows.map(r => r.command_id);
    }
    const stored = storageGet('recent-commands', isStringArray);
    return stored?.slice(0, limit) ?? [];
  },
  async add(commandId: string): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute('DELETE FROM recent_commands WHERE command_id = $1', [
        commandId,
      ]);
      await db.execute('INSERT INTO recent_commands (command_id) VALUES ($1)', [
        commandId,
      ]);
      await db.execute(
        `DELETE FROM recent_commands WHERE id NOT IN (
          SELECT id FROM recent_commands ORDER BY used_at DESC LIMIT 10
        )`,
      );
      return;
    }
    const all = await this.getAll();
    const next = [
      commandId,
      ...all.filter(id => id !== commandId),
    ].slice(0, 10);
    storageSet('recent-commands', next);
  },
  async clear(): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute('DELETE FROM recent_commands');
      return;
    }
    storageRemove('recent-commands');
  },
};

export const settingsDb = {
  async get(key: string): Promise<string | null> {
    if (isTauri) {
      const db = await getDb();
      const rows = await db.select<SettingRow[]>(
        'SELECT value FROM settings WHERE key = $1',
        [key],
      );
      return rows[0]?.value ?? null;
    }
    const all = storageGet('settings-all', isSettingRowArray);
    return all?.find(r => r.key === key)?.value ?? null;
  },
  async set(key: string, value: string): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [
          key,
          value,
        ],
      );
      return;
    }
    const all = storageGet('settings-all', isSettingRowArray) ?? [];
    const existing = all.findIndex(r => r.key === key);
    if (existing >= 0) {
      all[existing] = {
        key,
        value,
      };
    } else {
      all.push({
        key,
        value,
      });
    }
    storageSet('settings-all', all);
  },
  async delete(key: string): Promise<void> {
    if (isTauri) {
      const db = await getDb();
      await db.execute('DELETE FROM settings WHERE key = $1', [key]);
      return;
    }
    const all = storageGet('settings-all', isSettingRowArray) ?? [];
    storageSet(
      'settings-all',
      all.filter(r => r.key !== key),
    );
  },
  async getAll(): Promise<SettingRow[]> {
    if (isTauri) {
      const db = await getDb();
      return db.select<SettingRow[]>('SELECT key, value FROM settings');
    }
    return storageGet('settings-all', isSettingRowArray) ?? [];
  },
};
