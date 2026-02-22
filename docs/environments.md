# Environment Setup

This document explains how environments are structured, how environment variables flow, and how each component is configured per environment.

See [architecture.excalidraw](./architecture.excalidraw) for a visual diagram.

---

## Environments Overview

| Environment | Trigger | GCP Project | Cloud Run | Database | Redis | Scaling |
|------------|---------|-------------|-----------|----------|-------|---------|
| **Production** | GitHub Release (e.g., `v1.0.0`) | Dedicated production project | `api-production` | Cloud SQL (`servio_production`) | Memorystore | min 0, max 2 |
| **Staging** | GitHub Pre-release (e.g., `v1.0.0-rc.1`) | Dedicated staging project | `api-staging` | VM (`servio_staging`) | VM (Dragonfly) | min 0, max 1 |
| **Local** | `bun run dev` | N/A | N/A | `servio` (local Docker) | Local Redis | N/A |
| **Test** | `bun run tests` | N/A | N/A | `servio_test` (CI service) | CI Redis | N/A |

Each deployed environment has its own GCP project for billing and log isolation.

---

## Environment Variable Reference

### API (`apps/api`)

Validated by Zod schema in `apps/api/src/config/app.config.ts`.

| Variable | Description | Source | Required |
|----------|-------------|--------|----------|
| `NODE_ENV` | `development` / `test` / `staging` / `production` | Set by deploy workflow | Yes |
| `PORT` | HTTP port (default: 3001) | Set by deploy workflow | No |
| `DB_URL` | PostgreSQL connection string | Secret Manager (deployed) / `.env.local` (local) | Yes |
| `REDIS_URL` | Redis/Dragonfly connection string | Secret Manager (deployed) / `.env.local` (local) | Yes |
| `AUTH_SECRET` | Better Auth signing key (`openssl rand -base64 32`) | Secret Manager | Yes |
| `COOKIE_KEY` | Cookie encryption key | Secret Manager | No |
| `BETTER_AUTH_BASE_URL` | Full API URL (e.g., `https://api-production-xxx.run.app`) | Set dynamically post-deploy | Yes |
| `SMTP_HOST` | SMTP server hostname | Secret Manager | Yes |
| `SMTP_PORT` | SMTP port (typically 587) | Secret Manager | Yes |
| `SMTP_USER` | SMTP username | Secret Manager | Production/staging |
| `SMTP_PASS` | SMTP password | Secret Manager | Production/staging |
| `EMAIL_FROM` | Sender email (default: `noreply@servio.dev`) | Set by deploy workflow | No |

---

## How Variables Flow Per Environment

### Production & Staging

```
GitHub Release (published)
    |
    v
deploy.yml workflow
    |
    |-- ENV = "production" (release) or "staging" (pre-release)
    |-- GCP_PROJECT_ID = per-environment project
    |
    |-- build-deploy-api job:
    |     Sets via --set-env-vars:
    |       NODE_ENV, PORT, EMAIL_FROM
    |     Sets via --update-secrets:
    |       DB_URL, REDIS_URL, AUTH_SECRET, COOKIE_KEY,
    |       SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    |     Post-deploy:
    |       BETTER_AUTH_BASE_URL = API URL
```

### Local Development

Uses `.env.local` in `apps/api/`:

```bash
DB_URL=postgresql://postgres:admin@localhost:5432/servio
REDIS_URL=redis://localhost:6379
BETTER_AUTH_BASE_URL=http://localhost:3001
TRUSTED_DOMAINS=http://localhost:3000,http://localhost:3001
SMTP_HOST=localhost     # Mailhog/MailPit
SMTP_PORT=1025
```

### Test (CI)

Uses `apps/api/.env.test` (tracked in git):

```bash
DB_URL=postgresql://postgres:admin@localhost:5432/servio_test
REDIS_URL=redis://localhost:6379
BETTER_AUTH_BASE_URL=http://localhost:3001
TRUSTED_DOMAINS=http://localhost:3000,http://localhost:3001
SMTP_HOST=localhost
SMTP_PORT=1025
```

CI provides PostgreSQL and Redis as GitHub Actions services.

---

## Secret Manager Naming Convention

Secrets in GCP Secret Manager follow the pattern (within each project):

```
api-<env>-<SECRET_NAME>
```

Examples:
- `api-production-DB_URL` (in production project)
- `api-staging-REDIS_URL` (in staging project)

### Managing secrets

```bash
# List all secrets (specify project)
gcloud secrets list --filter="labels.app=api" --project=your-project-id

# View a secret value
gcloud secrets versions access latest --secret=api-production-DB_URL --project=your-production-project-id

# Update a secret (creates new version)
echo -n "new-value" | gcloud secrets versions add api-production-DB_URL --data-file=- --project=your-production-project-id
```

See [deploy.md](../deploy.md#managing-secrets) for the full list of secrets to populate per environment.

---

## Infrastructure Per Environment

Each environment has its own GCP project with isolated resources.

### Staging Project

Managed by `platform` + `api` Terraform layers with `staging.tfvars`:

- VPC network + subnet + VPC connector
- Compute Engine VM (e2-micro) with PostgreSQL 16 + Dragonfly
- Artifact Registry
- IAM + Workload Identity Federation
- Cloud Run: `api-staging`
- Secret Manager: `api-staging-*`
- Budget alerts

### Production Project

Managed by `platform` + `api` Terraform layers with `production.tfvars`:

- VPC network + subnet + VPC connector + Private Services Access
- Cloud SQL (PostgreSQL 16, db-f1-micro)
- Memorystore Redis (1 GB, BASIC tier)
- Artifact Registry
- IAM + Workload Identity Federation
- Cloud Run: `api-production`
- Secret Manager: `api-production-*`
- Budget alerts

---

## Network Topology

### Staging

```
Internet
    |
    v
Cloud Run (api-staging)
    |  (VPC connector, private ranges only)
    v
VPC Network (10.0.0.0/24)
    |
    |-- VPC Connector (10.8.0.0/28)
    |
    |-- Compute Engine VM (static internal IP)
          |-- PostgreSQL :5432
          |-- Dragonfly  :6379
```

### Production

```
Internet
    |
    v
Cloud Run (api-production)
    |  (VPC connector, private ranges only)
    v
VPC Network (10.0.0.0/24)
    |
    |-- VPC Connector (10.8.0.0/28)
    |
    |-- Cloud SQL (private IP via VPC peering)
    |-- Memorystore Redis (private IP)
```

- Cloud Run reaches databases via VPC connector (private networking)
- Staging VM has no external IP — SSH via IAP tunnel only
- Firewall rules allow ports 5432/6379 from VPC connector and subnet
- Cloud NAT provides outbound internet for the VM
