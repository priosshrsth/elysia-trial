locals {
  shared_secrets = ["REDIS_URL", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]

  shared_env_vars = {
    NODE_ENV     = var.environment
    QUEUE_DRIVER = "redis"
    EMAIL_FROM   = var.email_from
  }

  # BETTER_AUTH_BASE_URL and TRUSTED_DOMAINS reference the Cloud Run service URL,
  # so they can't be set in the initial resource definition (circular dependency).
  # They are patched post-creation by the terraform_data resource below.
  api_env_vars = local.shared_env_vars
  api_secrets  = concat(local.shared_secrets, ["DB_URL", "AUTH_SECRET", "COOKIE_KEY"])

  trusted_domains = join(",", concat([module.cloud_run.service_url], var.extra_trusted_domains))
}

provider "google" {
  project = var.project_id
  region  = var.region
}

data "terraform_remote_state" "platform" {
  backend = "gcs"
  config = {
    bucket = "${var.project_id}-terraform-state"
    prefix = "platform"
  }
}

# API Cloud Run service
module "cloud_run" {
  source           = "../../../modules/gcp/cloud-run"
  project_id       = var.project_id
  region           = var.region
  app_name         = "api"
  environment      = var.environment
  image            = "us-docker.pkg.dev/cloudrun/container/hello:latest"
  port             = 3001
  min_instances    = 0
  max_instances    = var.environment == "production" ? 2 : 1
  cpu              = "1"
  memory           = "512Mi"
  service_account  = data.terraform_remote_state.platform.outputs.cloud_run_sa_email
  vpc_connector_id = data.terraform_remote_state.platform.outputs.vpc_connector_id

  env_vars        = local.api_env_vars
  secret_env_vars = local.api_secrets
}

# Worker Cloud Run service — same image, worker entrypoint, no public access
module "cloud_run_worker" {
  source           = "../../../modules/gcp/cloud-run"
  project_id       = var.project_id
  region           = var.region
  app_name         = "api-worker"
  environment      = var.environment
  image            = "us-docker.pkg.dev/cloudrun/container/hello:latest"
  port             = 8080
  min_instances    = 1
  max_instances    = 1
  cpu              = "1"
  memory           = "512Mi"
  allow_public_access = false
  service_account  = data.terraform_remote_state.platform.outputs.cloud_run_sa_email
  vpc_connector_id = data.terraform_remote_state.platform.outputs.vpc_connector_id

  env_vars        = local.shared_env_vars
  secret_env_vars = local.shared_secrets
  command         = ["bun"]
  args            = ["worker.js"]
}

# Migration Cloud Run Job — same image as API, runs after each deploy
resource "google_cloud_run_v2_job" "migration" {
  name                = "api-migration-${var.environment}"
  location            = var.region
  project             = var.project_id
  deletion_protection = false

  template {
    template {
      service_account = data.terraform_remote_state.platform.outputs.cloud_run_sa_email

      vpc_access {
        connector = data.terraform_remote_state.platform.outputs.vpc_connector_id
        egress    = "PRIVATE_RANGES_ONLY"
      }

      containers {
        image   = "us-docker.pkg.dev/cloudrun/container/hello:latest"
        command = ["bun", "migrate.js"]

        dynamic "env" {
          for_each = local.api_env_vars
          content {
            name  = env.key
            value = env.value
          }
        }

        dynamic "env" {
          for_each = local.api_secrets
          content {
            name = env.value
            value_source {
              secret_key_ref {
                secret  = env.value
                version = "latest"
              }
            }
          }
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].template[0].containers[0].image,
    ]
  }
}

# Patch BETTER_AUTH_BASE_URL and TRUSTED_DOMAINS onto the API service after creation.
# These reference the service's own URL, which is only known post-creation.
# triggers_replace ensures this re-runs if the URL or trusted domain list changes.
resource "terraform_data" "api_url_env" {
  depends_on = [module.cloud_run]

  triggers_replace = {
    service_name    = module.cloud_run.service_name
    service_url     = module.cloud_run.service_url
    trusted_domains = local.trusted_domains
  }

  provisioner "local-exec" {
    # ^|^ sets | as the key=value pair separator so commas inside values (TRUSTED_DOMAINS) are preserved
    command = <<-EOT
      gcloud run services update ${module.cloud_run.service_name} \
        --region=${var.region} \
        --project=${var.project_id} \
        "--update-env-vars=^|^BETTER_AUTH_BASE_URL=${module.cloud_run.service_url}|TRUSTED_DOMAINS=${local.trusted_domains}"
    EOT
  }
}

# API secrets (SM containers — values set manually)
# Keep in sync with secret_names in cicd/modules/scripts/secrets.ts
module "secrets" {
  source      = "../../../modules/gcp/secrets"
  project_id  = var.project_id
  app_name    = "api"
  environment = var.environment
  secret_names = [
    "AUTH_SECRET",
    "COOKIE_KEY",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
  ]
}
