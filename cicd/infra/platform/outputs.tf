output "project_id" {
  value = var.project_id
}

output "region" {
  value = var.region
}

output "app_name" {
  value = var.app_name
}

output "environment" {
  value = var.environment
}

output "artifact_registry_url" {
  value = module.artifact_registry.repository_url
}

output "db_host" {
  value = var.use_managed_db ? module.cloud_sql[0].private_ip_address : module.compute[0].db_internal_ip
}

output "redis_host" {
  value = var.use_managed_redis ? module.memorystore[0].host : module.compute[0].db_internal_ip
}

output "redis_port" {
  value = var.use_managed_redis ? module.memorystore[0].port : 6379
}

output "vpc_connector_id" {
  value = module.networking.vpc_connector_id
}

output "cloud_run_sa_email" {
  value = module.iam.cloud_run_sa_email
}

output "wif_provider" {
  value = module.iam.workload_identity_provider
}

output "github_actions_sa_email" {
  value = module.iam.github_actions_sa_email
}
