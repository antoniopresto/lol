import { useCallback, useMemo, useState } from 'react';
import { type ExtensionEntry, MOCK_EXTENSIONS } from '../../data/settings_data';
import { useAlert } from '../../hooks/use_alert';
import { useHUD } from '../../hooks/use_hud';
import { useKeyboardShortcut } from '../../hooks/use_keyboard_shortcut';
import { useNavigation } from '../../hooks/use_navigation';
import { useTheme } from '../../hooks/use_theme';
import { useWindow } from '../../hooks/use_window';
import {
  isBooleanRecord,
  isRecord,
  storageGet,
  storageRemove,
  storageSet,
} from '../../utils/storage';
import { ActionPanel } from '../action_panel/action_panel';
import { CopyHUDIcon } from '../action_panel/actions';
import type { DropdownSection } from '../action_panel/actions_dropdown';
import { Alert } from '../alert/alert';
import { EmptyState } from '../empty_state/empty_state';
import { FormCheckbox } from '../form/form_checkbox';
import { FormDropdown } from '../form/form_dropdown';
import { FormSeparator } from '../form/form_separator';
import { HUDContainer } from '../hud/hud_container';
import { Kbd } from '../kbd/kbd';
import { SearchBar } from '../search_bar/search_bar';
import type { SearchDropdownSection } from '../search_bar/search_dropdown';
import { SearchDropdown } from '../search_bar/search_dropdown';
import './settings_view.scss';

type SettingsTab = 'general' | 'extensions' | 'advanced';

const SETTINGS_TABS: SettingsTab[] = [
  'general',
  'extensions',
  'advanced',
];

function isSettingsTab(value: string): value is SettingsTab {
  return SETTINGS_TABS.includes(value as SettingsTab);
}

interface GeneralSettings {
  appearance: string;
  windowPosition: string;
  windowWidth: string;
  showRecentApps: boolean;
  showDock: boolean;
  fontSize: string;
}

const SETTINGS_STORAGE_KEY = 'settings-general';
const EXTENSIONS_STORAGE_KEY = 'settings-extensions';

const DEFAULT_SETTINGS: GeneralSettings = {
  appearance: 'dark',
  windowPosition: 'top-third',
  windowWidth: 'medium',
  showRecentApps: true,
  showDock: true,
  fontSize: 'default',
};

function isGeneralSettings(value: unknown): value is GeneralSettings {
  if (!isRecord(value)) return false;
  return (
    typeof value.appearance === 'string' &&
    typeof value.windowWidth === 'string' &&
    typeof value.showRecentApps === 'boolean' &&
    typeof value.showDock === 'boolean' &&
    typeof value.fontSize === 'string' &&
    (value.windowPosition === undefined ||
      typeof value.windowPosition === 'string')
  );
}

function loadSettings(themePreference: string): GeneralSettings {
  const stored = storageGet(SETTINGS_STORAGE_KEY, isGeneralSettings);
  if (stored)
    return {
      ...stored,
      appearance: themePreference,
    };
  return {
    ...DEFAULT_SETTINGS,
    appearance: themePreference,
  };
}

function loadExtensions(): ExtensionEntry[] {
  const states = storageGet(EXTENSIONS_STORAGE_KEY, isBooleanRecord);
  return MOCK_EXTENSIONS.map(ext => ({
    ...ext,
    enabled: states ? (states[ext.id] ?? ext.enabled) : ext.enabled,
  }));
}

const TAB_SECTIONS: SearchDropdownSection[] = [
  {
    options: [
      {
        label: 'General',
        value: 'general',
      },
      {
        label: 'Extensions',
        value: 'extensions',
      },
      {
        label: 'Advanced',
        value: 'advanced',
      },
    ],
  },
];

const APPEARANCE_OPTIONS = [
  {
    label: 'Dark',
    value: 'dark',
  },
  {
    label: 'Light',
    value: 'light',
  },
  {
    label: 'System',
    value: 'system',
  },
];

const WINDOW_WIDTH_OPTIONS = [
  {
    label: 'Small (680px)',
    value: 'small',
  },
  {
    label: 'Medium (750px)',
    value: 'medium',
  },
  {
    label: 'Large (820px)',
    value: 'large',
  },
];

