# Monorepo Migration Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalize the pnpm monorepo migration by fixing remaining issues (Docker, CI, root tsconfig, dependency verification) and producing a clean, buildable state.

**Architecture:** The monorepo structure (`packages/web`, `packages/server`, `packages/shared`) is already in place with pnpm workspaces. This plan addresses the remaining gaps: outdated Docker/CI configs that still reference the old flat structure, missing root tsconfig for cross-package type-checking, and validation that the full build pipeline works.

**Tech Stack:** pnpm workspaces, Vite 4, TypeScript 5.4, Express, Drizzle ORM, GitHub Actions

## Global Constraints

- Package manager: pnpm (no yarn/npm commands in any script or CI)
- Node version: >=18.17.0
- All packages private (`"private": true`)
- Cross-package references use `workspace:*` protocol
- `.npmrc` keeps `shamefully-hoist=true` for React ecosystem compatibility

---

### Task 1: Add Root tsconfig.json with Project References

**Files:**

- Create: `tsconfig.json` (root)

**Interfaces:**

- Consumes: existing `packages/web/tsconfig.json`, `packages/server/tsconfig.json`
- Produces: root `tsconfig.json` with `references` array pointing to each package; enables IDE "Go to Definition" across packages

- [ ] **Step 1: Create root tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "packages/web" },
    { "path": "packages/server" },
    { "path": "packages/shared" }
  ]
}
```

Write this file to `/tsconfig.json` (project root).

- [ ] **Step 2: Add composite flag to packages/shared/tsconfig.json**

Create `packages/shared/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Verify IDE navigation works**

Open `packages/web/src/` in your editor. Ctrl+click on any import from `@qwerty-learner/shared` — it should navigate to `packages/shared/src/`.

Run: `cd packages/web && pnpm exec tsc --noEmit`
Expected: No new type errors introduced.

- [ ] **Step 4: Commit**

```bash
git add tsconfig.json packages/shared/tsconfig.json
git commit -m "chore: add root tsconfig with project references for cross-package navigation"
```

---

### Task 2: Update Dockerfile for Monorepo

**Files:**

- Modify: `Dockerfile`
- Modify: `docker-compose.yaml`

**Interfaces:**

- Consumes: `packages/web/` build output (`packages/web/build/`)
- Produces: Docker image that builds and serves the web package via nginx

- [ ] **Step 1: Rewrite Dockerfile**

```dockerfile
FROM node:20 AS build

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config first for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/web/package.json packages/web/
COPY packages/shared/package.json packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared/ packages/shared/
COPY packages/web/ packages/web/

# Build web package
RUN pnpm --filter @qwerty-learner/web build

# Serve with nginx
FROM nginx:alpine
COPY packages/web/public/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/web/build /app
```

- [ ] **Step 2: Update docker-compose.yaml**

```yaml
version: "3"

services:
  qwertylearner:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8990:80"
```

Note: Changed port mapping from `8990:5173` to `8990:80` since nginx serves on port 80.

- [ ] **Step 3: Verify Docker build (dry run)**

