import type { ListItemData, SectionData } from '../types';
import { fuzzyScore } from '../utils/fuzzy_search';
import type { CommandRegistration, ExtensionManifest } from './types';

const commands = new Map<string, CommandRegistration>();

const sectionOrder: string[] = [];

export function registerCommand(cmd: CommandRegistration): void {
  if (import.meta.env.DEV && commands.has(cmd.id)) {
    console.warn(`Command "${cmd.id}" is already registered. Overwriting.`);
  }
  commands.set(cmd.id, cmd);
  if (!sectionOrder.includes(cmd.section)) {
    sectionOrder.push(cmd.section);
  }
}

export function registerExtension(manifest: ExtensionManifest): void {
  for (const cmd of manifest.commands) {
    const section = cmd.section ?? manifest.name;
    registerCommand({
      id: cmd.name,
      name: cmd.title,
      subtitle: cmd.subtitle,
      icon: cmd.icon,
      keywords: cmd.keywords,
      aliases: cmd.aliases,
      section,
      accessories: cmd.accessories,
      detail: cmd.detail,
      component: cmd.component,
      fullView: cmd.fullView,
      extensionId: manifest.id,
    });
  }
}

export function getCommand(id: string): CommandRegistration | undefined {
  return commands.get(id);
}

function toListItem(cmd: CommandRegistration): ListItemData {
  return {
    id: cmd.id,
    title: cmd.name,
    subtitle: cmd.subtitle,
    icon: cmd.icon,
    accessories: cmd.accessories,
    detail: cmd.detail,
  };
}

export function getSections(): SectionData[] {
  const grouped = new Map<string, ListItemData[]>();

  for (const section of sectionOrder) {
    grouped.set(section, []);
  }

  for (const cmd of commands.values()) {
    let items = grouped.get(cmd.section);
    if (!items) {
      items = [];
      grouped.set(cmd.section, items);
    }
    items.push(toListItem(cmd));
  }

  const sections: SectionData[] = [];
  for (const [title, items] of grouped) {
    if (items.length > 0) {
      sections.push({
        title,
        items,
      });
    }
  }
  return sections;
}

interface ScoredItem {
  item: ListItemData;
  score: number;
  section: string;
}

function scoreItem(item: ListItemData, query: string): number {
  const cmd = commands.get(item.id);
  const candidates: string[] = [item.title];
  if (item.subtitle) candidates.push(item.subtitle);
  if (cmd?.keywords) candidates.push(...cmd.keywords);
  if (cmd?.aliases) candidates.push(...cmd.aliases);

  let best = -Infinity;
  for (const text of candidates) {
    const result = fuzzyScore(query, text);
    if (result && result.score > best) {
      best = result.score;
    }
  }
  return best;
}

export function searchCommands(query: string): SectionData[] {
  if (!query) return getSections();

  const sections = getSections();
  const scored: ScoredItem[] = [];

  for (const section of sections) {
    for (const item of section.items) {
      const s = scoreItem(item, query);
      if (s > -Infinity) {
        scored.push({
          item,
          score: s,
          section: section.title,
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const sectionMap = new Map<string, ListItemData[]>();
  for (const { item, section } of scored) {
    let items = sectionMap.get(section);
    if (!items) {
      items = [];
      sectionMap.set(section, items);
    }
    items.push(item);
  }

  const result: SectionData[] = [];
  for (const section of sections) {
    const items = sectionMap.get(section.title);
    if (items && items.length > 0) {
      result.push({
        title: section.title,
        items,
      });
    }
  }
  return result;
}
