# Background Jobs

Background jobs are dispatched via BullMQ (Redis-backed) in production and run synchronously in development. The system is built around a single `defineJob` factory that keeps each job self-contained, and a central registry that the worker reads from automatically.

## How it works

```
Call site          Job file           Queue lib          Worker
──────────         ──────────         ──────────         ──────────
welcomeEmailJob    defineJob(         BullMQ Queue   →   BullMQ Worker
  .dispatch(data)    "welcome-email",   (redis mode)       reads registry,
                     handler          )                    calls handler
                   )                  or
                                      handler(data)
                                      (sync mode)
```

**`QUEUE_DRIVER=sync`** (default in development) — `dispatch()` calls the handler directly, no Redis needed.

**`QUEUE_DRIVER=redis`** (production) — `dispatch()` enqueues to BullMQ; the worker service processes it asynchronously.

---

## Files

| Path | Purpose |
|---|---|
| `src/lib/queue.ts` | `defineJob` factory, `JobDefinition` / `Job<T>` types, shared Redis connection |
| `src/jobs/*.job.ts` | One file per job — data interface + `defineJob` call |
| `src/jobs/registry.ts` | Lists every job; the worker reads this |
| `src/worker.ts` | Standalone process — registers one BullMQ Worker per job in the registry |

---

## Types

```ts
// Used by the worker — handler accepts unknown so a JobDefinition[] array can
// hold jobs with different data types without losing type safety at call sites.
interface JobDefinition {
  name: string;
  handler: (data: unknown) => Promise<void>;
}

// Used at call sites — dispatch is fully typed for T.
interface Job<T> extends JobDefinition {
  dispatch: (data: T) => Promise<void>;
}
```

---

## Adding a new job

### 1. Create the job file

```ts
// src/jobs/send-invoice.job.ts
import { defineJob } from "src/lib/queue";

export interface SendInvoiceJobData {
  userId: string;
  invoiceId: string;
}

export const sendInvoiceJob = defineJob<SendInvoiceJobData>(
  "send-invoice",
  async (data) => {
    // do the work
  },
);
```

### 2. Register it

```ts
// src/jobs/registry.ts
import { welcomeEmailJob } from "src/jobs/welcome-email.job";
import { sendInvoiceJob } from "src/jobs/send-invoice.job";   // ← add

export const jobs: JobDefinition[] = [
  welcomeEmailJob,
  sendInvoiceJob,   // ← add
];
```

That's it. The worker picks it up automatically on next deploy. No changes needed to `worker.ts`.

### 3. Dispatch from a module

```ts
import { sendInvoiceJob } from "src/jobs/send-invoice.job";

await sendInvoiceJob.dispatch({ userId, invoiceId });
```

---

## Worker

The worker runs as a separate Cloud Run service (`api-worker-*`). It shares the same Docker image as the API but starts with a different entrypoint (`bun --bun run src/worker.ts`).

The worker only needs `REDIS_URL` and the SMTP secrets — it does not receive `DB_URL`, `AUTH_SECRET`, or any other API-only config.

On startup it iterates `jobs` from the registry and creates one BullMQ `Worker` instance per queue:

```ts
for (const job of jobs) {
  new Worker(job.name, async (queued) => {
    await job.handler(queued.data);
  }, { connection: getConnection() });
}
```

A lightweight Elysia health server on `PORT` is also started so Cloud Run can perform health checks.

---

## Environment variables

| Variable | Values | Default |
|---|---|---|
| `QUEUE_DRIVER` | `sync` \| `redis` | `sync` |
| `REDIS_URL` | Redis connection URL | — |

Set `QUEUE_DRIVER=redis` and provide `REDIS_URL` to enable async processing. In development with `QUEUE_DRIVER=sync`, jobs execute inline — no Redis or worker process required.
