# Turborepo – Bun‑First Full‑Stack Monorepo

This repository is a **Turborepo-based monorepo** built with a **Bun-first mindset**.  
It contains frontend applications, shared packages, and a backend API powered by **Elysia.js**.

The purpose of this repo is to provide a **clean, explicit, and type-safe foundation** for modern full‑stack development—without Node.js compatibility layers.

---

## Repository Structure

```
apps/
  api/        → Backend API (Elysia + Bun)
  web/        → Next.js frontend
  docs/       → Documentation site (Next.js)

packages/
  ui/         → Shared UI components
  ts-config/ → Shared TypeScript configs
```

All apps and packages are written in **TypeScript** and share common linting and formatting rules.

---

## Runtime & Package Management

- **Runtime**: Bun
- **Package manager**: Bun
- **Task runner / orchestration**: Turborepo

This repository intentionally:
- Uses **Bun instead of Node.js**
- Uses **Bun instead of pnpm / npm / yarn**
- Avoids Node compatibility adapters unless strictly required

---

## Backend API

The backend lives in:

```
apps/api
```

It is built with:
- **Elysia.js**
- **Bun runtime**
- **Drizzle ORM**
- **PostgreSQL (Bun native adapter)**
- **Redis / Dragonfly for sessions**

📘 **API documentation & architecture details**  
→ See [`apps/api/README.md`](./apps/api/README.md)

---

## Turborepo & Monorepo Docs

This repository uses Turborepo for:
- Task orchestration
- Build caching
- Dependency graph optimization

📘 **Turborepo-specific documentation**  
→ See [`./turbo-repo.md`](./turbo-repo.md)

---

## Development Philosophy

These principles apply across the entire monorepo:

- Explicit over implicit
- Bun-native over compatibility layers
- Schemas over assumptions
- Modules over monoliths
- Tests alongside production code

Project-specific rules (API schemas, response policies, testing strategy, etc.) are documented **inside each app/package** to avoid duplication.

---

## Getting Started

Install dependencies:

```bash
bun install
```

Run all apps in development mode:

```bash
bun run dev
```

---

## Where to Look Next

- 📘 **API design, auth, schemas, testing**  
  → `apps/api/README.md`

- 📘 **Monorepo & Turborepo details**  
  → `turbo-repo.md`

- 📘 **Frontend & UI docs**  
  → `apps/web` and `packages/ui`

---

This root README is intentionally **high‑level**.  
Detailed, app‑specific documentation lives close to the code it describes.
