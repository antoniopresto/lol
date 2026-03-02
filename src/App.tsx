import { useCallback, useState } from 'react';
import { NavViewData, TRAY_COMMAND_MAP } from './app_types';
import { ActionPanel } from './components/action_panel/action_panel';
import { CommandPalette } from './components/command_palette/command_palette';
import { DetailItemView } from './components/detail/detail_item_view';
import { ErrorBoundary } from './components/error_boundary/error_boundary';
import { Kbd } from './components/kbd/kbd';
import { RootSearchView } from './components/root_search';
import { SearchBar } from './components/search_bar/search_bar';
import {
  NavigationContextProvider,
  useNavigationStack,
} from './hooks/use_navigation';
import { useRecentCommands } from './hooks/use_recent_commands';
import { useTheme } from './hooks/use_theme';
import { useWindow } from './hooks/use_window';
import { getCommand } from './registry';

function renderNavView(data: NavViewData) {
  if (data.type === 'command') {
    const cmd = getCommand(data.commandId);
    if (cmd?.component) {
      const Component = cmd.component;
      return <Component />;
    }
    return null;
  }

  if (data.type === 'detail') {
    return <DetailItemView item={data.item} />;
  }

  return null;
}

export function App() {
  useTheme();
  const nav = useNavigationStack<NavViewData>('Raycast');
  const { push, popToRoot } = nav;
  const { addRecent } = useRecentCommands();
  const [isCompact, setIsCompact] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [rootResetKey, setRootResetKey] = useState(0);

  const handleTrayNavigate = useCallback(
    (target: string) => {
      const mapping = TRAY_COMMAND_MAP[target];
      if (!mapping) return;

      const cmd = getCommand(mapping.id);
      if (!cmd?.component) return;

      popToRoot();
      addRecent(mapping.id);
      push(mapping.name, {
        type: 'command',
        commandId: mapping.id,
      });
    },
    [
      push,
      popToRoot,
      addRecent,
    ],
  );

  useWindow({
    onShow: () => {
      const input =
        document.querySelector<HTMLInputElement>('.search-bar__input');
      input?.focus();
    },
    onHide: () => {
      popToRoot();
      setRootResetKey(k => k + 1);
    },
    onTrayNavigate: handleTrayNavigate,
  });

  const currentNavData = nav.currentEntry?.data;
  const isFullView =
    currentNavData?.type === 'command' &&
    (getCommand(currentNavData.commandId)?.fullView ?? false);

  const navDirectionClass =
    nav.direction === 'push'
      ? ' command-palette__nav-view--push'
      : nav.direction === 'pop'
        ? ' command-palette__nav-view--pop'
        : '';

  const isRoot = !currentNavData;
  const compact = isRoot && isCompact;

  const contextLabel =
    nav.breadcrumbs.length > 0
      ? nav.breadcrumbs[nav.breadcrumbs.length - 1]!.label
      : 'Raycast';

  return (
    <NavigationContextProvider value={nav}>
      <CommandPalette isLoading={isLoading} compact={compact}>
        {isFullView && nav.currentEntry ? (
          <ErrorBoundary key={nav.navKey} onReset={nav.pop}>
            <div className={`command-palette__nav-view${navDirectionClass}`}>
              {renderNavView(nav.currentEntry.data)}
            </div>
          </ErrorBoundary>
        ) : nav.currentEntry ? (
          <>
            <SearchBar
              value=""
              onChange={() => {}}
              breadcrumbs={
                nav.breadcrumbs.length > 0 ? nav.breadcrumbs : undefined
              }
            />
            <ErrorBoundary key={nav.navKey} onReset={nav.pop}>
              <div className={`command-palette__nav-view${navDirectionClass}`}>
                <div className="command-palette__body">
                  <div className="command-palette__list-container">
                    {renderNavView(nav.currentEntry.data)}
                  </div>
                </div>
              </div>
            </ErrorBoundary>
            <ActionPanel
              contextLabel={contextLabel}
              actions={[
                {
                  label: 'Open',
                  shortcut: <Kbd keys={['↵']} />,
                },
              ]}
              dropdownOpen={false}
              dropdownSections={[]}
              onDropdownClose={() => {}}
            />
          </>
        ) : (
          <RootSearchView
            key={rootResetKey}
            onCompactChange={setIsCompact}
            onLoadingChange={setIsLoading}
          />
        )}
      </CommandPalette>
    </NavigationContextProvider>
  );
}
