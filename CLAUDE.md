# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Qwerty Learner — a keyboard-based typing practice and vocabulary memorization web app built with React + Vite. Users type words from various dictionaries (English, Japanese, German, programming keywords, etc.) to build muscle memory and vocabulary simultaneously.

## Commands

```bash
pnpm install        # Install all workspace dependencies
pnpm dev            # Start all packages in dev mode (parallel)
pnpm dev:web        # Start web dev server only (localhost:5173)
pnpm dev:server     # Start API server only (localhost:3001)
pnpm build          # Production build all packages
pnpm build:web      # Build web package only (output: packages/web/build/)
pnpm build:server   # Build server package only (output: packages/server/dist/)
pnpm lint           # ESLint check (web package)
pnpm prettier       # Format all files
pnpm typecheck      # Type-check all packages via project references
pnpm import-dicts   # Import dictionary data into server DB
```

No unit test framework is configured. Pre-commit hooks (Husky) run lint-staged → eslint --fix → prettier on every commit.

## Architecture

### State Management (dual pattern)

- **Global preferences**: Jotai atoms with `atomWithStorage` (persisted to localStorage). Located in `src/store/index.ts`. Use `atomForConfig` wrapper for config objects that need schema migration.
- **Typing session state**: `useImmerReducer` + React Context (`TypingContext`), page-local to `src/pages/Typing/`. The reducer uses Immer's mutable draft pattern. Actions are in the `TypingStateActionType` enum.

Important: `isOpenDarkModeAtom` is a derived writable atom — pass explicit boolean values to its setter, not updater functions.

### Data Flow for Typing

1. Dictionary metadata is statically defined in `src/resources/dictionary.ts` (categories, lengths, URLs).
2. Word lists are fetched from `/public/dicts/*.json` via SWR (`useWordList` hook), sliced into chapters of `CHAPTER_LENGTH = 20`.
3. The `dictionary.length` field must match the actual word count in the JSON file — it drives chapter count calculation.
4. Input is handled by `KeyEventHandler` (for most languages) or `TextAreaHandler` (for code/non-latin dictionaries with a focused `<textarea>`).

### Keyboard Shortcuts

Uses `react-hotkeys-hook`. Key conventions:

- Hotkeys that must fire during active typing need `{ enableOnFormTags: true }` (because TextAreaHandler uses a focused textarea).
- Hotkeys that should NOT fire during typing should use `{ enabled: !state.isTyping }` as a guard.
- Arrow key navigation uses modifier keys (Ctrl+Shift+Arrow) during typing, bare arrows only when not typing.

### Routing

BrowserRouter in `src/index.tsx`. Pages: `/` (Typing), `/gallery` (dictionary picker), `/analysis` (stats), `/error-book`, `/friend-links`, `/mobile`. Analysis and Gallery are lazy-loaded.

### Styling

Tailwind CSS 3 with `darkMode: 'class'`. Dark mode is toggled by adding/removing `dark` class on `document.documentElement`. CSS Modules used sparingly (camelCase only).

### Path Alias

`@/` → `src/` (configured in both vite.config.ts and tsconfig.json).

### Key Libraries

| Purpose       | Library                                    |
| ------------- | ------------------------------------------ |
| State         | Jotai (atoms + atomWithStorage)            |
| Data fetching | SWR                                        |
| Styling       | Tailwind CSS 3                             |
| Icons         | unplugin-icons (Tabler, Heroicons, custom) |
| Audio         | Howler.js                                  |
| Charts        | ECharts                                    |
| Local DB      | Dexie (IndexedDB)                          |
| Hotkeys       | react-hotkeys-hook                         |
| Animations    | animate.css, canvas-confetti               |

### ESLint Rules

- Import sorting enforced (`sort-imports` with `ignoreDeclarationSort: true` — member sorting only)
- Consistent type imports (`@typescript-eslint/consistent-type-imports`)
- React prop-types disabled (TypeScript is the type system)
