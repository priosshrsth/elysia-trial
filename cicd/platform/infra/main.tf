provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

locals {
  db_url    = "postgresql://postgres:${random_password.db_password.result}@${module.cloud_sql.private_ip_address}:5432/servio_${var.environment}"
  redis_url = "redis://${module.memorystore.host}:${module.memorystore.port}"
}

# Generate DB password once — stable in tfstate, never regenerated unless explicitly replaced
resource "random_password" "db_password" {
  length  = 32
  special = false
}

resource "google_secret_manager_secret" "db_password" {
  project   = var.project_id
  secret_id = "DB_PASSWORD"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result

  lifecycle {
    ignore_changes = [secret_data]
  }
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
    "vpcaccess.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "servicenetworking.googleapis.com",
  ])
  project                    = var.project_id
  service                    = each.key
  disable_dependent_services = false
}

module "networking" {
  source     = "../../modules/gcp/networking"
  project_id = var.project_id
  region     = var.region
  app_name   = var.app_name
  depends_on = [google_project_service.apis]
}

module "artifact_registry" {
  source     = "../../modules/gcp/artifact-registry"
  project_id = var.project_id
  region     = var.region
  app_name   = var.app_name
  depends_on = [google_project_service.apis]
}

module "cloud_sql" {
  source      = "../../modules/gcp/cloud-sql"
  project_id  = var.project_id
  region      = var.region
  app_name    = var.app_name
  environment = var.environment
  tier        = var.cloud_sql_tier
  network_id  = module.networking.network_id
  db_password = random_password.db_password.result
  depends_on  = [google_project_service.apis, module.networking]
}

module "memorystore" {
  source         = "../../modules/gcp/memorystore"
  project_id     = var.project_id
  region         = var.region
  app_name       = var.app_name
  network_id     = module.networking.network_id
  memory_size_gb = var.redis_memory_size
  depends_on     = [google_project_service.apis]
}

module "iam" {
  source      = "../../modules/gcp/iam"
  project_id  = var.project_id
  app_name    = var.app_name
  github_org  = var.github_org
  github_repo = var.github_repo
  depends_on  = [google_project_service.apis]
}

# Connection string secrets — populated here because platform owns the DB/Redis instances
resource "google_secret_manager_secret" "db_url" {
  project   = var.project_id
  secret_id = "DB_URL"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "db_url" {
  secret      = google_secret_manager_secret.db_url.id
  secret_data = local.db_url
}

resource "google_secret_manager_secret" "redis_url" {
  project   = var.project_id
  secret_id = "REDIS_URL"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "redis_url" {
  secret      = google_secret_manager_secret.redis_url.id
  secret_data = local.redis_url
}
