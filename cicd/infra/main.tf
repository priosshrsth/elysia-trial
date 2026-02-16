locals {
  # resource naming logic
  project_name = var.environment == "preview" ? "${var.app_name}-preview-${var.branch_name}" : "${var.app_name}-${var.environment}"
}

module "project-factory" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 14.5"

  name              = local.project_name
  random_project_id = true
  org_id            = var.org_id
  folder_id         = var.folder_id
  billing_account   = var.billing_account

  activate_apis = [
    "compute.googleapis.com",
    "container.googleapis.com",
    "storage-component.googleapis.com",
  ]
}

provider "google" {
  project = module.project-factory.project_id
  region  = var.region
  zone    = "${var.region}-c"
}

resource "google_compute_network" "vpc_network" {
  name    = "terraform-network"
  project = module.project-factory.project_id
}
