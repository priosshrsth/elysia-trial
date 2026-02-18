# Deployment Guide

## Architecture

- **Per-project isolation** — each environment (staging, production) has its own GCP project
- **GCP Cloud Run** — API (Elysia/Bun)
- **Staging** — Compute Engine VM with PostgreSQL 16 + Dragonfly (Redis-compatible)
- **Production** — Cloud SQL (PostgreSQL 16) + Memorystore (Redis)
- **Terraform** — layered: `platform/` (shared infra), `api/` (Cloud Run + secrets)
- **GitHub Actions** — deploy on release (production) or pre-release (staging)

---

## Prerequisites

- Two GCP projects with billing enabled (one for staging, one for production)
- `gcloud` CLI authenticated:
  ```bash
  gcloud auth login
  gcloud auth application-default login
  ```
- `terraform` >= 1.5
- `mise` installed
- Docker running locally (for manual deploys)

## Local Environment Setup

**`.env.local`** (repo root, never committed — Bun loads it automatically):
```bash
GCP_PROJECT_ID=your-project-id
```

Everything else:
- `github_org` / `github_repo` — static defaults in `cicd/infra/platform/variables.tf`, committed, edit once
- `billing_account` / `db_password` — stored in GCP Secret Manager, created during `infra:init`
- `TF_VAR_project_id` — auto-derived from `GCP_PROJECT_ID` by the deploy scripts

---

## Quick Start

Repeat for each environment (staging and production). Set `GCP_PROJECT_ID` in `.env.local` to the target project before running.

```bash
# 1. Bootstrap (creates state bucket, enables APIs, creates secrets, inits Terraform)
#    DB_PASSWORD is only needed here — stored in Secret Manager after this
DB_PASSWORD=your-secure-password mise run infra:init -- staging

# 2. Populate application secrets (AUTH_SECRET, COOKIE_KEY, SMTP_*)
#    See "Managing Secrets" below — DB_URL and REDIS_URL are populated automatically by `mise run deploy`

# 3. Full deploy (platform infra + API infra + DB/Redis secrets + build + Cloud Run)
mise run deploy -- staging
```

> To target a different project without editing `.env.local`, override inline: `GCP_PROJECT_ID=other-project mise run deploy -- production`

---

## Terraform Layers

| Layer | State prefix | What it manages |
|-------|-------------|-----------------|
| `platform` | `platform/` | VPC, VM or Cloud SQL/Memorystore, Artifact Registry, IAM/WIF, budget |
| `api` | `api/` | API Cloud Run service + Secret Manager secrets |

Deploy order: **platform -> api** (platform outputs feed into api via remote state).

```bash
# Each command requires GCP_PROJECT_ID for the target environment
mise run infra:plan -- platform staging     # Preview changes
mise run infra:deploy -- platform staging   # Apply
mise run infra:deploy -- api staging
```

### Environment Configuration

Environment-specific settings live in `cicd/infra/envs/`:

| File | DB | Redis | Notes |
|------|-----|-------|-------|
| `staging.tfvars` | VM (PostgreSQL) | VM (Dragonfly) | Cheapest option, single VM |
| `production.tfvars` | Cloud SQL | Memorystore | Managed services, backups enabled |

---

## Deploying

### Via GitHub Releases (recommended)

Deployments are triggered by GitHub releases:

| Release type | Target environment | Example tag |
|-------------|-------------------|-------------|
| **Release** | `production` | `v1.0.0` |
| **Pre-release** | `staging` | `v1.0.0-rc.1` |

```bash
# Deploy to staging
gh release create v1.0.0-rc.1 --prerelease --target main --title "v1.0.0-rc.1"

# Deploy to production
gh release create v1.0.0 --target main --title "v1.0.0"
```

The workflow builds Docker images, pushes to the environment's Artifact Registry, and deploys to Cloud Run.

### Via CLI (manual)

```bash
# Full deploy (infra + secrets + build + Cloud Run)
mise run deploy -- staging
mise run deploy -- production

# Image-only redeploy (skips Terraform, re-uses existing infra)
mise run deploy:api -- staging
mise run deploy:api -- production
```

---

## Database Migrations

### Local

```bash
mise run gen:migration              # Generate migration files
mise run run:migration              # Run against local DB
```

### Remote (staging only — uses IAP tunnel to VM)

```bash
GCP_PROJECT_ID=your-staging-project-id DB_PASSWORD=your-db-password \
  mise run db:migrate:remote -- staging
```

For production (Cloud SQL), connect via Cloud SQL Auth Proxy or use the Cloud SQL console.

---

## SSH & Debugging

### SSH into the DB VM (staging only)

```bash
GCP_PROJECT_ID=your-staging-project-id mise run ssh:db
```

Once connected:

