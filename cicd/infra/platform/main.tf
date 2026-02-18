provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

locals {
  zone       = "${var.region}-c"
  db_host    = var.use_managed_db ? module.cloud_sql[0].private_ip_address : module.compute[0].db_internal_ip
  redis_host = var.use_managed_redis ? module.memorystore[0].host : module.compute[0].db_internal_ip
  redis_port = var.use_managed_redis ? module.memorystore[0].port : 6379
  db_url     = "postgresql://postgres:${data.google_secret_manager_secret_version.db_password.secret_data}@${local.db_host}:5432/servio_${var.environment}"
  redis_url  = "redis://${local.redis_host}:${local.redis_port}"
}

# Read secrets from Secret Manager (created once during infra:init)
data "google_secret_manager_secret_version" "db_password" {
  secret     = "DB_PASSWORD"
  project    = var.project_id
  depends_on = [google_project_service.apis]
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
  source                         = "../modules/networking"
  project_id                     = var.project_id
  region                         = var.region
  app_name                       = var.app_name
  enable_private_services_access = var.use_managed_db
  depends_on                     = [google_project_service.apis]
}

module "artifact_registry" {
  source     = "../modules/artifact-registry"
  project_id = var.project_id
  region     = var.region
  app_name   = var.app_name
  depends_on = [google_project_service.apis]
}

# VM-based DB + Redis (staging)
module "compute" {
  count        = var.use_managed_db ? 0 : 1
  source       = "../modules/compute"
  project_id   = var.project_id
  region       = var.region
  zone         = local.zone
  app_name     = var.app_name
  machine_type = var.vm_machine_type
  network_id   = module.networking.network_id
  subnet_id    = module.networking.subnet_id
  db_password  = data.google_secret_manager_secret_version.db_password.secret_data
  environment  = var.environment
  depends_on   = [google_project_service.apis]
}

# Cloud SQL PostgreSQL (production)
module "cloud_sql" {
  count       = var.use_managed_db ? 1 : 0
  source      = "../modules/cloud-sql"
  project_id  = var.project_id
  region      = var.region
  app_name    = var.app_name
  environment = var.environment
  tier        = var.cloud_sql_tier
  network_id  = module.networking.network_id
  db_password = data.google_secret_manager_secret_version.db_password.secret_data
  depends_on  = [google_project_service.apis, module.networking]
}

# Memorystore Redis (production)
module "memorystore" {
  count          = var.use_managed_redis ? 1 : 0
  source         = "../modules/memorystore"
  project_id     = var.project_id
  region         = var.region
  app_name       = var.app_name
  network_id     = module.networking.network_id
  memory_size_gb = var.redis_memory_size
  depends_on     = [google_project_service.apis]
}

module "iam" {
  source      = "../modules/iam"
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
  replication { auto {} }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "db_url" {
  secret      = google_secret_manager_secret.db_url.id
  secret_data = local.db_url
}

resource "google_secret_manager_secret" "redis_url" {
  project   = var.project_id
  secret_id = "REDIS_URL"
  replication { auto {} }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "redis_url" {
  secret      = google_secret_manager_secret.redis_url.id
  secret_data = local.redis_url
}

