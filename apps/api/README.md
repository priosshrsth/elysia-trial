# Elysia Backend (Bun Runtime)

A modern backend built with **Elysia**, **Bun**, **Drizzle ORM**, **PostgreSQL**, and **Redis/Dragonfly**, optimized for type-safety, performance, and modular architecture.

---

## Tech Stack

- **Framework**: Elysia
- **Runtime**: Bun
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Sessions / Cache**: Redis or Dragonfly
- **Testing**: Bun test
- **Validation**: Strict schemas (Zod / Typebox via Elysia)

### Notes on Adapters

- The project runs entirely on the **Bun runtime**
- We **do not** use Node.js adapters or custom database adapters
- PostgreSQL connectivity relies on **Bun’s native Postgres adapter**
- This keeps the stack simpler, faster, and aligned with Bun’s execution model

---

## Getting Started
Install dependencies:

```bash
bun install
```
> Note: you can run this from root folder instead. Better to use 
> [**ni package manager**](https://www.npmjs.com/package/@antfu/ni).

```bash
ni
```

Run the development server:

```bash
bun run dev
```

The server runs on:

```
http://localhost:3001
```

---

## Testing

Run all tests:

```bash
bun test
```

Or via script:

```bash
bun run test
```

> Tests should be written **alongside the endpoint or module** they validate.

---

## Session Management

- Sessions are stored in **Redis or Dragonfly**
- Designed for:
  - Horizontal scaling
  - Cross-domain APIs
  - Header-based authentication (no cookie dependency)
- Auth/session resolution is handled at the API layer, not implicitly via mounted handlers

---

## Development Guidelines

### 1. Configuration

- Prefer the **default Ultracite config** defined at the root of the project
- Avoid overriding configuration unless absolutely necessary
- Consistency > customization

---

### 2. Strict Schemas (Intentional Writes)

- All `create` and `update` operations **must use strict schemas**
- Every field change should be explicit and intentional
- Avoid partial or loosely-typed payloads

Example mindset:
- ❌ “accept anything and ignore extra fields”
- ❌ ```User.create({...request.payload})```
- ✅ “explicitly define what is allowed to change”

---

### 3. Minimal Responses for Mutations

- Do **not** return a response body for `create` or `update` actions unless required
- Prefer:
  - `201 Created`
  - `204 No Content`

This:
- Reduces payload size
- Prevents accidental coupling
- Encourages read-after-write via explicit fetch endpoints

---

### 4. Tests Are Not Optional

- Every endpoint should have tests written **at the same time**
- Tests live close to the module or route they cover
- Focus on:
  - Status codes
  - Auth behavior
  - Schema validation
  - Side effects (DB / Redis)

---

## Modular Elysia Architecture

The codebase is structured to keep Elysia **modular**, **composable**, and **type-safe**.

### Recommended Pattern

- Split the app into **feature-level modules**
- Each module exports its own `Elysia` instance
- Compose modules at the root

Example:

```ts
// users.module.ts
export const usersModule = new Elysia()
  .group('/users', (app) =>
    app.get('/', () => [])
  );
```

```ts
// app.ts
new Elysia()
  .use(usersModule)
  .listen(3001);
```

---

## Global State & Macros (Type-Safe)

### Global State

Use `.state()` for truly global concerns:

```ts
new Elysia()
  .state('globalState', someGlobalState)
```

This allows:
- Global access
- Full type inference across modules

---

### Macros (Auth, Context, Guards)

Macros are used for shared logic like authentication:

```ts
const authPlugin = new Elysia().macro({
  auth: {
    async resolve({ request, status }) {
      // resolve session
    }
  }
})

// auth module
new Elysia()
.use(authPlugin)

// otherMOdule
new Elysia()
.use(authPlugin)
```

> This will allow our module to infer types for macros.
> This might seem unreasonable and redundant. But we have been 
> doing similar approach with nest js when declaring module, decorators and such.

Best practices:
- Macros should be **pure and reusable**
- Return only what downstream routes need
- Keep them framework-agnostic where possible

---

## Design Philosophy

- Explicit over implicit
- Headers over cookies
- Modules over monoliths
- Schemas over assumptions
- Tests alongside code

This repository is intended to be a **clean, intentional foundation** for building serious Bun + Elysia backends.
