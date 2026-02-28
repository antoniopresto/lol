# lol - Project Instructions

## What this is

Raycast UI clone. V1 is visual only. No OS integrations.
No backend. No IPC. Pure browser-based React app that
replicates Raycast's interface pixel-by-pixel.

## Stack

- pnpm (package manager, always use pnpm, never npm/yarn)
- Bun (runtime)
- TypeScript (strict mode)
- React 19
- Vite 6
- Sass (no CSS modules, no styled-components, no tailwind)

## Rules

- No comments in code unless JSDoc is needed for public API
- No over-engineering, no abstractions for single-use cases
- Sass variables for all design tokens (colors, spacing, radii,
  shadows, typography)
- Every component gets its own .scss file
- File naming: PascalCase for components, camelCase for hooks
- Keep components small and composable
- All text in English
- Read .claude/progress.txt before starting work to understand
  current state and pick the next pending task

## Design Reference

Replicate Raycast's design system exactly:
- Dark theme by default
- Rounded corners, subtle borders
- SF-style sans-serif font stack
- Translucent/frosted-glass backgrounds
- Smooth transitions and micro-animations
- Command palette centered on screen
- Consistent spacing scale (4px base)

## File Structure

src/
  components/    React components
  styles/        Sass files and design tokens
  hooks/         Custom React hooks
  types/         TypeScript types
  App.tsx        Root
  main.tsx       Entry

## Task Workflow

1. Read .claude/progress.txt
2. Find next "- [ ]" task
3. Implement it
4. Mark as "- [x]" when done
5. Commit with short descriptive message
