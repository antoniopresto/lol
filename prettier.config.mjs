/** @type {import("prettier").Config} */
const config = {
  arrowParens: 'avoid',
  bracketSameLine: false,
  bracketSpacing: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  semi: true,
  tabWidth: 2,
  plugins: [
    '@belt/prettier-plugin',
    'prettier-plugin-organize-imports',
  ],
};

export default config;
