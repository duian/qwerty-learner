## Tech Stack

### Core Technologies

- **React 18.2** with TypeScript
- **Vite 4** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first styling
- **Jotai** - Atomic state management
- **React Router 6** - Client-side routing
- **Dexie** - IndexedDB wrapper for local storage

### UI Libraries

- **Radix UI** - Headless component primitives (Dialog, Dropdown, Tabs, etc.)
- **Headless UI** - Additional unstyled components
- **Lucide React** - Icon library
- **unplugin-icons** - Custom icon support

### Key Dependencies

- **Howler.js** - Audio playback for pronunciation
- **ECharts** - Data visualization for statistics
- **dayjs** - Date manipulation
- **react-hotkeys-hook** - Keyboard shortcuts
- **SWR** - Data fetching and caching
- **Immer** - Immutable state updates

### Development Tools

- **ESLint** - Linting with React and TypeScript rules
- **Prettier** - Code formatting (single quotes, no semicolons, 140 print width)
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files
- **Playwright** - E2E testing

## Common Commands

```bash
# Development
yarn dev          # Start dev server at http://localhost:5173
yarn start        # Alias for yarn dev

# Build
yarn build        # Production build to ./build directory

# Code Quality
yarn lint         # Run ESLint
yarn prettier     # Format all files with Prettier

# Testing
yarn test:e2e     # Run Playwright E2E tests
```

## Build Configuration

- **Output Directory**: `build/`
- **Base Path**: `./` (relative for flexible deployment)
- **Source Maps**: Disabled in production
- **Console Removal**: Automatic in production builds
- **CSS Modules**: camelCase naming convention

## Code Style

- Single quotes for strings
- No semicolons
- 140 character line width
- Trailing commas
- Import sorting via `@trivago/prettier-plugin-sort-imports`
- Tailwind class sorting via `prettier-plugin-tailwindcss`
- TypeScript strict mode enabled
- Consistent type imports (`@typescript-eslint/consistent-type-imports`)

## Path Aliases

- `@/*` maps to `src/*` for cleaner imports