Run: `docker build --no-cache -t qwerty-learner-test . 2>&1 | tail -5`
Expected: Build completes successfully (or fails at `pnpm-lock.yaml` if lockfile doesn't exist yet — that's fine, we'll fix in Task 4).

- [ ] **Step 4: Commit**

```bash
git add Dockerfile docker-compose.yaml
git commit -m "chore: update Docker config for pnpm monorepo structure"
```

---

### Task 3: Update GitHub Actions Workflows

**Files:**

- Modify: `.github/workflows/deploy-pages.yml`
- Modify: `.github/workflows/e2e.yml`

**Interfaces:**

- Consumes: monorepo structure, `pnpm` commands
- Produces: Working CI that builds and deploys from `packages/web/build/`

- [ ] **Step 1: Rewrite deploy-pages.yml**

```yaml
name: Deployment to Github/Gitee pages
on:
  push:
    branches:
      - master
env:
  REACT_APP_DEPLOY_ENV: pages
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Build web
        run: pnpm --filter @qwerty-learner/web build
      - name: Deploy to gh-pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}
          publish_dir: ./packages/web/build
```

- [ ] **Step 2: Rewrite e2e.yml**

```yaml
name: Qwerty E2E Workflows
on:
  push:
    branches:
      - master
      - dev/e2e
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Install Playwright Browsers
        run: pnpm --filter @qwerty-learner/web exec playwright install --with-deps
      - name: Run E2E tests
        run: pnpm --filter @qwerty-learner/web test:e2e
        continue-on-error: true
      - uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: packages/web/playwright-report/
          retention-days: 30
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy-pages.yml .github/workflows/e2e.yml
git commit -m "ci: update GitHub Actions for pnpm monorepo"
```

---

### Task 4: Verify Full Build and Fix Dependencies

**Files:**

- Possibly modify: `packages/web/package.json`, `packages/server/package.json`

**Interfaces:**

- Consumes: all packages
- Produces: clean `pnpm install` + `pnpm build` from a fresh state

- [ ] **Step 1: Clean install from scratch**

```bash
rm -rf node_modules packages/*/node_modules
pnpm install
```

Expected: Installs without errors. If there are peer dependency warnings, note them but they are not blockers.

- [ ] **Step 2: Build shared package (type-check)**

```bash
pnpm --filter @qwerty-learner/shared exec tsc --noEmit
```

Expected: No errors (shared is just type exports).

- [ ] **Step 3: Build web package**

```bash
pnpm --filter @qwerty-learner/web build
```

Expected: Vite build completes, output in `packages/web/build/`. If there are TypeScript errors, fix them. Common issues:

- Missing types for imports from `@qwerty-learner/shared` → ensure the `main` field in shared's package.json points to correct file
- Path resolution issues → verify `@/` alias works in vite.config.ts with the `path.resolve(__dirname, 'src')` pattern

- [ ] **Step 4: Build server package**

```bash
pnpm --filter @qwerty-learner/server build
```

Expected: `tsc` compiles to `packages/server/dist/`. If errors, fix type issues.

- [ ] **Step 5: Verify dev server starts**

```bash
pnpm dev:web &
sleep 5
curl -s http://localhost:5173 | head -5
kill %1
```

Expected: HTML response from Vite dev server.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve dependency and build issues after monorepo migration"
```

Skip this commit if no changes were needed.

---

### Task 5: Update Root package.json Scripts and Add Engine Constraints

**Files:**

- Modify: `package.json` (root)

**Interfaces:**

- Consumes: working monorepo build from Task 4
- Produces: complete root scripts and engine constraints that prevent accidental use of wrong package manager

- [ ] **Step 1: Update root package.json**

```json
{
  "name": "qwerty-learner",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=18.17.0"
  },
  "scripts": {
    "dev": "pnpm --parallel -r run dev",
    "dev:web": "pnpm --filter @qwerty-learner/web dev",
    "dev:server": "pnpm --filter @qwerty-learner/server dev",
    "build": "pnpm -r run build",
    "build:web": "pnpm --filter @qwerty-learner/web build",
    "build:server": "pnpm --filter @qwerty-learner/server build",
    "lint": "pnpm --filter @qwerty-learner/web lint",
    "prettier": "prettier --write .",
    "import-dicts": "pnpm --filter @qwerty-learner/server import-dicts",
    "typecheck": "tsc --build"
  },
  "devDependencies": {
    "prettier": "^2.8.8",
    "typescript": "^5.4.0"
  }
}
```

Key changes:

- Added `packageManager` field (enables Corepack to enforce pnpm)
- Added `engines` field
- Added `build:web`, `build:server` individual scripts
- Added `typecheck` script that uses project references

- [ ] **Step 2: Verify typecheck script**

Run: `pnpm typecheck`
Expected: Builds (type-checks) all packages via project references. May show errors if `composite` wasn't added in Task 1 — web and server don't need `composite` since they're leaf packages, only shared needs it.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add packageManager field and engine constraints to root package.json"
```

---

### Task 6: Clean Up Legacy Files

**Files:**

- Delete: `.github/legacy_flows/azure-static-web-apps-red-grass-00ec16f00.yml`
- Delete: `.github/legacy_flows/deploy.yml`
- Delete: `.github/legacy_flows/` (directory)

**Interfaces:**

- Consumes: nothing
- Produces: cleaner repo without dead CI configs

- [ ] **Step 1: Remove legacy workflow directory**

```bash
rm -rf .github/legacy_flows
```

- [ ] **Step 2: Check for other stale root-level files**

Verify these files no longer exist at root (they should already be deleted per git status):

- `.eslintrc.cjs` — moved to `packages/web/`
- `components.json` — moved to `packages/web/`
- `index.html` — moved to `packages/web/`
- `postcss.config.js` — moved to `packages/web/`
- `prettier.config.js` — root prettier uses defaults, web has its own

If any still exist at root AND are duplicated in packages/web, delete the root copy.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove legacy CI configs and stale root files"
```

---

### Task 7: Validate End-to-End and Document

**Files:**

- Modify: `CLAUDE.md` (update Commands section)

**Interfaces:**

- Consumes: all prior tasks
- Produces: updated developer documentation reflecting monorepo commands

- [ ] **Step 1: Run full validation**

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm lint
```

All four must pass. Fix any issues before proceeding.

- [ ] **Step 2: Update CLAUDE.md Commands section**

Replace the Commands section with:

````markdown
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
````

````

- [ ] **Step 3: Verify dev workflow works end-to-end**

```bash
pnpm dev:web
````

Open http://localhost:5173 in browser. Verify the typing interface loads and a dictionary can be selected. Kill the server.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with monorepo commands"
```
