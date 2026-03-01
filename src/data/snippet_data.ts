import type { TagColor } from '../constants/tag_colors';

export interface SnippetEntry {
  id: string;
  name: string;
  keyword: string;
  content: string;
  category: 'general' | 'code' | 'email' | 'template';
  tags: {
    text: string;
    color?: TagColor;
  }[];
  createdAt: Date;
}

export type SnippetCategory = SnippetEntry['category'];

const SNIPPET_CATEGORY_VALUES: SnippetCategory[] = [
  'general',
  'code',
  'email',
  'template',
];

export function isSnippetCategory(v: string): v is SnippetCategory {
  return (SNIPPET_CATEGORY_VALUES as string[]).includes(v);
}

const now = Date.now();

export const SNIPPET_CATEGORIES = [
  {
    label: 'General',
    value: 'general',
  },
  {
    label: 'Code',
    value: 'code',
  },
  {
    label: 'Email',
    value: 'email',
  },
  {
    label: 'Template',
    value: 'template',
  },
] as const;

export const SNIPPET_TAGS = [
  {
    label: 'JavaScript',
    value: 'javascript',
    color: 'yellow' as TagColor,
  },
  {
    label: 'TypeScript',
    value: 'typescript',
    color: 'blue' as TagColor,
  },
  {
    label: 'Python',
    value: 'python',
    color: 'green' as TagColor,
  },
  {
    label: 'React',
    value: 'react',
    color: 'blue' as TagColor,
  },
  {
    label: 'CSS',
    value: 'css',
    color: 'purple' as TagColor,
  },
  {
    label: 'HTML',
    value: 'html',
    color: 'orange' as TagColor,
  },
  {
    label: 'Shell',
    value: 'shell',
    color: 'green' as TagColor,
  },
  {
    label: 'Markdown',
    value: 'markdown',
    color: 'orange' as TagColor,
  },
] as const;

export const MOCK_SNIPPET_ENTRIES: SnippetEntry[] = [
  {
    id: 'snip-1',
    name: 'Console Log',
    keyword: '!clog',
    content: 'console.log($1);',
    category: 'code',
    tags: [
      {
        text: 'JavaScript',
        color: 'yellow',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 30),
  },
  {
    id: 'snip-2',
    name: 'React Component',
    keyword: '!rfc',
    content:
      'export function $1({ $2 }: $1Props) {\n  return (\n    <div>\n      $3\n    </div>\n  );\n}',
    category: 'code',
    tags: [
      {
        text: 'React',
        color: 'blue',
      },
      {
        text: 'TypeScript',
        color: 'blue',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 25),
  },
  {
    id: 'snip-3',
    name: 'Email Signature',
    keyword: '!sig',
    content:
      'Best regards,\nJohn Doe\nSenior Developer\njohn@example.com\n+1 (555) 123-4567',
    category: 'email',
    tags: [],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 60),
  },
  {
    id: 'snip-4',
    name: 'Meeting Follow-up',
    keyword: '!follow',
    content:
      'Hi $1,\n\nThank you for taking the time to meet today. Here is a summary of what we discussed:\n\n- $2\n\nPlease let me know if I missed anything.\n\nBest,',
    category: 'email',
    tags: [],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 45),
  },
  {
    id: 'snip-5',
    name: 'useState Hook',
    keyword: '!ush',
    content: 'const [$1, set$2] = useState<$3>($4);',
    category: 'code',
    tags: [
      {
        text: 'React',
        color: 'blue',
      },
      {
        text: 'TypeScript',
        color: 'blue',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 20),
  },
  {
    id: 'snip-6',
    name: 'Git Commit Message',
    keyword: '!gcm',
    content: 'feat($1): $2\n\n$3',
    category: 'general',
    tags: [
      {
        text: 'Shell',
        color: 'green',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 15),
  },
  {
    id: 'snip-7',
    name: 'CSS Flexbox Center',
    keyword: '!center',
    content: 'display: flex;\nalign-items: center;\njustify-content: center;',
    category: 'code',
    tags: [
      {
        text: 'CSS',
        color: 'purple',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 50),
  },
  {
    id: 'snip-8',
    name: 'PR Description',
    keyword: '!prd',
    content:
      '## Summary\n$1\n\n## Changes\n- $2\n\n## Test Plan\n- [ ] $3\n\n## Screenshots\n$4',
    category: 'template',
    tags: [
      {
        text: 'Markdown',
        color: 'orange',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 10),
  },
  {
    id: 'snip-9',
    name: 'Python Main Guard',
    keyword: '!pymain',
    content: 'if __name__ == "__main__":\n    main()',
    category: 'code',
    tags: [
      {
        text: 'Python',
        color: 'green',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 40),
  },
  {
    id: 'snip-10',
    name: 'HTML Boilerplate',
    keyword: '!html',
    content:
      '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>$1</title>\n</head>\n<body>\n  $2\n</body>\n</html>',
    category: 'template',
    tags: [
      {
        text: 'HTML',
        color: 'orange',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 55),
  },
  {
    id: 'snip-11',
    name: 'Bug Report',
    keyword: '!bug',
    content:
      '## Bug Report\n\n**Description:** $1\n\n**Steps to Reproduce:**\n1. $2\n\n**Expected:** $3\n\n**Actual:** $4\n\n**Environment:** $5',
    category: 'template',
    tags: [
      {
        text: 'Markdown',
        color: 'orange',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: 'snip-12',
    name: 'Out of Office Reply',
    keyword: '!ooo',
    content:
      'Thank you for your email. I am currently out of the office from $1 to $2 with limited access to email.\n\nFor urgent matters, please contact $3.\n\nI will respond to your email upon my return.\n\nBest regards,',
    category: 'email',
    tags: [],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 35),
  },
  {
    id: 'snip-13',
    name: 'useEffect Cleanup',
    keyword: '!uef',
    content:
      'useEffect(() => {\n  $1\n\n  return () => {\n    $2\n  };\n}, [$3]);',
    category: 'code',
    tags: [
      {
        text: 'React',
        color: 'blue',
      },
    ],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 8),
  },
  {
    id: 'snip-14',
    name: 'Address Block',
    keyword: '!addr',
    content: '$1\n$2\n$3, $4 $5',
    category: 'general',
    tags: [],
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 70),
  },
];
