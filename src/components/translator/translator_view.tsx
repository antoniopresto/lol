import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TranslationHistoryEntry } from '../../data/translator_data';
import {
  MOCK_HISTORY,
  SUPPORTED_LANGUAGES,
  TARGET_LANGUAGES,
  mockTranslate,
} from '../../data/translator_data';
import { useHUD } from '../../hooks/use_hud';
import { useKeyboardShortcut } from '../../hooks/use_keyboard_shortcut';
import { useNavigation } from '../../hooks/use_navigation';
import { formatRelativeDate } from '../../utils/format_date';
import { fuzzyMatch } from '../../utils/fuzzy_search';
import { ActionPanel } from '../action_panel/action_panel';
import { createCopyAction, performCopy } from '../action_panel/actions';
import type { DropdownSection } from '../action_panel/actions_dropdown';
import { EmptyState } from '../empty_state/empty_state';
import { HUDContainer } from '../hud/hud_container';
import { GlobeIcon } from '../icons';
import { Kbd } from '../kbd/kbd';
import { List, ListItem, ListSection } from '../list';
import { SearchBar } from '../search_bar/search_bar';
import { SearchDropdown } from '../search_bar/search_dropdown';
import './translator_view.scss';

function TranslateHUDIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 3h5M4.5 3v-1M3.5 3c0 1.5 1 3 3 4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 3c0 1.5-1 3-3 4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 14l2-5.5 2 5.5M9.25 12.5h2.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M4 2l-2.5 2.5L4 7M10 7l2.5 2.5L10 12"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 4.5h11M12.5 9.5h-11"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TranslateEmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path
        d="M8 12h16M16 12V8M12 12c0 5 3.5 10 10 13"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 12c0 5-3.5 10-10 13"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26 40l6-16 6 16M28.5 35h7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function langName(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang?.name ?? code;
}

type TranslatorSubView = 'translate' | 'history';

