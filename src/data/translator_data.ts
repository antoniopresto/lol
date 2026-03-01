export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'auto',
    name: 'Detect Language',
    nativeName: 'Auto',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
  },
  {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    nativeName: '繁體中文',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
  },
  {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
  },
  {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
  },
  {
    code: 'da',
    name: 'Danish',
    nativeName: 'Dansk',
  },
  {
    code: 'fi',
    name: 'Finnish',
    nativeName: 'Suomi',
  },
  {
    code: 'no',
    name: 'Norwegian',
    nativeName: 'Norsk',
  },
  {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
  },
  {
    code: 'cs',
    name: 'Czech',
    nativeName: 'Čeština',
  },
  {
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
  },
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
  },
];

export const TARGET_LANGUAGES = SUPPORTED_LANGUAGES.filter(
  l => l.code !== 'auto',
);

export interface TranslationHistoryEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  detectedLang?: string;
  createdAt: Date;
}

const MOCK_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    es: 'Hola, ¿cómo estás?',
    fr: 'Bonjour, comment allez-vous ?',
    de: 'Hallo, wie geht es Ihnen?',
    it: 'Ciao, come stai?',
    pt: 'Olá, como vai você?',
    ja: 'こんにちは、お元気ですか？',
    ko: '안녕하세요, 어떻게 지내세요?',
    zh: '你好，你好吗？',
    ru: 'Здравствуйте, как дела?',
    ar: 'مرحبًا، كيف حالك؟',
  },
  es: {
    en: 'Hello, how are you?',
    fr: 'Bonjour, comment allez-vous ?',
    de: 'Hallo, wie geht es Ihnen?',
  },
  fr: {
    en: 'Hello, how are you?',
    es: 'Hola, ¿cómo estás?',
    de: 'Hallo, wie geht es Ihnen?',
  },
};

function simpleWordSwap(text: string, targetLang: string): string {
  const words: Record<string, Record<string, string>> = {
    es: {
      hello: 'hola',
      world: 'mundo',
      the: 'el',
      is: 'es',
      a: 'un',
      and: 'y',
      good: 'bueno',
      morning: 'mañana',
      night: 'noche',
      thank: 'gracias',
      you: 'tú',
      yes: 'sí',
      no: 'no',
      please: 'por favor',
      sorry: 'lo siento',
      love: 'amor',
      water: 'agua',
      food: 'comida',
      time: 'tiempo',
      day: 'día',
    },
    fr: {
      hello: 'bonjour',
      world: 'monde',
      the: 'le',
      is: 'est',
      a: 'un',
      and: 'et',
      good: 'bon',
      morning: 'matin',
      night: 'nuit',
      thank: 'merci',
      you: 'vous',
      yes: 'oui',
      no: 'non',
      please: "s'il vous plaît",
      sorry: 'désolé',
      love: 'amour',
      water: 'eau',
      food: 'nourriture',
      time: 'temps',
      day: 'jour',
    },
    de: {
      hello: 'hallo',
      world: 'Welt',
      the: 'das',
      is: 'ist',
      a: 'ein',
      and: 'und',
      good: 'gut',
      morning: 'Morgen',
      night: 'Nacht',
      thank: 'danke',
      you: 'du',
      yes: 'ja',
      no: 'nein',
      please: 'bitte',
      sorry: 'Entschuldigung',
      love: 'Liebe',
      water: 'Wasser',
      food: 'Essen',
      time: 'Zeit',
      day: 'Tag',
    },
    pt: {
      hello: 'olá',
      world: 'mundo',
      the: 'o',
      is: 'é',
      a: 'um',
      and: 'e',
      good: 'bom',
      morning: 'manhã',
      night: 'noite',
      thank: 'obrigado',
      you: 'você',
      yes: 'sim',
      no: 'não',
      please: 'por favor',
      sorry: 'desculpe',
      love: 'amor',
      water: 'água',
      food: 'comida',
      time: 'tempo',
      day: 'dia',
    },
    ja: {
      hello: 'こんにちは',
      world: '世界',
      the: '',
      is: 'です',
      a: '',
      and: 'と',
      good: '良い',
      morning: '朝',
      night: '夜',
      thank: 'ありがとう',
      you: 'あなた',
      yes: 'はい',
      no: 'いいえ',
    },
    it: {
      hello: 'ciao',
      world: 'mondo',
      the: 'il',
      is: 'è',
      a: 'un',
      and: 'e',
      good: 'buono',
      morning: 'mattina',
      night: 'notte',
      thank: 'grazie',
      you: 'tu',
      yes: 'sì',
      no: 'no',
    },
  };

  const dict = words[targetLang];
  if (!dict) return `[${targetLang}] ${text}`;

  return text
    .split(/(\s+)/)
    .map(token => {
      const lower = token.toLowerCase();
      const replacement = dict[lower];
      if (replacement !== undefined) {
        if (token[0] === token[0]?.toUpperCase() && replacement.length > 0) {
          return replacement[0]!.toUpperCase() + replacement.slice(1);
        }
        return replacement;
      }
      return token;
    })
    .join('');
}

