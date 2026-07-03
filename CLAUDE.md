# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Qwerty Learner — a keyboard-based typing practice and vocabulary memorization web app built with React + Vite, backed by an Express API server. Users type words from various dictionaries (English, Japanese, German, programming keywords, etc.) to build muscle memory and vocabulary simultaneously.

## Monorepo Structure

pnpm workspaces monorepo with three packages:

```
packages/web/       → @qwerty-learner/web    (React frontend, Vite)
packages/server/    → @qwerty-learner/server (Express API, Drizzle + SQLite)
packages/shared/    → @qwerty-learner/shared (shared TypeScript types, no build step)
```

Cross-package dependencies use `workspace:*`. The shared package is consumed as raw TypeScript source (`"main": "./src/index.ts"`).

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
pnpm typecheck      # Type-check via project references (server + shared)
pnpm import-dicts   # Import dictionary JSON data into server DB
```

Server-specific (run from `packages/server/`):

```bash
pnpm db:generate    # Generate Drizzle migrations
pnpm db:push        # Push schema to DB
pnpm db:migrate     # Run migrations
```

Pre-commit hooks (Husky) run: lint-staged → eslint → prettier.

## Architecture

### Web Package (`packages/web/`)

#### State Management (dual pattern)

- **Global preferences**: Jotai atoms with `atomWithStorage` (persisted to localStorage). Located in `src/store/index.ts`. Use `atomForConfig` wrapper for config objects that need schema migration.
- **Typing session state**: `useImmerReducer` + React Context (`TypingContext`), page-local to `src/pages/Typing/`. Actions are in the `TypingStateActionType` enum.

Important: `isOpenDarkModeAtom` is a derived writable atom — pass explicit boolean values to its setter, not updater functions.

#### Data Flow for Typing

1. Dictionary metadata defined in `src/resources/dictionary.ts` (categories, lengths, URLs).
2. Word lists fetched via the `/api/dictionaries/:id/words` endpoint (SWR + `useWordList` hook), sliced into chapters of `CHAPTER_LENGTH = 20`.
3. The `dictionary.length` field must match the actual word count — it drives chapter count calculation.
4. Input handled by `KeyEventHandler` (most languages) or `TextAreaHandler` (code/non-latin dictionaries with a focused `<textarea>`).

#### Keyboard Shortcuts

Uses `react-hotkeys-hook`:

- Hotkeys during active typing need `{ enableOnFormTags: true }`.
- Hotkeys that should NOT fire during typing: `{ enabled: !state.isTyping }`.
- Arrow key navigation uses modifier keys (Ctrl+Shift+Arrow) during typing, bare arrows only when not typing.

#### Routing

BrowserRouter in `src/index.tsx`. Pages: `/` (Typing), `/gallery` (dictionary picker), `/analysis` (stats), `/error-book`, `/friend-links`, `/mobile`. Analysis and Gallery are lazy-loaded.

#### Styling

Tailwind CSS 3 with `darkMode: ['class']`. Dark mode toggled via `dark` class on `document.documentElement`. CSS Modules used sparingly (camelCase only).

#### Path Alias

`@/` → `packages/web/src/` (configured in vite.config.ts and tsconfig.json).

#### Dev Proxy

Vite proxies `/api` requests to `http://localhost:3001` in development.

### Server Package (`packages/server/`)

Express API on port 3001. SQLite database via Drizzle ORM (`data/qwerty.db`).

**Tables**: `dictionaries`, `words`, `favorites`, `wordbooks`, `wordbookWords`

**API routes** (all under `/api`):

- `GET /dictionaries` — list all dictionaries
- `GET /dictionaries/:id/words` — paginated words by chapter
- `GET/POST/DELETE /favorites` — favorites CRUD
- `GET/POST/PUT/DELETE /wordbooks` — wordbook CRUD

**Structure**: controllers → services → models (Drizzle schema in `src/models/schema.ts`)

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
| Server DB     | Drizzle ORM + better-sqlite3               |
| Server        | Express                                    |

### ESLint Rules

- Import sorting enforced (`sort-imports` with `ignoreDeclarationSort: true` — member sorting only)
- Consistent type imports (`@typescript-eslint/consistent-type-imports`)
- React prop-types disabled (TypeScript is the type system)

## Tauri

在修改 Tauri 相关配置（如 tauri.conf.json、Cargo.toml 中的 tauri 依赖、权限配置等）之前，必须先通过 Context7 查询最新的 Tauri 文档，确认当前版本的正确配置方式后再执行修改。
