# lol

Raycast UI clone for internal use. V1 is UI-only with no OS
integrations. Visually identical to Raycast's design system.

## Stack

- Runtime: Bun
- Package manager: pnpm
- Framework: React + TypeScript
- Bundler: Vite
- Styling: Sass

## Architecture

Single-page app that replicates Raycast's visual interface.
Components render a command palette with search, list views,
detail panels, forms, and action panels. No backend, no IPC,
no native integrations. Pure UI.

## Development

```
pnpm install
pnpm dev
```

## Project structure

```
src/
  components/    UI components (List, Detail, Form, ActionPanel)
  styles/        Sass files, design tokens, variables
  hooks/         React hooks
  types/         TypeScript type definitions
  App.tsx        Root component
  main.tsx       Entry point
```
