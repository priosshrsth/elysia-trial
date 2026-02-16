output "project_id" {
  value = var.project_id
}

output "region" {
  value = var.region
}

output "app_name" {
  value = var.app_name
}

output "artifact_registry_url" {
  value = module.artifact_registry.repository_url
}

output "db_internal_ip" {
  value = module.compute.db_internal_ip
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

output "environments" {
  value = var.environments
}
