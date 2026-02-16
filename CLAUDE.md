# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Turborepo-based Bun-first full-stack monorepo with Elysia.js backend, Next.js frontend, and shared packages. No Node.js compatibility layers.

## Commands

```bash
# Development
bun install              # Install dependencies
bun run dev              # Run all apps in dev mode
bun run build            # Build all apps
bun run tests            # Run all tests
bun run check-types      # Type check all packages

# Linting (Ultracite/Biome)
bun run lint             # Check for issues
bun run lint:fix         # Auto-fix issues

# API-specific (run from apps/api)
bun test                 # Run API tests
bun run migration:generate   # Generate Drizzle migration
bun run migration:run        # Run Drizzle migrations
bun run email            # Preview email templates
```

## Architecture

```
apps/
  api/          # Elysia + Bun backend (port 3001)
  web/          # Next.js 16 frontend
  docs/         # Documentation site

packages/
  ui/           # Shared React components
  types/        # Shared TypeScript types
  emails/       # React Email templates
  ts-config/    # Shared TypeScript configs
```

### Backend Structure (apps/api)

Feature-based modular architecture:
```
src/
  config/       # App configuration
  db/           # Drizzle schema and migrations
  lib/          # Shared utilities (redis, openapi)
  modules/      # Feature modules
    auth/
      http/           # Controllers + e2e tests
      lib/            # Module utilities
      macros/         # Elysia macros (auth guards)
      auth.module.ts  # Module export
    emails/
      email.service.ts
```

**Module Pattern**: Each feature exports an Elysia instance, composed at root:
```ts
// auth.module.ts
export const AuthModule = new Elysia().group('/auth', ...)

// main.ts
new Elysia().use(AuthModule).listen(3001)
```

**Macros**: Used for cross-cutting concerns (auth, guards). Import macro plugin into each module that needs it for type inference.

### Tech Stack

- **Backend**: Elysia.js, Drizzle ORM, PostgreSQL (Bun native), Redis/Dragonfly
- **Frontend**: Next.js 16, React 19
- **Auth**: Better Auth
- **Validation**: Zod schemas
- **Email**: React Email + Nodemailer

## Code Standards

**Linting**: Ultracite (Biome preset) - runs automatically on pre-commit via lefthook.

**Key Rules**:
- No barrel files (index re-exports)
- Prefer `unknown` over `any`
- `for...of` over `.forEach()`
- Arrow functions for callbacks
- React 19: use ref as prop, not `forwardRef`
- Next.js: use `<Image>` component, Server Components for async data

**API Design**:
- Strict schemas for all mutations
- Minimal responses: `201 Created` or `204 No Content` for mutations
- Header-based auth (no cookie dependency)
- Tests alongside endpoints (`.e2e.spec.ts`)

## Engine Requirements

- Node: >=24
- Bun: >=1.3.5
