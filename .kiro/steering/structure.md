## Project Structure

### Root Organization

```
qwerty-learner/
├── src/              # Application source code
├── public/           # Static assets and dictionaries
├── build/            # Production build output
├── scripts/          # Installation and utility scripts
├── docs/             # Documentation and screenshots
├── tests/            # E2E tests (Playwright)
└── src-tauri/        # Tauri desktop app (optional)
```

### Source Directory (`src/`)

```
src/
├── @types/           # TypeScript declaration files (.d.ts)
├── assets/           # Images, logos, SVGs
├── components/       # Reusable React components
│   ├── ui/          # Shadcn/Radix UI components
│   └── [Feature]/   # Feature-specific components
├── constants/        # App-wide constants
├── hooks/            # Custom React hooks
├── pages/            # Route-level page components
│   ├── Typing/      # Main typing practice page
│   ├── Analysis/    # Statistics and analytics
│   ├── Gallery/     # Dictionary selection
│   └── ErrorBook/   # Review incorrect words
├── resources/        # Dictionary and sound resources
├── store/            # Jotai atoms for state management
├── typings/          # TypeScript type definitions
├── utils/            # Utility functions and helpers
│   ├── db/          # Dexie database logic
│   └── sounds/      # Sound effect utilities
├── index.tsx         # App entry point
└── index.css         # Global styles
```

### Public Directory (`public/`)

```
public/
├── dicts/            # 400+ JSON dictionary files
│   ├── CET4_T.json
│   ├── IELTS_3_T.json
│   ├── js-array.json
│   └── ...
└── sounds/           # Audio files for typing sounds
```

### Component Organization

- **Feature Components**: Organized in folders with PascalCase names
- **UI Components**: Reusable primitives in `components/ui/`
- **Layout**: Top-level layout wrapper in `components/Layout.tsx`

### State Management

- **Jotai Atoms**: Defined in `store/` directory
  - `atomForConfig.ts` - User configuration and settings
  - `reviewInfoAtom.ts` - Review and error tracking
  - `index.ts` - Exports all atoms

### Routing Structure

- `/` - Main typing practice page
- `/gallery` - Dictionary selection
- `/analysis` - Statistics and progress tracking
- `/error-book` - Review incorrect words
- `/friend-links` - Community links

### Dictionary Files

- Located in `public/dicts/`
- JSON format with word entries
- Naming convention: `[Category]_[Level]_[Type].json`
- Examples: `CET4_T.json`, `python-string.json`, `IELTS_3_T.json`

### Styling Approach

- **Tailwind CSS** for utility classes
- **CSS Modules** for component-specific styles (camelCase)
- **Dark Mode**: Class-based (`darkMode: ['class']`)
- Custom theme extensions in `tailwind.config.js`

### Type Definitions

- Global types in `src/typings/`
- Module declarations in `src/@types/`
- Component prop types inline or in same file
