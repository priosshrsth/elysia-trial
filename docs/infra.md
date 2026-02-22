# Infrastructure

This document outlines the infrastructure setup for Servio, managed via Terraform and deployed on Google Cloud Platform (GCP).

## Architecture Overview

The system follows a cloud-native architecture leveraging GCP managed services for scalability and security.

- **Compute**: [Cloud Run](https://cloud.google.com/run) hosting the Bun-based API.
- **Database**: [Cloud SQL](https://cloud.google.com/sql) (PostgreSQL).
- **Cache**: [Memorystore](https://cloud.google.com/memorystore) (Redis).
- **Secrets**: [Google Secret Manager](https://cloud.google.com/secret-manager).
- **Registry**: [Artifact Registry](https://cloud.google.com/artifact-registry) for Docker images.

## Environment Management

We maintain strictly isolated environments (e.g., Staging, Production) using separate GCP projects.

| Feature | Staging | Production |
| :--- | :--- | :--- |
| **GCP Project** | `servio-staging` | `servio-production` |
| **Database** | VM-based Docker (Resource Efficient) | Managed Cloud SQL |
| **Redis** | VM-based Docker (Resource Efficient) | Managed Memorystore |
| **Cloud Run Instances** | Min: 0, Max: 1 | Min: 0, Max: 2 |

## Infrastructure as Code (Terraform)

Infrastructure is managed under `cicd/infra/`.

- `platform/`: Core infrastructure shared across services.
    - VPC Networking & Serverless VPC Access.
    - Cloud SQL Instances & Memorystore.
    - Artifact Registry & IAM (Workload Identity Federation).
- `api/`: Service-specific infrastructure.
    - Cloud Run service configuration.
    - Secret Manager mounts/access.
- `envs/`: Environment-specific variable files (`staging.tfvars`, `production.tfvars`).

## Deployment Pipeline (CI/CD)

Deployments are automated via GitHub Actions (`.github/workflows/deploy.yml`).

1. **Trigger**: Triggered on [GitHub Release](https://github.com/priosshrsth/elysia-trial/releases) publication.
2. **Build**: Docker image is built using `apps/api/Dockerfile` and pushed to Artifact Registry.
3. **Deploy**: 
    - Authenticates via Workload Identity Federation.
    - Deploys to Cloud Run with environment-specific configurations.
    - Updates environment variables and Secret Manager references.

## Secret Management

Secrets are never stored in the repository. They are managed in Google Secret Manager and injected into Cloud Run at runtime.

- **Naming Convention**: `{SECRET_NAME}` (no prefix — each environment has its own GCP project)
- **Required Secrets**: `DB_URL`, `REDIS_URL`, `AUTH_SECRET`, `COOKIE_KEY`, `SMTP_*`.
- `DB_URL` and `REDIS_URL` are managed by the platform Terraform layer automatically.

## Local Development

While the production stack uses GCP, local development is simplified using:
- **Bun**: Local runtime.
- **Docker Compose**: Local Postgres and Redis instances.