```bash
docker ps                                          # Check running containers
docker exec -it postgres psql -U postgres          # PostgreSQL shell
docker exec postgres psql -U postgres -c '\l'      # List databases
docker exec dragonfly redis-cli ping               # Check Dragonfly
docker logs postgres --tail 50                     # View logs
```

### Port-forward remote DB locally

```bash
GCP_PROJECT_ID=your-staging-project-id mise run db:tunnel
# Connect to: postgresql://postgres:<password>@localhost:5433/servio_staging
```

### Cloud Run logs

```bash
# API logs (specify the environment's project)
gcloud run services logs read api-staging --region us-central1 --project your-staging-project-id
gcloud run services logs read api-production --region us-central1 --project your-production-project-id
```

---

## Managing Secrets

Secrets are stored in **GCP Secret Manager** within each environment's GCP project. Since environments use separate projects, secret names have no prefix — just `DB_URL`, `AUTH_SECRET`, etc.

### Set/update a secret

```bash
export PROJECT=your-staging-project-id

# Auth
openssl rand -base64 32 | gcloud secrets versions add AUTH_SECRET --data-file=- --project=$PROJECT
echo -n "your-cookie-key" | gcloud secrets versions add COOKIE_KEY --data-file=- --project=$PROJECT

# SMTP
echo -n "smtp.example.com" | gcloud secrets versions add SMTP_HOST --data-file=- --project=$PROJECT
echo -n "587" | gcloud secrets versions add SMTP_PORT --data-file=- --project=$PROJECT
echo -n "user@example.com" | gcloud secrets versions add SMTP_USER --data-file=- --project=$PROJECT
echo -n "smtp-password" | gcloud secrets versions add SMTP_PASS --data-file=- --project=$PROJECT
```

> **Note:** `DB_URL` and `REDIS_URL` are managed by Terraform (platform layer) and populated automatically from the DB/Redis connection details. Do not set them manually.

### After updating a secret

Cloud Run picks up new secret versions on the **next deployment**. To force an immediate update:

```bash
gcloud run services update api-staging --region us-central1 --project your-staging-project-id \
  --update-secrets "AUTH_SECRET=AUTH_SECRET:latest"
```

---

## GitHub Actions Variables

Set in repo **Settings > Secrets and variables > Actions > Variables**:

| Variable | Description |
|----------|-------------|
| `GCP_PROJECT_ID_STAGING` | Staging GCP project ID |
| `GCP_PROJECT_ID_PRODUCTION` | Production GCP project ID |
| `WIF_PROVIDER_STAGING` | `terraform output -raw wif_provider` (from staging project) |
| `WIF_PROVIDER_PRODUCTION` | `terraform output -raw wif_provider` (from production project) |
| `GCP_SA_EMAIL_STAGING` | `terraform output -raw github_actions_sa_email` (from staging project) |
| `GCP_SA_EMAIL_PRODUCTION` | `terraform output -raw github_actions_sa_email` (from production project) |

---

## GitHub Actions Workflows

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `ci.yml` | PR to main | Lint, type-check, test |
| `deploy.yml` | GitHub release published | Build + deploy to production (release) or staging (pre-release) |

---

## Cost Estimates

### Staging (~$20-25/mo)

| Resource | Monthly |
|----------|---------|
| Compute Engine VM (e2-micro) | ~$6 |
| Cloud Run (scale-to-zero) | ~$1-3 |
| VPC Connector (2x e2-micro) | ~$7 |
| Artifact Registry + NAT + misc | ~$2-4 |
| Secret Manager | ~$0.50 |

### Production (~$40-60/mo)

| Resource | Monthly |
|----------|---------|
| Cloud SQL (db-f1-micro) | ~$8-12 |
| Memorystore Redis (1 GB, BASIC) | ~$12-16 |
| Cloud Run (max 2 instances) | ~$3-10 |
| VPC Connector (2x e2-micro) | ~$7 |
| Artifact Registry + NAT + misc | ~$2-4 |
| Secret Manager | ~$0.50 |

---

## mise Commands Reference

```bash
# Database
mise run gen:migration                              # Generate Drizzle migration
mise run run:migration                              # Run migrations locally
mise run db:migrate:remote -- <staging|production>  # Run migrations against remote DB
mise run ssh:db                                     # SSH into DB VM
mise run db:tunnel                                  # Port-forward local 5433 -> remote DB

# Infrastructure (each requires GCP_PROJECT_ID env var)
mise run infra:init -- <staging|production>                  # Bootstrap GCS + APIs + Terraform
mise run infra:plan -- <platform|api> <staging|production>   # Plan Terraform changes
mise run infra:deploy -- <platform|api> <staging|production> # Apply Terraform changes
mise run infra:destroy -- <platform|api> <staging|production># Destroy Terraform layer

# Deploy
mise run deploy -- <staging|production>           # Full deploy (infra + build + Cloud Run)
mise run deploy:api -- <staging|production>        # Image-only redeploy (skips Terraform)
```