function detectLanguage(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return 'en';

  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(trimmed)) return 'ja';
  if (/[\uAC00-\uD7AF]/.test(trimmed)) return 'ko';
  if (/[\u4E00-\u9FFF]/.test(trimmed)) return 'zh';
  if (/[\u0400-\u04FF]/.test(trimmed)) return 'ru';
  if (/[\u0600-\u06FF]/.test(trimmed)) return 'ar';
  if (/[\u0900-\u097F]/.test(trimmed)) return 'hi';
  if (/[\u0E00-\u0E7F]/.test(trimmed)) return 'th';

  const spanishPatterns =
    /\b(el|la|los|las|de|en|que|es|un|una|con|por|para)\b/gi;
  const frenchPatterns = /\b(le|la|les|des|un|une|est|et|en|que|dans|pour)\b/gi;
  const germanPatterns = /\b(der|die|das|ein|eine|und|ist|von|mit|auf|für)\b/gi;
  const portuguesePatterns = /\b(o|a|os|as|de|em|que|é|um|uma|com|para)\b/gi;

  const scores: {
    lang: string;
    count: number;
  }[] = [
    {
      lang: 'es',
      count: (trimmed.match(spanishPatterns) || []).length,
    },
    {
      lang: 'fr',
      count: (trimmed.match(frenchPatterns) || []).length,
    },
    {
      lang: 'de',
      count: (trimmed.match(germanPatterns) || []).length,
    },
    {
      lang: 'pt',
      count: (trimmed.match(portuguesePatterns) || []).length,
    },
  ];

  scores.sort((a, b) => b.count - a.count);
  const best = scores[0];
  if (best && best.count > 0) return best.lang;

  return 'en';
}

export function mockTranslate(
  text: string,
  sourceLang: string,
  targetLang: string,
): {
  translated: string;
  detectedLang?: string;
} {
  if (!text.trim()) return { translated: '' };

  let effectiveSource = sourceLang;
  let detectedLang: string | undefined;

  if (sourceLang === 'auto') {
    effectiveSource = detectLanguage(text);
    detectedLang = effectiveSource;
  }

  if (effectiveSource === targetLang) {
    return {
      translated: text,
      detectedLang,
    };
  }

  const knownTranslation = MOCK_TRANSLATIONS[effectiveSource]?.[targetLang];
  if (knownTranslation && text.trim().toLowerCase() === 'hello, how are you?') {
    return {
      translated: knownTranslation,
      detectedLang,
    };
  }

  const swapped = simpleWordSwap(text, targetLang);
  if (swapped !== `[${targetLang}] ${text}`) {
    return {
      translated: swapped,
      detectedLang,
    };
  }

  return {
    translated: swapped,
    detectedLang,
  };
}

export const MOCK_HISTORY: TranslationHistoryEntry[] = [
  {
    id: 'th-1',
    sourceText: 'Hello, how are you?',
    translatedText: 'Hola, ¿cómo estás?',
    sourceLang: 'en',
    targetLang: 'es',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'th-2',
    sourceText: 'Good morning world',
    translatedText: 'Bonjour monde',
    sourceLang: 'en',
    targetLang: 'fr',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'th-3',
    sourceText: 'Thank you very much',
    translatedText: 'Vielen Danke sehr viel',
    sourceLang: 'en',
    targetLang: 'de',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: 'th-4',
    sourceText: 'The water is good',
    translatedText: 'A água é bom',
    sourceLang: 'en',
    targetLang: 'pt',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'th-5',
    sourceText: 'Please and thank you',
    translatedText: 'Per favore e grazie',
    sourceLang: 'en',
    targetLang: 'it',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];
