# ADR-0001: pnpm Monorepo as Project Structure

## Status

Accepted

## Context

The project is being transformed from a single-page typing practice app into a multi-phase educational platform. Phase 1 is a word-learning tool; later phases will add an AI server for conversation practice and game-based learning. The codebase currently lives in a flat structure with yarn as the package manager.

A monorepo migration was already started (packages/web, packages/server, packages/shared exist in skeleton form). The question is which package manager to use going forward.

## Decision

Use **pnpm workspaces** with a monorepo structure:

```
/
├── pnpm-workspace.yaml
├── packages/
│   ├── web/          ← existing frontend (React + Vite)
│   ├── server/       ← future AI integration backend
│   └── shared/       ← shared types and utilities
```

## Alternatives Considered

- **yarn workspaces** — lower migration friction (project already uses yarn), but weaker dependency isolation. Phantom dependencies would become a problem as packages grow.
- **Single repo, no workspaces** — simplest for phase 1, but would require painful restructuring when the server package is needed for AI integration.

## Consequences

- Need to replace yarn.lock with pnpm-lock.yaml and add pnpm-workspace.yaml
- All existing dependencies move under packages/web
- Strict dependency isolation means each package must explicitly declare its deps (no hoisting surprises)
- Future AI server work lands cleanly in packages/server without touching the web package's build
