# Read shared platform state
data "terraform_remote_state" "platform" {
  backend = "gcs"
  config = {
    bucket = "elysia-terraform-state"
    prefix = "platform"
  }
}

locals {
  platform = data.terraform_remote_state.platform.outputs
}

provider "google" {
  project = var.project_id
  region  = local.platform.region
}

# Cloud Run service per environment
module "cloud_run" {
  source   = "../modules/cloud-run"
  for_each = toset(var.environments)

  project_id       = var.project_id
  region           = local.platform.region
  app_name         = "web"
  environment      = each.key
  image            = "${local.platform.artifact_registry_url}/web:${each.key}-latest"
  vpc_connector_id = local.platform.vpc_connector_id
  service_account  = local.platform.cloud_run_sa_email
  port             = 3000
  min_instances    = each.key == "prod" ? 1 : 0
  max_instances    = each.key == "prod" ? 2 : 1
  cpu              = "1"
  memory           = "512Mi"
}
