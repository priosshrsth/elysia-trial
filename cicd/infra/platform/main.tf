provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

locals {
  zone = "${var.region}-c"
}

# Enable required GCP APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "compute.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "billingbudgets.googleapis.com",
    "vpcaccess.googleapis.com",
  ])
  project                    = var.project_id
  service                    = each.key
  disable_dependent_services = false
}

module "networking" {
  source     = "../modules/networking"
  project_id = var.project_id
  region     = var.region
  app_name   = var.app_name
  depends_on = [google_project_service.apis]
}

module "artifact_registry" {
  source     = "../modules/artifact-registry"
  project_id = var.project_id
  region     = var.region
  app_name   = var.app_name
  depends_on = [google_project_service.apis]
}

module "compute" {
  source       = "../modules/compute"
  project_id   = var.project_id
  region       = var.region
  zone         = local.zone
  app_name     = var.app_name
  machine_type = var.vm_machine_type
  network_id   = module.networking.network_id
  subnet_id    = module.networking.subnet_id
  db_password  = var.db_password
  environments = var.environments
  depends_on   = [google_project_service.apis]
}

module "iam" {
  source      = "../modules/iam"
  project_id  = var.project_id
  app_name    = var.app_name
  github_org  = var.github_org
  github_repo = var.github_repo
  depends_on  = [google_project_service.apis]
}

module "budget" {
  source              = "../modules/budget"
  project_id          = var.project_id
  billing_account     = var.billing_account
  budget_amount       = var.budget_amount
  budget_alert_emails = var.budget_alert_emails
  depends_on          = [google_project_service.apis]
}
