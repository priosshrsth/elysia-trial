resource "google_redis_instance" "main" {
  name           = "${var.app_name}-redis"
  project        = var.project_id
  region         = var.region
  memory_size_gb = var.memory_size_gb
  tier           = "BASIC"
  redis_version  = "REDIS_7_0"

  authorized_network = var.network_id

  redis_configs = {
    maxmemory-policy = "allkeys-lru"
  }
}