export function TranslatorView() {
  const nav = useNavigation();
  const [subView, setSubView] = useState<TranslatorSubView>('translate');
  const [sourceText, setSourceText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [detectedLang, setDetectedLang] = useState<string | undefined>();
  const [history, setHistory] = useState<TranslationHistoryEntry[]>(() =>
    MOCK_HISTORY.map(e => ({ ...e })));
  const [historyQuery, setHistoryQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const { items: hudItems, show: showHUD } = useHUD();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [translatedText, setTranslatedText] = useState('');

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!sourceText.trim()) {
      setTranslatedText('');
      setDetectedLang(undefined);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const result = mockTranslate(sourceText, sourceLang, targetLang);
      setTranslatedText(result.translated);
      setDetectedLang(result.detectedLang);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    sourceText,
    sourceLang,
    targetLang,
  ]);

  const filteredHistory = useMemo(() => {
    if (!historyQuery) return history;
    return history.filter(
      e =>
        fuzzyMatch(historyQuery, e.sourceText) ||
        fuzzyMatch(historyQuery, e.translatedText),
    );
  }, [
    history,
    historyQuery,
  ]);

  const sourceLangSections = useMemo(
    () => [
      {
        options: SUPPORTED_LANGUAGES.map(l => ({
          value: l.code,
          label: l.name,
        })),
      },
    ],
    [],
  );

  const targetLangSections = useMemo(
    () => [
      {
        options: TARGET_LANGUAGES.map(l => ({
          value: l.code,
          label: l.name,
        })),
      },
    ],
    [],
  );

  const handleSwapLanguages = useCallback(() => {
    if (sourceLang === 'auto') return;
    const prevSource = sourceLang;
    const prevTarget = targetLang;
    const prevTranslated = translatedText;
    setSourceLang(prevTarget);
    setTargetLang(prevSource);
    setSourceText(prevTranslated);
    setDetectedLang(undefined);
  }, [
    sourceLang,
    targetLang,
    translatedText,
  ]);

  const handleCopyTranslation = useCallback(() => {
    if (!translatedText) return;
    setActionsOpen(false);
    performCopy(translatedText, showHUD, {
      hudIcon: <TranslateHUDIcon />,
      hudTitle: 'Translation Copied',
    });
  }, [
    translatedText,
    showHUD,
  ]);

  const handleCopySource = useCallback(() => {
    if (!sourceText) return;
    setActionsOpen(false);
    performCopy(sourceText, showHUD, {
      hudIcon: <TranslateHUDIcon />,
      hudTitle: 'Source Copied',
    });
  }, [
    sourceText,
    showHUD,
  ]);

  const handleSaveToHistory = useCallback(() => {
    if (!sourceText.trim() || !translatedText.trim()) return;
    const entry: TranslationHistoryEntry = {
      id: crypto.randomUUID(),
      sourceText: sourceText.trim(),
      translatedText: translatedText.trim(),
      sourceLang: detectedLang ?? sourceLang,
      targetLang,
      detectedLang,
      createdAt: new Date(),
    };
    setHistory(prev => [
      entry,
      ...prev,
    ]);
    showHUD({
      icon: <TranslateHUDIcon />,
      title: 'Saved to History',
    });
  }, [
    sourceText,
    translatedText,
    sourceLang,
    targetLang,
    detectedLang,
    showHUD,
  ]);

  const handleClearSource = useCallback(() => {
    setSourceText('');
    setTranslatedText('');
    setDetectedLang(undefined);
    textareaRef.current?.focus();
  }, []);

  const handleShowHistory = useCallback(() => {
    setActionsOpen(false);
    setSubView('history');
    setHistoryQuery('');
    setSelectedIndex(0);
  }, []);

  const handleBackToTranslate = useCallback(() => {
    setSubView('translate');
  }, []);

  const handleHistoryQueryChange = useCallback((value: string) => {
    setHistoryQuery(value);
    setSelectedIndex(0);
    setActionsOpen(false);
  }, []);

  const handleActiveIndexChange = useCallback((index: number) => {
    setSelectedIndex(index);
    setActionsOpen(false);
  }, []);

  const handleHistorySelect = useCallback(() => {
    const entry = filteredHistory[selectedIndex];
    if (!entry) return;
    setSourceText(entry.sourceText);
    setSourceLang(entry.sourceLang);
    setTargetLang(entry.targetLang);
    setSubView('translate');
  }, [
    filteredHistory,
    selectedIndex,
  ]);

  const handleHistoryCopy = useCallback(() => {
    const entry = filteredHistory[selectedIndex];
    if (!entry) return;
    setActionsOpen(false);
    performCopy(entry.translatedText, showHUD, {
      hudIcon: <TranslateHUDIcon />,
      hudTitle: 'Translation Copied',
    });
  }, [
    filteredHistory,
    selectedIndex,
    showHUD,
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
  const handleCopyShortcut = useCallback(() => {
    if (
      subView === 'translate' &&
      document.activeElement === textareaRef.current
    ) {
      return;
    }
    if (subView === 'translate') {
      handleCopyTranslation();
    } else {
      handleHistoryCopy();
    }
  }, [
    subView,
    handleCopyTranslation,
    handleHistoryCopy,
  ]);

  useKeyboardShortcut(
    {
      key: 'c',
      meta: true,
    },
    handleCopyShortcut,
    { preventDefault: false },
  );
  useKeyboardShortcut(
    {
      key: 's',
      meta: true,
    },
    handleSaveToHistory,
    { enabled: subView === 'translate' },
  );
  useKeyboardShortcut(
    {
      key: 'h',
      meta: true,
      shift: true,
    },
    handleShowHistory,
    { enabled: subView === 'translate' },
  );
  useKeyboardShortcut({ key: 'Escape' }, handleBackToTranslate, {
    enabled: subView === 'history',
    preventDefault: false,
  });

  if (subView === 'history') {
    const totalItemCount = filteredHistory.length;
    const renderNow = new Date();
    const activeDescendantId =
      totalItemCount > 0 ? `list-item-${selectedIndex}` : undefined;

    const historyDropdownSections: DropdownSection[] = [
      {
        title: 'Actions',
        actions: [
          {
            label: 'Use Translation',
            shortcut: <Kbd keys={['↵']} />,
            onClick: handleHistorySelect,
          },
          createCopyAction(
            {
              content: filteredHistory[selectedIndex]?.translatedText ?? '',
              title: 'Copy Translation',
              shortcut: (
                <Kbd
                  keys={[
                    '⌘',
                    'C',
                  ]}
                />
              ),
              hudIcon: <TranslateHUDIcon />,
            },
            showHUD,
          ),
        ],
      },
    ];

    return (
      <>
        <SearchBar
          value={historyQuery}
          onChange={handleHistoryQueryChange}
          placeholder="Search History..."
          activeDescendantId={activeDescendantId}
          breadcrumbs={[
            ...nav.breadcrumbs,
            {
              label: 'Translate',
              onBack: handleBackToTranslate,
            },
          ]}
        />
        <div className="command-palette__body">
          <div className="command-palette__list-container">
            {totalItemCount === 0 ? (
              <EmptyState
                icon={<TranslateEmptyIcon />}
                title="No History"
                description={
                  historyQuery
                    ? 'Try a different search term'
                    : 'Translations you save will appear here'
                }
              />
            ) : (
              <List
                itemCount={totalItemCount}
                onActiveIndexChange={handleActiveIndexChange}
                onAction={handleHistorySelect}
              >
                <ListSection title="Translation History">
                  {filteredHistory.map((entry, idx) => (
                    <ListItem
                      key={entry.id}
                      index={idx}
                      icon={<GlobeIcon />}
                      title={entry.sourceText}
                      subtitle={entry.translatedText}
                      accessories={[
                        {
                          tag: {
                            text: `${langName(entry.sourceLang)} \u2192 ${langName(entry.targetLang)}`,
                          },
                        },
                        {
                          text: formatRelativeDate(entry.createdAt, renderNow),
                          tooltip: entry.createdAt.toLocaleString(),
                        },
                      ]}
                      query={historyQuery || undefined}
                    />
                  ))}
                </ListSection>
              </List>
            )}
          </div>
        </div>
        <ActionPanel
          contextLabel="History"
          actions={[
            {
              label: 'Use',
              shortcut: <Kbd keys={['\u21B5']} />,
            },
            {
              label: 'Actions',
              shortcut: (
                <Kbd
                  keys={[
                    '\u2318',
                    'K',
                  ]}
                />
              ),
            },
          ]}
          dropdownOpen={actionsOpen}
          dropdownSections={historyDropdownSections}
          onDropdownClose={closeActions}
        />
        <HUDContainer items={hudItems} />
      </>
    );
  }

  const translateDropdownSections: DropdownSection[] = [
    {
      title: 'Actions',
      actions: [
        createCopyAction(
          {
            content: translatedText,
            title: 'Copy Translation',
            shortcut: (
              <Kbd
                keys={[
                  '\u2318',
                  'C',
                ]}
              />
            ),
            hudIcon: <TranslateHUDIcon />,
          },
          showHUD,
        ),
        {
          label: 'Copy Source',
          onClick: handleCopySource,
        },
        {
          label: 'Save to History',
          shortcut: (
            <Kbd
              keys={[
                '\u2318',
                'S',
              ]}
            />
          ),
          onClick: handleSaveToHistory,
        },
        {
          label: 'Swap Languages',
          onClick: handleSwapLanguages,
        },
        {
          label: 'Clear',
          onClick: handleClearSource,
        },
      ],
    },
    {
      title: 'Navigation',
      actions: [
        {
          label: 'Translation History',
          shortcut: (
            <Kbd
              keys={[
                '\u2318',
                '\u21E7',
                'H',
              ]}
            />
          ),
          onClick: handleShowHistory,
        },
      ],
    },
  ];

  return (
    <>
      <SearchBar
        value=""
        onChange={() => {}}
        placeholder="Translate"
        breadcrumbs={nav.breadcrumbs.length > 0 ? nav.breadcrumbs : undefined}
      />
      <div className="command-palette__body">
        <div className="command-palette__list-container">
          <div className="translator">
            <div className="translator__panels">
              <div className="translator__panel">
                <div className="translator__panel-header">
                  <SearchDropdown
                    sections={sourceLangSections}
                    value={sourceLang}
                    onChange={setSourceLang}
                  />
                  {sourceLang === 'auto' && detectedLang && (
                    <span className="translator__detected-badge">
                      {langName(detectedLang)}
                    </span>
                  )}
                </div>
                <textarea
                  ref={textareaRef}
                  className="translator__textarea"
                  value={sourceText}
                  onChange={e => setSourceText(e.target.value)}
                  placeholder="Enter text to translate..."
                  aria-label="Source text"
                  autoFocus
                />
                {sourceText && (
                  <div className="translator__char-count">
                    {sourceText.length} characters
                  </div>
                )}
              </div>
              <div className="translator__divider">
                <button
                  className="translator__swap-button"
                  onClick={handleSwapLanguages}
                  disabled={sourceLang === 'auto'}
                  aria-label="Swap languages"
                  type="button"
                >
                  <SwapIcon />
                </button>
              </div>
              <div className="translator__panel">
                <div className="translator__panel-header">
                  <SearchDropdown
                    sections={targetLangSections}
                    value={targetLang}
                    onChange={setTargetLang}
                  />
                </div>
                <div className="translator__output" aria-live="polite">
                  {translatedText ? (
                    translatedText
                  ) : (
                    <span className="translator__output-placeholder">
                      Translation will appear here...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ActionPanel
        contextLabel="Translate"
        actions={[
          {
            label: 'Copy Translation',
            shortcut: (
              <Kbd
                keys={[
                  '\u2318',
                  'C',
                ]}
              />
            ),
          },
          {
            label: 'Actions',
            shortcut: (
              <Kbd
                keys={[
                  '\u2318',
                  'K',
                ]}
              />
            ),
          },
        ]}
        dropdownOpen={actionsOpen}
        dropdownSections={translateDropdownSections}
        onDropdownClose={closeActions}
      />
      <HUDContainer items={hudItems} />
    </>
  );
}
