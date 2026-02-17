# Deployment Guide

## Architecture

- **GCP Cloud Run** — API (Servio/Bun) + Web (Next.js standalone)
- **Compute Engine VM** — PostgreSQL 16 + Dragonfly (Redis-compatible)
- **Single GCP project** — environments separated by naming (`api-prod`, `web-staging`, etc.)
- **Terraform** — layered: `platform/` (shared), `api/`, `web/`
- **GitHub Actions** — auto-deploy prod/staging, manual previews

## Prerequisites

- GCP project with billing enabled
- `gcloud` CLI authenticated and **ADC configured**:
  ```bash
  gcloud auth login
  gcloud auth application-default login
  ```
- `terraform` CLI installed (>= 1.5)
- `mise` installed
- Docker running locally (for manual deploys)

## Quick Start

```bash
# 1. Bootstrap (creates state bucket, enables APIs, inits Terraform)
GCP_PROJECT_ID=your-project-id mise run infra:init

# 2. Deploy platform (VPC, VM, Artifact Registry, IAM, budget)
TF_VAR_project_id=your-project-id \
TF_VAR_billing_account=XXXXXX-XXXXXX-XXXXXX \
TF_VAR_github_org=your-org \
TF_VAR_github_repo=servio \
TF_VAR_db_password=your-secure-password \
  mise run infra:deploy -- platform

# 3. Deploy API infrastructure (Cloud Run services + secrets)
TF_VAR_project_id=your-project-id mise run infra:deploy -- api

# 4. Deploy Web infrastructure
TF_VAR_project_id=your-project-id mise run infra:deploy -- web

# 5. Populate secrets in Secret Manager
gcloud secrets versions add api-prod-DB_URL --data-file=- <<< "postgresql://postgres:pass@INTERNAL_IP:5432/servio_prod"
gcloud secrets versions add api-prod-REDIS_URL --data-file=- <<< "redis://INTERNAL_IP:6379"
# ... repeat for all secrets per environment

# 6. Build and deploy apps
GCP_PROJECT_ID=your-project-id mise run deploy:api -- prod
GCP_PROJECT_ID=your-project-id mise run deploy:web -- prod
```

## Terraform Layers

| Layer | State prefix | What it manages |
|-------|-------------|-----------------|
| `platform` | `platform/` | VPC, VM, Artifact Registry, IAM/WIF, budget |
| `api` | `api/` | API Cloud Run services, API secrets |
| `web` | `web/` | Web Cloud Run services |

Deploy order: `platform` -> `api` -> `web` (platform outputs feed into api/web via remote state).

## mise Commands

```bash
mise run infra:init                    # Bootstrap GCS bucket + APIs + Terraform init
mise run infra:plan -- platform        # Plan platform changes
mise run infra:deploy -- platform      # Apply platform infrastructure
mise run infra:deploy -- api           # Apply API infrastructure
mise run infra:deploy -- web           # Apply Web infrastructure

mise run deploy:api -- prod            # Build + deploy API to prod
mise run deploy:web -- staging         # Build + deploy Web to staging
mise run deploy:all                    # Deploy both to prod

mise run preview:create -- 42          # Create preview DB
mise run preview:destroy -- 42         # Cleanup preview environment
```

## GitHub Actions (automatic)

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `ci.yml` | PR to main/staging | Lint, type-check, test |
| `deploy-prod.yml` | Push to main | Build + deploy both apps to prod |
| `deploy-staging.yml` | Push to staging | Build + deploy both apps to staging |
| `deploy-preview.yml` | Manual dispatch | Deploy preview from any branch |
| `destroy-preview.yml` | Manual dispatch | Teardown preview environment |

### Required GitHub Variables

Set in repo Settings > Secrets and variables > Actions > Variables:

- `GCP_PROJECT_ID` — your GCP project ID
- `WIF_PROVIDER` — Workload Identity Federation provider (from `terraform output wif_provider`)
- `GCP_SA_EMAIL` — GitHub Actions SA email (from `terraform output github_actions_sa_email`)
- `API_PROD_URL` — prod API URL (after first deploy)
- `WEB_PROD_URL` — prod Web URL (after first deploy)
- `API_STAGING_URL` / `WEB_STAGING_URL` — staging URLs

## Cost Estimate (~$55-60/mo)

| Resource | Monthly |
|----------|---------|
| Compute Engine VM (e2-small) | ~$15 |
| Cloud Run API prod (min 1) | ~$15 |
| Cloud Run Web prod (min 1) | ~$15 |
| Cloud Run staging (scale to 0) | ~$1-3 |
| VPC Connector (2x f1-micro) | ~$7 |
| Artifact Registry + NAT | ~$2-4 |

Set `min_instances=0` for prod to reduce to ~$25-30/mo (adds cold starts).