const WINDOW_POSITION_OPTIONS = [
  {
    label: 'Top Third',
    value: 'top-third',
  },
  {
    label: 'Center',
    value: 'center',
  },
];

const FONT_SIZE_OPTIONS = [
  {
    label: 'Small',
    value: 'small',
  },
  {
    label: 'Default',
    value: 'default',
  },
  {
    label: 'Large',
    value: 'large',
  },
];

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="settings-toggle" onClick={e => e.stopPropagation()}>
      <input
        type="checkbox"
        className="settings-toggle__input"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        aria-label={label}
      />
      <div className="settings-toggle__track" />
      <div className="settings-toggle__knob" />
    </label>
  );
}

function ExportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2v8M4.5 6L8 2l3.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 11v2.5h10V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 10V2M4.5 6L8 10l3.5-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 11v2.5h10V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIconSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M12 5v8.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5M3 5h10M6.5 5V3.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1V5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

function RefreshIconSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M13 8A5 5 0 1 1 8 3h3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 1l2 2-2 2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GeneralTab({
  settings,
  onSettingsChange,
  onWindowPositionChange,
}: {
  settings: GeneralSettings;
  onSettingsChange: (settings: GeneralSettings) => void;
  onWindowPositionChange: (position: string) => void;
}) {
  return (
    <div className="form">
      <div className="form__fields">
        <FormDropdown
          label="Appearance"
          value={settings.appearance}
          onChange={v =>
            onSettingsChange({
              ...settings,
              appearance: v,
            })
          }
          options={APPEARANCE_OPTIONS}
        />
        <FormDropdown
          label="Window Position"
          value={settings.windowPosition}
          onChange={v => {
            onSettingsChange({
              ...settings,
              windowPosition: v,
            });
            onWindowPositionChange(v);
          }}
          options={WINDOW_POSITION_OPTIONS}
        />
        <FormDropdown
          label="Window Width"
          value={settings.windowWidth}
          onChange={v =>
            onSettingsChange({
              ...settings,
              windowWidth: v,
            })
          }
          options={WINDOW_WIDTH_OPTIONS}
        />
        <FormDropdown
          label="Font Size"
          value={settings.fontSize}
          onChange={v =>
            onSettingsChange({
              ...settings,
              fontSize: v,
            })
          }
          options={FONT_SIZE_OPTIONS}
        />
        <FormSeparator />
        <FormCheckbox
          label="Show Recent Applications"
          checked={settings.showRecentApps}
          onChange={v =>
            onSettingsChange({
              ...settings,
              showRecentApps: v,
            })
          }
          description="Display recently used apps in the root search"
        />
        <FormCheckbox
          label="Show Dock Apps"
          checked={settings.showDock}
          onChange={v =>
            onSettingsChange({
              ...settings,
              showDock: v,
            })
          }
          description="Include Dock applications in search results"
        />
        <FormSeparator />
        <div className="settings-hotkey">
          <span className="settings-hotkey__label">Raycast Hotkey</span>
          <Kbd
            keys={[
              '⌥',
              'Space',
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function ExtensionRow({
  ext,
  onToggle,
  showAuthor,
}: {
  ext: ExtensionEntry;
  onToggle: (id: string) => void;
  showAuthor: boolean;
}) {
  return (
    <div
      className="settings-extension"
      onClick={() => onToggle(ext.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle(ext.id);
        }
      }}
    >
      <div className="settings-extension__icon">{ext.icon()}</div>
      <div className="settings-extension__info">
        <div className="settings-extension__name">{ext.name}</div>
        <div className="settings-extension__meta">
          {ext.description}
          {showAuthor && <> &middot; {ext.author}</>}
        </div>
      </div>
      <div className="settings-extension__toggle">
        <ToggleSwitch
          checked={ext.enabled}
          onChange={() => onToggle(ext.id)}
          label={`Toggle ${ext.name}`}
        />
      </div>
    </div>
  );
}

function ExtensionsTab({
  extensions,
  onToggle,
  query,
}: {
  extensions: ExtensionEntry[];
  onToggle: (id: string) => void;
  query: string;
}) {
  const filtered = useMemo(() => {
    if (!query) return extensions;
    const lower = query.toLowerCase();
    return extensions.filter(
      ext =>
        ext.name.toLowerCase().includes(lower) ||
        ext.description.toLowerCase().includes(lower) ||
        ext.author.toLowerCase().includes(lower),
    );
  }, [
    extensions,
    query,
  ]);

  const raycastExts = filtered.filter(ext => ext.author === 'Raycast');
  const communityExts = filtered.filter(ext => ext.author !== 'Raycast');

  return (
    <div className="settings-view__extensions">
      {filtered.length === 0 ? (
        <EmptyState
          icon={<SearchEmptyIcon />}
          title="No Extensions Found"
          description="Try a different search term"
        />
      ) : (
        <>
          {raycastExts.length > 0 && (
            <div className="settings-section">
              <div className="settings-section__title">Built-in</div>
              {raycastExts.map(ext => (
                <ExtensionRow
                  key={ext.id}
                  ext={ext}
                  onToggle={onToggle}
                  showAuthor={false}
                />
              ))}
            </div>
          )}
          {communityExts.length > 0 && (
            <div className="settings-section">
              <div className="settings-section__title">Community</div>
              {communityExts.map(ext => (
                <ExtensionRow
                  key={ext.id}
                  ext={ext}
                  onToggle={onToggle}
                  showAuthor
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdvancedTab({
  onExport,
  onImport,
  onClearCache,
  onResetAll,
}: {
  onExport: () => void;
  onImport: () => void;
  onClearCache: () => void;
  onResetAll: () => void;
}) {
  return (
    <div className="settings-view__advanced">
      <div className="settings-section">
        <div className="settings-section__title">Data</div>
        <div
          className="settings-action-row"
          onClick={onExport}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onExport();
            }
          }}
        >
          <div className="settings-action-row__icon">
            <ExportIcon />
          </div>
          <span className="settings-action-row__label">Export Settings</span>
          <span className="settings-action-row__hint">Save as JSON</span>
        </div>
        <div
          className="settings-action-row"
          onClick={onImport}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onImport();
            }
          }}
        >
          <div className="settings-action-row__icon">
            <ImportIcon />
          </div>
          <span className="settings-action-row__label">Import Settings</span>
          <span className="settings-action-row__hint">Load from JSON</span>
        </div>
      </div>
      <div className="settings-section">
        <div className="settings-section__title">Maintenance</div>
        <div
          className="settings-action-row"
          onClick={onClearCache}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClearCache();
            }
          }}
        >
          <div className="settings-action-row__icon">
            <RefreshIconSmall />
          </div>
          <span className="settings-action-row__label">Clear Cache</span>
          <span className="settings-action-row__hint">Free up space</span>
        </div>
        <div
          className="settings-action-row settings-action-row--destructive"
          onClick={onResetAll}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onResetAll();
            }
          }}
        >
          <div className="settings-action-row__icon">
            <TrashIconSmall />
          </div>
          <span className="settings-action-row__label">Reset All Settings</span>
        </div>
      </div>
    </div>
  );
}

