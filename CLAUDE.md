# lol

Raycast UI clone. Raycast interface is a clone pixel-by-pixel.

OVERVIEW:

- [loop.ts](loop.ts) is a "Ralph loop" implementation, based on Geoffrey
  Huntley's Ralph Wiggum technique: it runs Claude code
  on loops of clean context in order to avoid 'context rot'.

CRITICAL (THINK BEFORE ACTING):

- ALL tasks and instructions are deliberate.
- No task is optional.
- The FIRST thing you MUST do is write your understanding of each WORKFLOW statement
- The SECOND thing you MUST do is write your understanding of the work in progress described in progress.txt
- Only AFTER completing steps above, proceed with the task execution
- If more work is necessary, add a new task to the file, set "exit": false, and Stop
- Only set "exit": true when ALL tasks in progress.txt are completed
- Never remove tasks, unless to update status;
- Never include workarounds and add tasks to fix all you found ('as any' for example is a workaround)
- No task should be submitted as "look reasonable."
- Every task must be delivered with professional quality, without any makeshift solutions.
- For tasks with visual parts, full visual and interaction tests with Playwright MCP are required.
- Never consider any mistake or error to be expected or acceptable.

PROJECT_FACTS

```txt
- Bun (runtime, package manager, always use bun, never npm/yarn)
- TypeScript (strict mode)
- React 19
- Vite 6
- Sass (no CSS modules, no styled-components, no tailwind)
- No comments in code unless JSDoc is needed for public API
- No over-engineering, no abstractions for single-use cases
- Sass variables for all design tokens (colors, spacing, radii,
  shadows, typography)
- Every component gets its own .scss file
- File naming: file_name.ts, home.tsx, use_keyboard.ts
- Keep components small and composable
- For tasks with visual parts, full visual and interaction tests with Playwright MCP are required.
- Never consider any mistake or error to be expected or acceptable.
- Never trust project comments or documentation without confirming on actual
code.
```
