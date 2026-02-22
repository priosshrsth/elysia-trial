locals {
  artifact_registry_url = "${var.region}-docker.pkg.dev/${var.project_id}/servio"
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

# Cloud Run service
module "cloud_run" {
  source              = "../../../modules/gcp/cloud-run"
  project_id          = var.project_id
  region              = var.region
  app_name            = "api"
  environment         = var.environment
  # Placeholder for initial creation — CI/CD (deploy.yml) manages the actual image via gcloud run deploy
  image               = "us-docker.pkg.dev/cloudrun/container/hello:latest"
  port                = 3001
  min_instances       = 0
  max_instances       = var.environment == "production" ? 2 : 1
  cpu                 = "1"
  memory              = "512Mi"
  service_account     = data.terraform_remote_state.platform.outputs.cloud_run_sa_email
  vpc_connector_id    = data.terraform_remote_state.platform.outputs.vpc_connector_id
}

# API secrets
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