export function SettingsView() {
  const nav = useNavigation();
  const { preference: themePreference, setTheme } = useTheme();
  const { setPositionPreference } = useWindow();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [actionsOpen, setActionsOpen] = useState(false);
  const [settings, setSettings] = useState<GeneralSettings>(() =>
    loadSettings(themePreference));
  const [extensions, setExtensions] =
    useState<ExtensionEntry[]>(loadExtensions);
  const { items: hudItems, show: showHUD } = useHUD();
  const { alertState, confirmAlert, dismiss: dismissAlert } = useAlert();

  const handleSettingsChange = useCallback(
    (newSettings: GeneralSettings) => {
      setSettings(newSettings);
      storageSet(SETTINGS_STORAGE_KEY, newSettings);
      if (
        newSettings.appearance === 'dark' ||
        newSettings.appearance === 'light' ||
        newSettings.appearance === 'system'
      ) {
        setTheme(newSettings.appearance);
      }
    },
    [setTheme],
  );

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleTabChange = useCallback((value: string) => {
    if (isSettingsTab(value)) {
      setActiveTab(value);
      setQuery('');
    }
  }, []);

  const handleToggleExtension = useCallback((id: string) => {
    setExtensions(prev => {
      const next = prev.map(ext =>
        ext.id === id
          ? {
              ...ext,
              enabled: !ext.enabled,
            }
          : ext);
      const states: Record<string, boolean> = {};
      for (const ext of next) {
        states[ext.id] = ext.enabled;
      }
      storageSet(EXTENSIONS_STORAGE_KEY, states);
      return next;
    });
  }, []);

  const handleExport = useCallback(() => {
    showHUD({
      icon: <CopyHUDIcon />,
      title: 'Settings Exported',
    });
  }, [showHUD]);

  const handleImport = useCallback(() => {
    showHUD({
      icon: <CopyHUDIcon />,
      title: 'Settings Imported',
    });
  }, [showHUD]);

  const handleClearCache = useCallback(() => {
    showHUD({
      icon: <CopyHUDIcon />,
      title: 'Cache Cleared',
    });
  }, [showHUD]);

  const handleResetAll = useCallback(() => {
    setActionsOpen(false);
    confirmAlert({
      title: 'Reset All Settings?',
      message:
        'This will restore all settings to their defaults. This action cannot be undone.',
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
        label: 'Reset',
        style: 'destructive',
        onAction: () => {
          setSettings({ ...DEFAULT_SETTINGS });
          storageRemove(SETTINGS_STORAGE_KEY);
          setTheme('dark');
          setPositionPreference(DEFAULT_SETTINGS.windowPosition);
          setExtensions(MOCK_EXTENSIONS.map(ext => ({ ...ext })));
          storageRemove(EXTENSIONS_STORAGE_KEY);
          showHUD({
            icon: <CopyHUDIcon />,
            title: 'Settings Reset',
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
    confirmAlert,
    showHUD,
    setTheme,
    setPositionPreference,
  ]);

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

  const dropdownSections: DropdownSection[] = useMemo(() => {
    const sections: DropdownSection[] = [
      {
        title: 'Navigation',
        actions: [
          {
            label: 'General',
            onClick: () => {
              setActiveTab('general');
              setActionsOpen(false);
            },
          },
          {
            label: 'Extensions',
            onClick: () => {
              setActiveTab('extensions');
              setActionsOpen(false);
            },
          },
          {
            label: 'Advanced',
            onClick: () => {
              setActiveTab('advanced');
              setActionsOpen(false);
            },
          },
        ],
      },
    ];

    if (activeTab === 'advanced') {
      sections.push({
        title: 'Actions',
        actions: [
          {
            label: 'Export Settings',
            onClick: handleExport,
          },
          {
            label: 'Import Settings',
            onClick: handleImport,
          },
          {
            label: 'Clear Cache',
            onClick: handleClearCache,
          },
          {
            label: 'Reset All Settings',
            onClick: handleResetAll,
          },
        ],
      });
    }

    return sections;
  }, [
    activeTab,
    handleExport,
    handleImport,
    handleClearCache,
    handleResetAll,
  ]);

  return (
    <>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        placeholder={
          activeTab === 'extensions' ? 'Search Extensions...' : 'Settings'
        }
        breadcrumbs={nav.breadcrumbs.length > 0 ? nav.breadcrumbs : undefined}
        dropdown={
          <SearchDropdown
            sections={TAB_SECTIONS}
            value={activeTab}
            onChange={handleTabChange}
          />
        }
      />
      <div className="command-palette__body">
        <div className="command-palette__list-container">
          <div className="settings-view">
            {activeTab === 'general' && (
              <GeneralTab
                settings={settings}
                onSettingsChange={handleSettingsChange}
                onWindowPositionChange={setPositionPreference}
              />
            )}
            {activeTab === 'extensions' && (
              <ExtensionsTab
                extensions={extensions}
                onToggle={handleToggleExtension}
                query={query}
              />
            )}
            {activeTab === 'advanced' && (
              <AdvancedTab
                onExport={handleExport}
                onImport={handleImport}
                onClearCache={handleClearCache}
                onResetAll={handleResetAll}
              />
            )}
          </div>
        </div>
      </div>
      <ActionPanel
        contextLabel="Settings"
        actions={[
          {
            label: 'Select',
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
